// Timeline and dashboard, filled from data/stats.json (rebuilt every few hours
// by a GitHub Actions workflow). Text comes from window.I18N and is redrawn
// when the language changes.
(() => {
  const TZ_OFFSET_MS = 9 * 60 * 60 * 1000; // dates are shown in Korea time
  const TIMELINE_INITIAL = 5;

  const I = () => window.I18N;
  const t = (k, vars) => (I() ? I().t(k, vars) : k);
  const lang = () => (I() ? I().lang : "ko");
  const locale = () => (I() ? I().locale : "ko-KR");

  // Calendar parts of a timestamp in Korea time.
  function parts(iso) {
    const d = new Date(new Date(iso).getTime() + TZ_OFFSET_MS);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
  }
  const pad = (n) => String(n).padStart(2, "0");
  // Full date: 2026.11.11 in Korean, ISO 2026-11-11 elsewhere.
  function fullDate(iso) {
    const p = parts(iso);
    return lang() === "ko" ? `${p.y}.${pad(p.m)}.${pad(p.d)}` : `${p.y}-${pad(p.m)}-${pad(p.d)}`;
  }
  // Short date for the chart: day/month in Spanish, month/day otherwise.
  function shortDate(iso) {
    const p = parts(iso);
    return lang() === "es" ? `${p.d}/${p.m}` : `${p.m}/${p.d}`;
  }

  function relative(iso) {
    const sec = (new Date(iso).getTime() - Date.now()) / 1000;
    if (Math.abs(sec) < 60) return t("time.justNow");
    const rtf = new Intl.RelativeTimeFormat(locale(), { numeric: "auto" });
    const min = Math.round(sec / 60);
    if (Math.abs(min) < 60) return rtf.format(min, "minute");
    const h = Math.round(min / 60);
    if (Math.abs(h) < 24) return rtf.format(h, "hour");
    return rtf.format(Math.round(h / 24), "day");
  }

  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    }
    for (const k of kids) if (k != null) n.append(k);
    return n;
  };

  // ---------- timeline ----------
  let timelineOpen = false;

  function eventTitle(e) {
    if (e.kind === "created") return e.repo === "studio-rayeonjin" ? t("created.site") : t("created.repo", { repo: e.repo });
    // GitHub release names are written in Korean; other languages get "Repo vX.Y.Z".
    if (lang() === "ko") return e.title;
    return `${e.repo} ${e.tag || ""}`.trim();
  }

  function eventKind(e) {
    if (e.kind === "release") return t(e.prerelease ? "kind.prerelease" : "kind.release");
    if (e.kind === "tag") return t("kind.tag");
    return t("kind.created");
  }

  function renderTimeline(items) {
    const list = document.getElementById("timeline");
    const more = document.getElementById("timeline-more");
    list.replaceChildren();
    if (!items.length) {
      list.append(el("li", { class: "timeline-empty", text: t("timeline.empty") }));
      more.hidden = true;
      return;
    }
    items.forEach((e) => {
      const title = e.url
        ? el("a", { class: "t-title", href: e.url, text: eventTitle(e) })
        : el("span", { class: "t-title", text: eventTitle(e) });
      list.append(el("li", { class: `is-${e.kind}` },
        el("time", { datetime: e.date, text: fullDate(e.date) }),
        el("div", {}, title, el("span", { class: "t-meta", text: `${e.repo} · ${eventKind(e)}` }))));
    });
    if (items.length <= TIMELINE_INITIAL) { more.hidden = true; return; }
    const sync = () => {
      [...list.children].forEach((li, i) => { li.hidden = !timelineOpen && i >= TIMELINE_INITIAL; });
      more.textContent = timelineOpen ? t("timeline.less") : t("timeline.more", { n: items.length });
      more.setAttribute("aria-expanded", String(timelineOpen));
    };
    more.hidden = false;
    more.setAttribute("aria-controls", "timeline");
    more.onclick = () => {
      timelineOpen = !timelineOpen;
      sync();
      if (!timelineOpen) document.getElementById("history").scrollIntoView({ block: "start" });
    };
    sync();
  }

  // ---------- tiles ----------
  function renderTiles(totals) {
    const set = (k, value, unitKey) => {
      const n = document.querySelector(`.tile-value[data-k="${k}"]`);
      if (!n) return;
      const unit = unitKey ? t(unitKey) : "";
      n.replaceChildren(String(value), ...(unit ? [el("small", { text: unit })] : []));
    };
    set("works", totals.works, "unit.count");
    set("versions", totals.versions, "unit.count");
    set("commits30", totals.commits30, "unit.times");
    set("lastPush", totals.lastPush ? relative(totals.lastPush) : "–");
  }

  // ---------- chart: weekly commits, one series ----------
  function commitsLabel(n) {
    return n === 1 && t("chart.tip1") !== "chart.tip1" ? t("chart.tip1") : t("chart.tip", { n });
  }

  function renderChart(weekly) {
    const host = document.getElementById("chart");
    const tip = document.getElementById("chart-tip");
    const card = host.closest(".chart-card");
    const W = Math.max(280, Math.round(host.clientWidth || 640)), H = 180, padL = 28, padR = 6, padT = 12, padB = 26;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const max = Math.max(1, ...weekly.map((w) => w.total));
    const step = max <= 4 ? 1 : max <= 10 ? 2 : max <= 25 ? 5 : 10;
    const top = Math.ceil(max / step) * step;
    const band = plotW / weekly.length;
    const barW = Math.min(24, band - 6);
    const y = (v) => padT + plotH - (v / top) * plotH;
    const NS = "http://www.w3.org/2000/svg";
    const s = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };

    tip.hidden = true;
    const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": t("chart.aria", { n: max }) });
    for (let v = 0; v <= top; v += step) {
      svg.append(s("line", { class: "grid", x1: padL, x2: W - padR, y1: y(v), y2: y(v) }));
      const label = s("text", { class: "axis-label", x: padL - 8, y: y(v) + 4, "text-anchor": "end" });
      label.textContent = v;
      svg.append(label);
    }

    weekly.forEach((w, i) => {
      const cx = padL + band * i + band / 2;
      const g = s("g", { class: "col", tabindex: "0" });
      if (w.total > 0) {
        const h = Math.max(2, y(0) - y(w.total));
        const x0 = cx - barW / 2, x1 = cx + barW / 2, yb = y(0), yt = yb - h, r = Math.min(4, h, barW / 2);
        // Rounded data-end, square at the baseline.
        g.append(s("path", { class: "bar", d: `M${x0},${yb} V${yt + r} Q${x0},${yt} ${x0 + r},${yt} H${x1 - r} Q${x1},${yt} ${x1},${yt + r} V${yb} Z` }));
      }
      g.append(s("rect", { class: "hit", x: padL + band * i, y: padT, width: band, height: plotH }));
      if (band >= 44 || i % 2 === (weekly.length - 1) % 2) {
        const label = s("text", { class: "axis-label", x: cx, y: H - 6, "text-anchor": "middle" });
        label.textContent = shortDate(w.weekStart);
        svg.append(label);
      }

      const end = new Date(new Date(w.weekStart).getTime() + 6 * 864e5).toISOString();
      const breakdown = Object.entries(w.byRepo).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · ");
      const show = () => {
        svg.querySelectorAll(".col.is-active").forEach((n) => n.classList.remove("is-active"));
        g.classList.add("is-active");
        tip.replaceChildren(
          el("strong", { text: `${shortDate(w.weekStart)} – ${shortDate(end)} · ${commitsLabel(w.total)}` }),
          el("span", { text: breakdown || t("chart.none") }));
        tip.hidden = false;
        const svgBox = svg.getBoundingClientRect(), cardBox = card.getBoundingClientRect();
        const scale = svgBox.width / W;
        let left = svgBox.left - cardBox.left + cx * scale;
        const topPx = svgBox.top - cardBox.top + (w.total ? y(w.total) : y(0)) * scale - 10;
        const half = tip.offsetWidth / 2;
        left = Math.max(half + 8, Math.min(cardBox.width - half - 8, left));
        tip.style.left = `${left}px`;
        tip.style.top = `${topPx}px`;
      };
      const hide = () => { g.classList.remove("is-active"); tip.hidden = true; };
      g.addEventListener("mouseenter", show);
      g.addEventListener("focus", show);
      g.addEventListener("mouseleave", hide);
      g.addEventListener("blur", hide);
      g.addEventListener("click", show);
      svg.append(g);
    });

    svg.append(s("line", { class: "grid", x1: padL, x2: W - padR, y1: y(0), y2: y(0) }));
    host.replaceChildren(svg);

    const tbody = document.querySelector("#chart-table tbody");
    tbody.replaceChildren(...weekly.map((w) => el("tr", {}, el("td", { text: fullDate(w.weekStart) }), el("td", { text: String(w.total) }))));
  }

  // ---------- repo table ----------
  function renderRepos(repos) {
    const tbody = document.querySelector("#repo-table tbody");
    tbody.replaceChildren(...repos.map((r) => {
      const name = el("td", {}, el("a", { href: r.url, text: r.name }), r.site ? el("span", { class: "pill", text: t("repo.thisSite") }) : null);
      const ver = r.latest
        ? el("td", {}, el("a", { href: r.latest.url, text: r.latest.tag }), r.latest.prerelease ? el("span", { class: "pill", text: t("repo.beta") }) : null)
        : el("td", { class: "muted", text: "–" });
      return el("tr", {},
        name,
        ver,
        el("td", { text: `${fullDate(r.pushedAt)} (${relative(r.pushedAt)})` }),
        el("td", { text: r.language || "–" }),
        el("td", { class: "num-col", text: String(r.stars) }));
    }));
  }

  // ---------- state ----------
  let data = null;
  let failed = false;

  function renderAll() {
    if (failed) {
      const msg = t("error.load");
      document.getElementById("timeline").replaceChildren(el("li", { class: "timeline-empty", text: msg }));
      document.querySelector("#repo-table tbody").replaceChildren(el("tr", {}, el("td", { colspan: "5", class: "muted", text: msg })));
      document.getElementById("chart").replaceChildren(el("p", { class: "muted", text: msg }));
      return;
    }
    if (!data) return;
    renderTimeline(data.timeline || []);
    renderTiles(data.totals);
    renderChart(data.weekly || []);
    renderRepos(data.repos || []);
    const u = document.getElementById("dash-updated");
    if (u && data.generatedAt) u.textContent = t("dash.updated", { t: relative(data.generatedAt) });
  }

  document.addEventListener("langchange", renderAll);

  fetch("data/stats.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
    .then((d) => {
      data = d;
      renderAll();
      // Redraw at the new width so bars keep their pixel size.
      let raf = 0, lastW = 0;
      new ResizeObserver((entries) => {
        const w = Math.round(entries[0].contentRect.width);
        if (w === lastW) return;
        lastW = w;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => renderChart(data.weekly || []));
      }).observe(document.getElementById("chart"));
    })
    .catch(() => { failed = true; renderAll(); });
})();
