const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const config = {
  supabaseUrl: 'https://studio.test', serviceKey: 'test-service', botToken: 'test-bot',
  chatId: '-100123', webhookSecret: 'test-webhook', setupSecret: 'test-setup',
  enabled: true,
};
const notification = {
  message_id: 20, from: { id: 999, is_bot: true },
  text: '📖 새 방명록 #7 (바로 표시됨)\n닉네임: 방문자\n언어: ko\n\n반갑습니다.',
};
function payload(overrides = {}) {
  return { update_id: 100, message: {
    message_id: 21, chat: { id: -100123, type: 'supergroup' },
    from: { id: 42, is_bot: false, first_name: 'Private name' },
    text: '들러 주셔서 고맙습니다.\n편안한 하루 보내세요.',
    reply_to_message: structuredClone(notification), ...overrides,
  }};
}
async function fixture(options = {}) {
  const { createTelegramGuestbook } = await import('../supabase/functions/telegram-guestbook/handler.mjs');
  const calls = [], rows = [];
  const fetcher = async (url, init = {}) => {
    calls.push({ url, ...init });
    const body = init.body ? JSON.parse(init.body) : null;
    if (url.includes('api.telegram.org')) {
      const method = url.split('/').at(-1);
      const results = {
        getChatAdministrators: options.nonAdmin ? [{ user: { id: 43 } }] : [{ user: { id: 42, is_bot: false } }],
        getMe: { id: 999 }, getChat: { type: options.chatType || 'supergroup' },
        getWebhookInfo: { url: options.existingWebhook || '' }, setWebhook: true,
      };
      return Response.json({ ok: true, result: results[method] });
    }
    if (options.failDB) return new Response('', { status: 503 });
    const u = new URL(url);
    if (u.pathname.endsWith('/guestbook')) {
      const byNotification = u.searchParams.has('telegram_message_id');
      return Response.json(options.hidden || (options.legacy && byNotification) ? [] : [{ id: 7 }]);
    }
    assert.ok(u.pathname.endsWith('/guestbook_replies'));
    if (init.method === 'POST') {
      assert.match(init.headers.Prefer, /resolution=ignore-duplicates/);
      const exists = rows.find(r => r.telegram_chat_id === body.telegram_chat_id && r.telegram_message_id === body.telegram_message_id);
      if (exists) return Response.json([]);
      rows.push({ ...body, status: 'approved' });
      return Response.json([{ id: 1 }]);
    }
    const row = rows.find(r => String(r.telegram_message_id) === u.searchParams.get('telegram_message_id').slice(3) && r.status === 'approved' && r.telegram_update_id < Number(u.searchParams.get('telegram_update_id').slice(3)));
    if (row) Object.assign(row, body);
    return new Response(null, { status: 204 });
  };
  const handler = createTelegramGuestbook({ ...config, ...(options.config || {}) }, fetcher);
  const send = (data = payload(), headers = {}) => handler(new Request('https://studio.test/functions/v1/telegram-guestbook', {
    method: 'POST', headers: { 'X-Telegram-Bot-Api-Secret-Token': config.webhookSecret, ...headers }, body: JSON.stringify(data),
  }));
  const setup = (headers = {}) => handler(new Request('https://studio.test/functions/v1/telegram-guestbook?setup=1', { method: 'POST', headers }));
  return { handler, send, setup, calls, rows };
}

