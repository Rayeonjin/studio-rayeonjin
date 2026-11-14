// Writes data/stats.json and feed.xml (RSS 2.0). Leaves both untouched when
// nothing but the timestamp would change, so the scheduled workflow only
// commits real updates.
const fs = require("fs");
const path = require("path");
const { collect } = require("./collect-stats.js");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "data", "stats.json");
const FEED = path.join(ROOT, "feed.xml");
const SITE = "https://studio-rayeonjin.vercel.app/";
const strip = (d) => JSON.stringify({ ...d, generatedAt: null });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function feedTitle(e) {
  if (e.kind === "created") return e.repo === "studio-rayeonjin" ? "Studio RAYEONJIN 사이트 공개" : `${e.repo} 소스 공개`;
  return e.title;
}

function kindLabel(e) {
  if (e.kind === "release") return e.prerelease ? "사전 공개 릴리스 · Prerelease" : "릴리스 · Release";
  if (e.kind === "tag") return "버전 태그 · Version tag";
  return "공개 · Launch";
}

function buildFeed(data) {
  const items = data.timeline.slice(0, 50).map((e) => `    <item>
      <title>${esc(feedTitle(e))}</title>
      <link>${esc(e.kind === "created" && e.repo === "studio-rayeonjin" ? SITE : e.url || SITE)}</link>
      <guid isPermaLink="false">${esc(`${e.repo}:${e.kind}:${e.tag || e.date}`)}</guid>
      <pubDate>${new Date(e.date).toUTCString()}</pubDate>
      <category>${esc(e.repo)}</category>
      <description>${esc(`${e.repo} · ${kindLabel(e)}`)}</description>
    </item>`).join("\n");
  const last = data.timeline[0] ? new Date(data.timeline[0].date).toUTCString() : new Date().toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Studio RAYEONJIN</title>
    <link>${SITE}</link>
    <atom:link href="${SITE}feed.xml" rel="self" type="application/rss+xml"/>
    <description>Studio RAYEONJIN의 새 작업과 릴리스 소식 · Releases and launches from Studio RAYEONJIN</description>
    <language>ko</language>
    <lastBuildDate>${last}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

collect()
  .then((data) => {
    let prev = null;
    try { prev = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch {}
    const feed = buildFeed(data);
    let feedPrev = null;
    try { feedPrev = fs.readFileSync(FEED, "utf8"); } catch {}
    if (feedPrev !== feed) {
      fs.writeFileSync(FEED, feed);
      console.log("feed written");
    }
    if (prev && strip(prev) === strip(data)) {
      console.log("stats unchanged");
      return;
    }
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
    console.log(`stats written: ${data.timeline.length} timeline items, ${data.totals.commits30} commits in 30 days`);
  })
  .catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
