// Collects public activity for the Rayeonjin GitHub organization into one JSON
// document for the timeline and dashboard. Run by scripts/build-stats.js from a
// scheduled GitHub Actions workflow. Commit authors are never read or returned.

const ORG = "Rayeonjin";
const API = "https://api.github.com";
const WEEKS = 12;
const TZ_OFFSET_MS = 9 * 60 * 60 * 1000; // Korea Standard Time, no DST

const SITE_REPO = "studio-rayeonjin";

async function gh(path) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "studio-rayeonjin-site",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  // In GitHub Actions this is the workflow's built-in token (1,000 requests/hour).
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) {
    const err = new Error(`GitHub ${res.status} for ${path}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Monday 00:00 KST of the week containing `date`, as a UTC timestamp.
function weekStartKST(date) {
  const kst = new Date(date.getTime() + TZ_OFFSET_MS);
  const day = (kst.getUTCDay() + 6) % 7; // Monday = 0
  const start = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() - day);
  return start - TZ_OFFSET_MS;
}

async function commitsSince(repo, sinceIso) {
  const all = [];
  for (let page = 1; ; page++) {
    const batch = await gh(`/repos/${ORG}/${repo}/commits?since=${sinceIso}&per_page=100&page=${page}`);
    for (const c of batch) {
      // Generated data must never count as development or advance last update.
      if (/^Update dashboard data(?:\n|$)/.test(c.commit.message)) continue;
      all.push(c.commit.committer?.date || c.commit.author?.date);
    }
    if (batch.length < 100) break;
  }
  return all.filter(Boolean);
}

async function tagEvents(repo, limit) {
  const tags = (await gh(`/repos/${ORG}/${repo}/tags?per_page=${limit}`)).slice(0, limit);
  const out = [];
  for (const t of tags) {
    const commit = await gh(`/repos/${ORG}/${repo}/commits/${t.commit.sha}`);
    out.push({
      date: commit.commit.committer?.date || commit.commit.author?.date,
      tag: t.name,
      url: `https://github.com/${ORG}/${repo}/tree/${encodeURIComponent(t.name)}`,
    });
  }
  return out;
}

async function collect() {
  const now = new Date();
  const thisWeek = weekStartKST(now);
  const firstWeek = thisWeek - (WEEKS - 1) * 7 * 864e5;
  const sinceIso = new Date(firstWeek).toISOString();
  const cutoff30 = now.getTime() - 30 * 864e5;

  const repoList = (await gh(`/orgs/${ORG}/repos?type=public&per_page=100&sort=created&direction=asc`))
    .filter((r) => !r.fork && !r.archived && r.name !== ".github");

  const weekly = Array.from({ length: WEEKS }, (_, i) => ({
    weekStart: new Date(firstWeek + i * 7 * 864e5).toISOString(),
    total: 0,
    byRepo: {},
  }));

  const repos = [];
  const timeline = [];
  let commits30 = 0;

  for (const r of repoList) {
    const [releases, commitDates] = await Promise.all([
      gh(`/repos/${ORG}/${r.name}/releases?per_page=100`),
      commitsSince(r.name, sinceIso),
    ]);

    let latest = null;
    let versionCount = releases.length;
    if (releases.length) {
      const rel = releases[0];
      latest = { tag: rel.tag_name, date: rel.published_at, prerelease: rel.prerelease, url: rel.html_url };
      for (const rel2 of releases) {
        timeline.push({
          date: rel2.published_at,
          repo: r.name,
          kind: "release",
          title: rel2.name || rel2.tag_name,
          tag: rel2.tag_name,
          prerelease: rel2.prerelease,
          url: rel2.html_url,
        });
      }
    } else if (r.name !== SITE_REPO) {
      const tags = await tagEvents(r.name, 5);
      versionCount = tags.length;
      if (tags.length) latest = { tag: tags[0].tag, date: tags[0].date, prerelease: /-(qa|beta|rc|alpha)/i.test(tags[0].tag), url: tags[0].url };
      for (const t of tags) {
        timeline.push({ date: t.date, repo: r.name, kind: "tag", title: `${r.name} ${t.tag}`, tag: t.tag, url: t.url });
      }
    }

    // Repository going public, unless its first release already marks that day.
    const firstRelease = releases[releases.length - 1];
    const sameDay = firstRelease && firstRelease.published_at.slice(0, 10) === r.created_at.slice(0, 10);
    if (!sameDay) {
      timeline.push({
        date: r.created_at,
        repo: r.name,
        kind: "created",
        title: r.name === SITE_REPO ? "Studio RAYEONJIN 사이트 공개" : `${r.name} 소스 공개`,
        url: r.html_url,
      });
    }

    for (const iso of commitDates) {
      const t = new Date(iso);
      if (r.name !== SITE_REPO && t.getTime() >= cutoff30 && t <= now) commits30++;
      const idx = Math.floor((weekStartKST(t) - firstWeek) / (7 * 864e5));
      if (r.name !== SITE_REPO && t <= now && idx >= 0 && idx < WEEKS) {
        weekly[idx].total++;
        weekly[idx].byRepo[r.name] = (weekly[idx].byRepo[r.name] || 0) + 1;
      }
    }

    repos.push({
      name: r.name,
      site: r.name === SITE_REPO,
      description: r.description,
      url: r.html_url,
      language: r.language,
      license: r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null,
      createdAt: r.created_at,
      pushedAt: r.name === SITE_REPO
        ? commitDates.reduce((latest, date) => date > latest ? date : latest, r.created_at)
        : r.pushed_at,
      stars: r.stargazers_count,
      openIssues: r.open_issues_count,
      latest,
      versionCount,
    });
  }

  timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    org: ORG,
    generatedAt: now.toISOString(),
    totals: {
      works: repos.filter((r) => !r.site).length,
      versions: repos.reduce((n, r) => n + r.versionCount, 0),
      commits30,
      lastPush: repos.filter((r) => !r.site).reduce((m, r) => (r.pushedAt > m ? r.pushedAt : m), ""),
    },
    weekly,
    repos,
    timeline,
  };
}

module.exports = { collect };