test('rejects unauthenticated webhook requests before any API call', async () => {
  const f = await fixture();
  assert.equal((await f.send(payload(), { 'X-Telegram-Bot-Api-Secret-Token': 'wrong' })).status, 401);
  assert.equal(f.calls.length, 0);
});
test('fails closed when configuration is incomplete', async () => {
  const f = await fixture({ config: { webhookSecret: undefined } });
  assert.equal((await f.send()).status, 503);
  assert.equal(f.calls.length, 0);
});
test('ignores unrelated chats, bots and anonymous senders', async () => {
  for (const change of [{ chat: { id: -456, type: 'supergroup' } }, { from: { id: 42, is_bot: true } }, { sender_chat: { id: -100123 } }]) {
    const f = await fixture();
    assert.equal((await f.send(payload(change))).status, 200);
    assert.equal(f.calls.length, 0);
  }
});
test('group members without administrator permission cannot publish', async () => {
  const f = await fixture({ nonAdmin: true });
  await f.send();
  assert.equal(f.rows.length, 0);
  assert.ok(f.calls.every(c => c.url.includes('getChatAdministrators')));
});
test('explicit operator allowlist overrides group administrator membership', async () => {
  const f = await fixture({ config: { adminIds: '44,45' } });
  await f.send();
  assert.equal(f.calls.length, 0);
});
test('publishes only the reply content, without Telegram profile information', async () => {
  const f = await fixture();
  assert.equal((await f.send()).status, 200);
  assert.equal(f.rows.length, 1);
  assert.equal(f.rows[0].guestbook_id, 7);
  assert.equal(f.rows[0].message, payload().message.text);
  assert.ok(!JSON.stringify(f.rows).includes('Private name'));
  assert.ok(!Object.hasOwn(f.rows[0], 'user_id'));
});
test('replayed Telegram deliveries create one reply', async () => {
  const f = await fixture();
  await f.send(); await f.send();
  assert.equal(f.rows.length, 1);
});
test('database failures ask Telegram to retry instead of losing the reply', async () => {
  const f = await fixture({ failDB: true });
  assert.equal((await f.send()).status, 503);
});
test('legacy notifications work only when originally sent by this bot', async () => {
  const f = await fixture({ legacy: true });
  await f.send();
  assert.equal(f.rows.length, 1);
  for (const original of [
    { ...notification, from: { id: 123, is_bot: true } },
    { ...notification, forward_origin: { type: 'user' } },
    { ...notification, text: '☕ 새 커피챗 신청 #7\n비공개 연락처' },
  ]) {
    const other = await fixture({ legacy: true });
    await other.send(payload({ reply_to_message: original }));
    assert.equal(other.rows.length, 0);
  }
});
test('hidden or missing guestbook entries cannot receive public replies', async () => {
  const f = await fixture({ hidden: true });
  await f.send();
  assert.equal(f.rows.length, 0);
});
test('rejects empty and oversized replies by Unicode character count', async () => {
  for (const text of ['   ', '😺'.repeat(2001)]) {
    const f = await fixture(); await f.send(payload({ text })); assert.equal(f.rows.length, 0);
  }
  const f = await fixture(); await f.send(payload({ text: '😺'.repeat(2000) })); assert.equal(f.rows.length, 1);
});
test('edits update the existing reply; stale edits cannot overwrite it', async () => {
  const f = await fixture(); await f.send();
  const edit = { update_id: 102, edited_message: payload({ text: '수정된 답글' }).message };
  await f.send(edit); await f.send({ ...edit, update_id: 101, edited_message: { ...edit.edited_message, text: '오래된 답글' } });
  assert.equal(f.rows.length, 1); assert.equal(f.rows[0].message, '수정된 답글');
});
test('editing cannot republish a hidden reply or create a previously ignored reply', async () => {
  const f = await fixture();
  const edit = { update_id: 102, edited_message: payload({ text: '수정' }).message };
  await f.send(edit); assert.equal(f.rows.length, 0);
  await f.send(); f.rows[0].status = 'hidden'; await f.send(edit);
  assert.equal(f.rows[0].status, 'hidden'); assert.equal(f.rows[0].message, payload().message.text);
});
test('setup requires a dedicated credential and refuses another existing webhook', async () => {
  const f = await fixture({ existingWebhook: 'https://another-integration.test/webhook' });
  assert.equal((await f.setup()).status, 401);
  assert.equal(f.calls.length, 0);
  assert.equal((await f.setup({ 'X-Studio-Setup-Token': config.setupSecret })).status, 409);
  assert.ok(!f.calls.some(c => c.url.endsWith('/setWebhook')));
});
test('setup registers only message updates and preserves pending deliveries', async () => {
  const f = await fixture();
  assert.equal((await f.setup({ 'X-Studio-Setup-Token': config.setupSecret })).status, 200);
  const body = JSON.parse(f.calls.find(c => c.url.endsWith('/setWebhook')).body);
  assert.deepEqual(body.allowed_updates, ['message', 'edited_message', 'channel_post', 'edited_channel_post']);
  assert.equal(body.drop_pending_updates, false);
  assert.equal(body.secret_token, config.webhookSecret);
});

