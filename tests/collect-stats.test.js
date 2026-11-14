const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../scripts/collect-stats.js'), 'utf8');

function collector({ automatic = false, pages = false } = {}) {
  const now = new Date();
  const date = new Date(now - 3600000).toISOString();
  const autoDate = new Date(now - 1000).toISOString();
  const commit = (message, timestamp = date) => ({ commit: { message, committer: { date: timestamp } } });
  const repos = ['App', 'studio-rayeonjin'].map(name => ({
    name, created_at: date, pushed_at: name === 'App' ? date : autoDate,
    html_url: `https://github.com/Rayeonjin/${name}`, stargazers_count: 0,
  }));
  const context = { module: { exports: {} }, process: { env: {} }, fetch: async url => {
    const path = new URL(url);
    let body;
    if (path.pathname.includes('/orgs/')) body = repos;
    else if (path.pathname.endsWith('/releases')) body = [];
    else if (path.pathname.endsWith('/tags')) body = [];
    else if (path.pathname.endsWith('/commits')) {
      const site = path.pathname.includes('/studio-rayeonjin/');
      const page = Number(path.searchParams.get('page'));
      body = site ? [commit('Improve layout'), ...(automatic ? [commit('Update dashboard data', autoDate)] : [])]
        : pages ? Array.from({ length: page <= 3 ? 100 : 1 }, () => commit('Improve app'))
        : [commit('Improve app'), commit('Update dashboard data', autoDate)];
    } else throw new Error(`Unexpected request: ${url}`);
    return { ok: true, json: async () => body };
  }};
  vm.runInNewContext(source, context);
  return context.module.exports.collect();
}

test('app totals exclude website activity and generated commits', async () => {
  const data = await collector();
  assert.equal(data.totals.commits30, 1);
  assert.equal(data.weekly.reduce((n, w) => n + w.total, 0), 1);
  assert.equal(data.totals.lastPush, data.repos.find(r => !r.site).pushedAt);
  assert.ok(data.weekly.every(w => !('studio-rayeonjin' in w.byRepo)));
});

test('a new generated commit does not advance the website update date', async () => {
  const data = await collector({ automatic: true });
  assert.equal(data.repos.find(r => r.site).pushedAt, data.repos.find(r => !r.site).pushedAt);
});

test('commit history is not truncated at 300 commits', async () => {
  const data = await collector({ pages: true });
  assert.equal(data.totals.commits30, 301);
});
