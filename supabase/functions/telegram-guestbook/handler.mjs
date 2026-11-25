// Kept independent of Deno so the complete webhook can be tested without live data.
const MAX_REPLY = 2000;
const id = value => Number.isSafeInteger(Number(value)) && Number(value) > 0;
const respond = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
});

export function createTelegramGuestbook(config, fetcher = fetch) {
  const { supabaseUrl, serviceKey, botToken, chatId, webhookSecret } = config;
  const admins = new Set((config.adminIds || "").split(",").map(s => s.trim()).filter(Boolean));
  let botId;

  async function telegram(method, body) {
    const res = await fetcher(`https://api.telegram.org/bot${botToken}/${method}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error("telegram");
    return data.result;
  }

  async function rest(path, init = {}) {
    const res = await fetcher(`${supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: serviceKey, Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json", ...(init.headers || {}),
      },
    });
    if (!res.ok) throw new Error("database");
    return res.status === 204 ? [] : res.json();
  }

  async function setup() {
    const group = await telegram("getChat", { chat_id: chatId });
    if (!["group", "supergroup", "channel"].includes(group.type)) {
      return respond(409, { error: "unsupported_chat", chatType: group.type });
    }
    if (group.type === "channel" && admins.size) return respond(409, { error: "channel_allowlist_unsupported" });
    const url = `${supabaseUrl}/functions/v1/telegram-guestbook`;
    const existing = await telegram("getWebhookInfo", {});
    // Never replace another integration of this bot.
    if (existing.url && existing.url !== url) return respond(409, { error: "existing_webhook" });
    await telegram("setWebhook", {
      url, secret_token: webhookSecret,
      allowed_updates: ["message", "edited_message", "channel_post", "edited_channel_post"],
      drop_pending_updates: false,
    });
    return respond(200, { ok: true, url,
      adminMode: group.type === "channel" ? "channel_administrators" : admins.size ? "allowlist" : "group_administrators",
      activeSince: config.activeSince || Math.floor(Date.now() / 1000) });
  }

  return async req => {
    if (req.method !== "POST") return respond(405, { error: "method" });
    if (!supabaseUrl || !serviceKey || !botToken || !chatId || !webhookSecret) {
      return respond(503, { error: "configuration" });
    }
    const isSetup = new URL(req.url).searchParams.get("setup") === "1";
    if (isSetup) {
      // A scoped, short-lived setup credential; never ask for a project's API keys.
      if (!config.setupSecret || req.headers.get("X-Studio-Setup-Token") !== config.setupSecret) {
        return respond(401, { error: "auth" });
      }
      try { return await setup(); } catch { return respond(502, { error: "setup_failed" }); }
    }
    if (req.headers.get("X-Telegram-Bot-Api-Secret-Token") !== webhookSecret) {
      return respond(401, { error: "auth" });
    }
    if (!config.enabled) return respond(200, { ok: true });

    let update;
    try { update = await req.json(); } catch { return respond(400, { error: "json" }); }
    if (!Number.isSafeInteger(update?.update_id) || update.update_id < 0) return respond(200, { ok: true });
    const edited = !!(update.edited_message || update.edited_channel_post);
    const channelPost = !!(update.channel_post || update.edited_channel_post);
    const msg = update.message || update.edited_message || update.channel_post || update.edited_channel_post;
    // A channel post is authenticated by Telegram as a post from that channel;
    // only channel administrators with posting permission can create it.
    if (!msg || String(msg.chat?.id) !== String(chatId) || !id(msg.message_id)
      || !msg.reply_to_message || typeof msg.text !== "string") return respond(200, { ok: true });
    // Activating this feature must not publish previously private old replies
    // that happen to be waiting in Telegram's update queue.
    if (config.activeSince && (!Number.isSafeInteger(msg.date) || msg.date < config.activeSince)) {
      return respond(200, { ok: true });
    }
    if (channelPost) {
      if (msg.chat.type !== "channel" || String(msg.sender_chat?.id) !== String(chatId)
        || msg.from?.is_bot || admins.size) return respond(200, { ok: true });
    } else if (!["group", "supergroup"].includes(msg.chat?.type) || !id(msg.from?.id)
      || msg.from.is_bot || msg.sender_chat) return respond(200, { ok: true });

    try {
      if (channelPost) {
        // No personal identity is needed or stored for channel-authored replies.
      } else if (admins.size) {
        if (!admins.has(String(msg.from.id))) return respond(200, { ok: true });
      } else {
        const members = await telegram("getChatAdministrators", { chat_id: chatId });
        if (!members.some(member => member.user?.id === msg.from.id && !member.user.is_bot)) {
          return respond(200, { ok: true });
        }
      }

      const reply = msg.text.replace(/\r\n/g, "\n").trim();
      if (!reply || [...reply].length > MAX_REPLY) return respond(200, { ok: true, ignored: "length" });
      const original = msg.reply_to_message;
      if (!id(original.message_id)) return respond(200, { ok: true });
      let entries = await rest(`guestbook?select=id&status=eq.approved&telegram_chat_id=eq.${encodeURIComponent(chatId)}&telegram_message_id=eq.${original.message_id}`);
      if (!entries.length) {
        // Legacy group replies must target this bot; legacy channel replies
        // must target an original post in the configured channel. Never follow
        // forwarded notifications into another chat or a coffee-chat request.
        const match = /^📖 새 방명록 #(\d+) \(바로 표시됨\)\n/.exec(original.text || "");
        if (original.forward_origin || !match || !id(match[1])) return respond(200, { ok: true });
        if (channelPost) {
          if (String(original.chat?.id) !== String(chatId) || String(original.sender_chat?.id) !== String(chatId)) {
            return respond(200, { ok: true });
          }
        } else {
          if (!botId) botId = (await telegram("getMe", {})).id;
          if (original.from?.id !== botId || !original.from?.is_bot) return respond(200, { ok: true });
        }
        entries = await rest(`guestbook?select=id&status=eq.approved&notified=eq.true&id=eq.${match[1]}`);
      }
      if (!entries.length) return respond(200, { ok: true });
      const guestbookId = entries[0].id;
      const fields = {
        guestbook_id: guestbookId, message: reply, telegram_chat_id: chatId,
        telegram_message_id: msg.message_id, telegram_update_id: update.update_id,
      };
      if (edited) {
        // An edit only changes an existing reply, never publishes an ignored post
        // or restores a hidden reply. Older/out-of-order edits cannot overwrite it.
        await rest(`guestbook_replies?telegram_chat_id=eq.${encodeURIComponent(chatId)}&telegram_message_id=eq.${msg.message_id}&guestbook_id=eq.${guestbookId}&status=eq.approved&telegram_update_id=lt.${update.update_id}`, {
          method: "PATCH", body: JSON.stringify({ message: reply, updated_at: new Date().toISOString(), telegram_update_id: update.update_id }),
        });
      } else {
        await rest("guestbook_replies?on_conflict=telegram_chat_id,telegram_message_id", {
          method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=representation" }, body: JSON.stringify(fields),
        });
      }
      return respond(200, { ok: true });
    } catch {
      // Telegram retries failed deliveries; identifiers make creation idempotent.
      // Never log request bodies or Telegram URLs containing the bot token.
      return respond(503, { error: "retry" });
    }
  };
}
