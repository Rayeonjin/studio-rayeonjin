// Timeline and dashboard, filled from /api/stats (a Vercel function that reads
// the Rayeonjin GitHub organization and is cached for an hour).
(() => {
  const TZ = "Asia/Seoul";
  const TIMELINE_INITIAL = 5;

  const fmtDate = new Intl.DateTimeFormat("ko-KR", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  const fmtShort = new Intl.DateTimeFormat("ko-KR", { timeZone: TZ, month: "numeric", day: "numeric" });
  const dot = (d) => fmtDate.format(new Date(d)).replace(/\.\s?/g, ".").replace(/\.$/, "");
  const short = (d) => fmtShort.format(new Date(d)).replace(/\.\s?/g, "/").replace(/\/$/, "");

  function relative(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.round(diff / 60000);
    if (min < 1) return "방금";
    if (min < 60) return `${min}분 전`;
    const h = Math.round(min / 60);
    if (h < 24) return `${h}시간 전`;
    const d = Math.round(h / 24);
    return `${d}일 전`;
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
  function renderTimeline(items) {
    const list = document.getElementById("timeline");
    const more = document.getElementById("timeline-more");
    list.replaceChildren();
    if (!items.length) {
      list.append(el("li", { class: "timeline-empty", text: "아직 표시할 기록이 없습니다." }));
      return;
    }
    items.forEach((t, i) => {
      const kindLabel = t.kind === "release" ? (t.prerelease ? "베타 릴리스" : "릴리스")
        : t.kind === "tag" ? "버전 태그" : "공개";
      const title = t.url
        ? el("a", { class: "t-title", href: t.url, text: t.title })
        : el("span", { class: "t-title", text: t.title });
      const li = el("li", { class: `is-${t.kind}` },
        el("time", { datetime: t.date, text: dot(t.date) }),
        el("div", {}, title, el("span", { class: "t-meta", text: `${t.repo} · ${kindLabel}` })));
      if (i >= TIMELINE_INITIAL) li.hidden = true;
      list.append(li);
    });
    if (items.length > TIMELINE_INITIAL) {
      let open = false;
      const sync = () => {
        [...list.children].forEach((li, i) => { li.hidden = !open && i >= TIMELINE_INITIAL; });
        more.textContent = open ? "접기" : `전체 기록 보기 (${items.length})`;
        more.setAttribute("aria-expanded", String(open));
      };
      more.hidden = false;
      more.setAttribute("aria-controls", "timeline");
      more.onclick = () => {
        open = !open;
        sync();
        if (!open) document.getElementById("history").scrollIntoView({ block: "start" });
      };
      sync();
    }
  }

  // ---------- tiles ----------
  function renderTiles(totals) {
    const set = (k, v) => { const n = document.querySelector(`.tile-value[data-k="${k}"]`); if (n) n.replaceChildren(...v); };
    set("works", [String(totals.works), el("small", { text: "개" })]);
    set("versions", [String(totals.versions), el("small", { text: "개" })]);
    set("commits30", [String(totals.commits30), el("small", { text: "회" })]);
    set("lastPush", [totals.lastPush ? relative(totals.lastPush) : "–"]);
  }

  // ---------- chart: weekly commits, one series ----------
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

    const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `최근 12주 주간 커밋 수, 최대 ${max}회` });
    for (let v = 0; v <= top; v += step) {
      svg.append(s("line", { class: "grid", x1: padL, x2: W - padR, y1: y(v), y2: y(v) }));
      const t = s("text", { class: "axis-label", x: padL - 8, y: y(v) + 4, "text-anchor": "end" });
      t.textContent = v;
      svg.append(t);
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
        const t = s("text", { class: "axis-label", x: cx, y: H - 6, "text-anchor": "middle" });
        t.textContent = short(w.weekStart);
        svg.append(t);
      }

      const end = new Date(new Date(w.weekStart).getTime() + 6 * 864e5);
      const breakdown = Object.entries(w.byRepo).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · ");
      const show = () => {
        svg.querySelectorAll(".col.is-active").forEach((n) => n.classList.remove("is-active"));
        g.classList.add("is-active");
        tip.replaceChildren(el("strong", { text: `${short(w.weekStart)} – ${short(end)} · 커밋 ${w.total}회` }), breakdown ? el("span", { text: breakdown }) : el("span", { text: "커밋 없음" }));
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
    tbody.replaceChildren(...weekly.map((w) => el("tr", {}, el("td", { text: dot(w.weekStart) }), el("td", { text: String(w.total) }))));
  }

  // ---------- repo table ----------
  function renderRepos(repos) {
    const tbody = document.querySelector("#repo-table tbody");
    tbody.replaceChildren(...repos.map((r) => {
      const name = el("td", {}, el("a", { href: r.url, text: r.site ? "studio-rayeonjin" : r.name }), r.site ? el("span", { class: "pill", text: "이 사이트" }) : null);
      const ver = r.latest
        ? el("td", {}, el("a", { href: r.latest.url, text: r.latest.tag }), r.latest.prerelease ? el("span", { class: "pill", text: "베타" }) : null)
        : el("td", { class: "muted", text: "–" });
      return el("tr", {},
        name,
        ver,
        el("td", { text: `${dot(r.pushedAt)} (${relative(r.pushedAt)})` }),
        el("td", { text: r.language || "–" }),
        el("td", { class: "num-col", text: String(r.stars) }));
    }));
  }

  function fail() {
    const msg = "GitHub 기록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
    document.getElementById("timeline").replaceChildren(el("li", { class: "timeline-empty", text: msg }));
    document.querySelector("#repo-table tbody").replaceChildren(el("tr", {}, el("td", { colspan: "5", class: "muted", text: msg })));
    document.getElementById("chart").replaceChildren(el("p", { class: "muted", text: msg }));
  }

  fetch("data/stats.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
    .then((d) => {
      renderTimeline(d.timeline || []);
      renderTiles(d.totals);
      renderChart(d.weekly || []);
      // Redraw at the new width so bars keep their pixel size.
      let raf = 0, lastW = 0;
      new ResizeObserver((entries) => {
        const w = Math.round(entries[0].contentRect.width);
        if (w === lastW) return;
        lastW = w;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => renderChart(d.weekly || []));
      }).observe(document.getElementById("chart"));
      renderRepos(d.repos || []);
      const u = document.getElementById("dash-updated");
      if (u && d.generatedAt) u.textContent = `데이터 갱신 ${relative(d.generatedAt)}.`;
    })
    .catch(fail);
})();
