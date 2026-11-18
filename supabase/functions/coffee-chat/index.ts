// Receives a coffee chat request from the studio site, stores it, and
// sends a Telegram message when TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set.
//
// Deployed with --no-verify-jwt: the site posts without a key, so this
// function does its own validation, honeypot check and simple flood limit.

const ALLOWED_ORIGINS = new Set([
  "https://studio-rayeonjin.vercel.app",
  "http://localhost:4321",
  "http://127.0.0.1:4321",
]);

const LIMITS = { name: [1, 60], contact: [3, 120], topic: [10, 2000], preference: [0, 200] } as const;
const LANGS = new Set(["ko", "en", "zh", "es"]);
// At most this many requests in the last hour, across everyone.
const HOURLY_CAP = 20;
// Forms filled in faster than this are treated as bots.
const MIN_FILL_MS = 3000;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TG_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TG_CHAT = Deno.env.get("TELEGRAM_CHAT_ID");

function cors(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://studio-rayeonjin.vercel.app";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}

function reply(status: number, body: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json" },
  });
}

function rest(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.replace(/\r\n/g, "\n").trim() : "";
}

async function notify(row: { id: number; name: string; contact: string; topic: string; preference: string | null; lang: string | null }) {
  if (!TG_TOKEN || !TG_CHAT) return false;
  const text = [
    `☕ 새 커피챗 신청 #${row.id}`,
    `이름: ${row.name}`,
    `연락처: ${row.contact}`,
    row.preference ? `희망 방식·시간: ${row.preference}` : null,
    `언어: ${row.lang ?? "-"}`,
    "",
    row.topic,
  ].filter((line) => line !== null).join("\n");
  const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TG_CHAT, text, disable_web_page_preview: true }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return reply(405, { error: "method" }, origin);
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return reply(403, { error: "origin" }, origin);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply(400, { error: "json" }, origin);
  }

  // Honeypot and fill-time checks: answer "ok" so bots don't learn anything.
  const elapsed = Number(body.elapsed);
  if (clean(body.website) !== "" || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) {
    return reply(200, { ok: true }, origin);
  }

  const row = {
    name: clean(body.name),
    contact: clean(body.contact),
    topic: clean(body.topic),
    preference: clean(body.preference) || null,
    lang: LANGS.has(clean(body.lang)) ? clean(body.lang) : null,
  };
  for (const [field, [min, max]] of Object.entries(LIMITS)) {
    const len = [...((row as Record<string, string | null>)[field] ?? "")].length;
    if (len < min || len > max) return reply(422, { error: "invalid", field }, origin);
  }

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recent = await rest(`coffee_chats?select=id&created_at=gte.${since}`, {
    method: "HEAD",
    headers: { Prefer: "count=exact" },
  });
  const count = Number(recent.headers.get("content-range")?.split("/")[1] ?? 0);
  if (count >= HOURLY_CAP) return reply(429, { error: "busy" }, origin);

  const inserted = await rest("coffee_chats", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row),
  });
  if (!inserted.ok) {
    console.error("insert failed", inserted.status, await inserted.text());
    return reply(500, { error: "store" }, origin);
  }
  const [saved] = await inserted.json();

  try {
    if (await notify(saved)) {
      await rest(`coffee_chats?id=eq.${saved.id}`, { method: "PATCH", body: JSON.stringify({ notified: true }) });
    }
  } catch (err) {
    console.error("telegram failed", err);
  }

  return reply(200, { ok: true }, origin);
});