test('guestbook GET selects public reply fields and excludes hidden replies and Telegram IDs', async () => {
  let handler, query;
  const source = stripTypeScriptTypes(readFileSync('supabase/functions/guestbook/index.ts', 'utf8'));
  vm.runInNewContext(source, {
    Deno: { env: { get: name => ({ SUPABASE_URL: config.supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: config.serviceKey })[name] }, serve: fn => { handler = fn; } },
    Response, console, fetch: async url => { query = new URL(url); return Response.json([{ id: 7, nickname: '방문자', message: '안녕하세요', created_at: '2026-11-25T00:00:00Z', replies: [] }]); },
  });
  const response = await handler(new Request('https://studio.test/guestbook'));
  assert.equal(response.status, 200);
  assert.equal(query.searchParams.get('replies.status'), 'eq.approved');
  assert.equal(query.searchParams.get('status'), 'eq.approved');
  assert.equal(query.searchParams.get('select'), 'id,nickname,message,created_at,replies:guestbook_replies(id,message,created_at)');
  assert.ok(!JSON.stringify(await response.json()).includes('telegram'));
});

function channelPayload(overrides = {}) {
  return { update_id: 200, channel_post: {
    message_id: 30, chat: { id: -100123, type: 'channel' }, sender_chat: { id: -100123, type: 'channel' },
    text: '채널에서 작성한 스튜디오 답글',
    reply_to_message: { ...notification, chat: { id: -100123, type: 'channel' }, sender_chat: { id: -100123, type: 'channel' } },
    ...overrides,
  }};
}
test('channel administrators can reply directly without a discussion group', async () => {
  const f = await fixture({ chatType: 'channel' });
  assert.equal((await f.send(channelPayload())).status, 200);
  assert.equal(f.rows.length, 1);
  assert.ok(!f.calls.some(c => c.url.includes('getChatAdministrators')));
  assert.ok(!JSON.stringify(f.rows).includes('sender_chat'));
});
test('channel replies cannot impersonate another channel or arrive as group messages', async () => {
  for (const change of [{ sender_chat: { id: -999 } }, { chat: { id: -100123, type: 'supergroup' } }]) {
    const f = await fixture(); await f.send(channelPayload(change)); assert.equal(f.calls.length, 0);
  }
});
test('legacy channel posts connect only within the same configured channel', async () => {
  const f = await fixture({ legacy: true }); await f.send(channelPayload()); assert.equal(f.rows.length, 1);
  const other = await fixture({ legacy: true });
  const data = channelPayload(); data.channel_post.reply_to_message.chat.id = -999;
  await other.send(data); assert.equal(other.rows.length, 0);
});
test('channel edits update the original reply', async () => {
  const f = await fixture(); await f.send(channelPayload());
  await f.send({ update_id: 201, edited_channel_post: channelPayload({ text: '수정된 채널 답글' }).channel_post });
  assert.equal(f.rows.length, 1); assert.equal(f.rows[0].message, '수정된 채널 답글');
});
test('channel setup does not require a discussion group', async () => {
  const f = await fixture({ chatType: 'channel' });
  const response = await f.setup({ 'X-Studio-Setup-Token': config.setupSecret });
  assert.equal(response.status, 200); assert.equal((await response.json()).adminMode, 'channel_administrators');
});
test('channel setup refuses a personal allowlist it cannot verify', async () => {
  const f = await fixture({ chatType: 'channel', config: { adminIds: '42' } });
  assert.equal((await f.setup({ 'X-Studio-Setup-Token': config.setupSecret })).status, 409);
  assert.ok(!f.calls.some(c => c.url.endsWith('/setWebhook')));
});

test('activation never publishes private replies already waiting in the Telegram queue', async () => {
  const inactive = await fixture({ config: { enabled: false } });
  await inactive.send(channelPayload()); assert.equal(inactive.calls.length, 0);
  const f = await fixture({ config: { activeSince: 1000 } });
  await f.send(channelPayload({ date: 999 })); assert.equal(f.calls.length, 0);
  await f.send(channelPayload({ date: 1001 })); assert.equal(f.rows.length, 1);
});
