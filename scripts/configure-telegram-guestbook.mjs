// Uses the existing Supabase CLI session. Never retrieves project API keys or
// Telegram credentials. Temporary setup access is removed even if setup fails.
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const project = process.argv[2];
if (!/^[a-z]{20}$/.test(project || "")) {
  console.error("Usage: node scripts/configure-telegram-guestbook.mjs <project-ref>");
  process.exit(1);
}
const cli = args => {
  // Capture CLI output: never echo command arguments or credentials on failure.
  try { execFileSync("supabase", args, { stdio: ["ignore", "pipe", "pipe"] }); }
  catch (error) {
    const details = String(error.stderr || "").replaceAll(setupSecret, "[redacted]").replaceAll(webhookSecret, "[redacted]");
    throw new Error(`Supabase setup command failed (${error.status ?? "spawn"}): ${details.slice(-1200)}`);
  }
};
const dir = mkdtempSync(join(tmpdir(), "studio-telegram-"));
const envPath = join(dir, "setup.env");
const setupSecret = randomBytes(32).toString("hex");
const webhookSecret = randomBytes(32).toString("hex");
let installed = false;
try {
  writeFileSync(envPath, `TELEGRAM_GUESTBOOK_SETUP_SECRET=${setupSecret}\nTELEGRAM_GUESTBOOK_WEBHOOK_SECRET=${webhookSecret}\n`, { mode: 0o600 });
  cli(["secrets", "set", `--remote=${project}`, "--env-file", envPath, "--yes"]);
  installed = true;
  const res = await fetch(`https://${project}.supabase.co/functions/v1/telegram-guestbook?setup=1`, {
    method: "POST", headers: { "X-Studio-Setup-Token": setupSecret },
  });
  const result = await res.json();
  if (!res.ok || !result.ok) throw new Error(`Telegram setup failed: ${result.error || res.status}${result.chatType ? ` (${result.chatType}, discussion group: ${!!result.hasDiscussionGroup})` : ""}`);
  cli(["secrets", "set", `--remote=${project}`, "TELEGRAM_GUESTBOOK_ENABLED=1",
    `TELEGRAM_GUESTBOOK_ACTIVE_SINCE=${result.activeSince}`, "--yes"]);
  console.log(`Telegram guestbook webhook connected (${result.adminMode}). Public reply instructions are enabled.`);
} finally {
  try {
    if (installed) cli(["secrets", "unset", "TELEGRAM_GUESTBOOK_SETUP_SECRET", `--remote=${project}`, "--yes"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
