import { createTelegramGuestbook } from "./handler.mjs";

Deno.serve(createTelegramGuestbook({
  supabaseUrl: Deno.env.get("SUPABASE_URL"),
  serviceKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  botToken: Deno.env.get("TELEGRAM_BOT_TOKEN"),
  chatId: Deno.env.get("TELEGRAM_CHAT_ID"),
  webhookSecret: Deno.env.get("TELEGRAM_GUESTBOOK_WEBHOOK_SECRET"),
  setupSecret: Deno.env.get("TELEGRAM_GUESTBOOK_SETUP_SECRET"),
  adminIds: Deno.env.get("TELEGRAM_ADMIN_USER_IDS"),
  enabled: Deno.env.get("TELEGRAM_GUESTBOOK_ENABLED") === "1",
  activeSince: Number(Deno.env.get("TELEGRAM_GUESTBOOK_ACTIVE_SINCE") || 0),
}));
