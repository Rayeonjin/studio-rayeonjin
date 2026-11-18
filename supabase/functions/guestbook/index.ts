// Guestbook for the studio site.
//   GET  -> the latest approved entries (nickname, message, date only)
//   POST -> stores a new entry (shown right away) and tells the Telegram channel
//
// Deployed with --no-verify-jwt: the site calls it without a key, so this
// function does its own validation, honeypot check and simple flood limit.

const ALLOWED_ORIGINS = new Set([
  "https://studio-rayeonjin.vercel.app",
  "http://localhost:4321",
  "http://127.0.0.1:4321",
]);

const LIMITS = { nickname: [1, 30], message: [2, 300] } as const;
const LANGS = new Set(["ko", "en", "zh", "es"]);
const LIST_SIZE = 50;
// At most this many new entries in the last hour, across everyone.
const HOURLY_CAP = 30;
// Forms filled in faster than this are treated as bots.
const MIN_FILL_MS = 3000;
// Links are the usual spam payload; the guestbook takes plain text only.
const LINK = /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|io|kr|cn|ru|xyz|top|me|co)\b)/i;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TG_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TG_CHAT = Deno.env.get("TELEGRAM_CHAT_ID");

function cors(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://studio-rayeonjin.vercel.app";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}

function reply(status: number, body: unknown, origin: string | null, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json", ...extra },
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
  return typeof value === "string" ? value.replace(/\r\n/g, "\n").replace(/\s+\n/g, "\n").trim() : "";
}

async function notify(row: { id: number; nickname: string; message: string; lang: string | null }) {
  if (!TG_TOKEN || !TG_CHAT) return false;
  const text = [
    `📖 새 방명록 #${row.id} (바로 표시됨)`,
    `닉네임: ${row.nickname}`,
    `언어: ${row.lang ?? "-"}`,
    "",
    row.message,
    "",
    "내리려면 Supabase의 guestbook 표에서 이 글의 status를 hidden으로 바꿔 주세요.",
  ].join("\n");
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
  if (origin && !ALLOWED_ORIGINS.has(origin)) return reply(403, { error: "origin" }, origin);

  if (req.method === "GET") {
    const res = await rest(
      `guestbook?select=id,nickname,message,created_at&status=eq.approved&order=created_at.desc&limit=${LIST_SIZE}`,
    );
    if (!res.ok) {
      console.error("list failed", res.status, await res.text());
      return reply(500, { error: "load" }, origin);
    }
    return reply(200, { entries: await res.json() }, origin, { "Cache-Control": "no-store" });
  }

  if (req.method !== "POST") return reply(405, { error: "method" }, origin);
  if (!origin) return reply(403, { error: "origin" }, origin);

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
    nickname: clean(body.nickname).replace(/\s+/g, " "),
    message: clean(body.message),
    lang: LANGS.has(clean(body.lang)) ? clean(body.lang) : null,
  };
  for (const [field, [min, max]] of Object.entries(LIMITS)) {
    const len = [...(row as Record<string, string>)[field]].length;
    if (len < min || len > max) return reply(422, { error: "invalid", field }, origin);
  }
  if (LINK.test(row.nickname) || LINK.test(row.message)) return reply(422, { error: "links" }, origin);

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recent = await rest(`guestbook?select=id&created_at=gte.${since}`, {
    method: "HEAD",
    headers: { Prefer: "count=exact" },
  });
  const count = Number(recent.headers.get("content-range")?.split("/")[1] ?? 0);
  if (count >= HOURLY_CAP) return reply(429, { error: "busy" }, origin);

  const inserted = await rest("guestbook", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...row, status: "approved" }),
  });
  if (!inserted.ok) {
    console.error("insert failed", inserted.status, await inserted.text());
    return reply(500, { error: "store" }, origin);
  }
  const [saved] = await inserted.json();

  try {
    if (await notify(saved)) {
      await rest(`guestbook?id=eq.${saved.id}`, { method: "PATCH", body: JSON.stringify({ notified: true }) });
    }
  } catch (err) {
    console.error("telegram failed", err);
  }

  return reply(200, { ok: true }, origin);
});
