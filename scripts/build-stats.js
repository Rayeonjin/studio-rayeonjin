// Writes data/stats.json. Leaves the file untouched when nothing but the
// timestamp would change, so the scheduled workflow only commits real updates.
const fs = require("fs");
const path = require("path");
const { collect } = require("./collect-stats.js");

const OUT = path.join(__dirname, "..", "data", "stats.json");
const strip = (d) => JSON.stringify({ ...d, generatedAt: null });

collect()
  .then((data) => {
    let prev = null;
    try { prev = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch {}
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
