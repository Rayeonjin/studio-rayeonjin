// Page translations. Korean is the source text in index.html and is read from
// the page on load; other languages replace it. Values may contain the same
// inline markup the page uses (<br class="w">, <a>, <span class="nw">).
(() => {
  const LANGS = ["ko", "en", "zh", "es"];
  const HTML_LANG = { ko: "ko", en: "en", zh: "zh-Hans", es: "es" };
  const LOCALE = { ko: "ko-KR", en: "en-US", zh: "zh-CN", es: "es-ES" };
  const TG = '<a href="https://t.me/Rayeonjin">Telegram</a>';
  const BR = '<br class="w"> ';

  // Strings used only by scripts (dashboard, theme button). Korean included.
  const SCRIPT = {
    ko: {
      "a11y.toDark": "다크 모드로 바꾸기",
      "a11y.toLight": "라이트 모드로 바꾸기",
      "unit.count": "개",
      "unit.times": "회",
      "kind.release": "릴리스",
      "kind.prerelease": "베타 릴리스",
      "kind.tag": "버전 태그",
      "kind.created": "공개",
      "created.site": "Studio RAYEONJIN 사이트 공개",
      "created.repo": "{repo} 소스 공개",
      "timeline.more": "전체 기록 보기 ({n})",
      "timeline.less": "접기",
      "timeline.empty": "아직 표시할 기록이 없습니다.",
      "error.load": "GitHub 기록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      "chart.aria": "최근 12주 주간 커밋 수, 최대 {n}회",
      "chart.tip": "커밋 {n}회",
      "chart.none": "커밋 없음",
      "repo.thisSite": "이 사이트",
      "repo.beta": "베타",
      "dash.updated": "데이터 갱신 {t}.",
      "time.justNow": "방금",
    },
    en: {
      "a11y.toDark": "Switch to dark mode",
      "a11y.toLight": "Switch to light mode",
      "unit.count": "",
      "unit.times": "",
      "kind.release": "Release",
      "kind.prerelease": "Beta release",
      "kind.tag": "Version tag",
      "kind.created": "Launch",
      "created.site": "Studio RAYEONJIN website launched",
      "created.repo": "{repo} source code published",
      "timeline.more": "Show full history ({n})",
      "timeline.less": "Show less",
      "timeline.empty": "Nothing here yet.",
      "error.load": "Couldn’t load data from GitHub. Please try again later.",
      "chart.aria": "Weekly commits over the last 12 weeks, peaking at {n}",
      "chart.tip": "{n} commits",
      "chart.tip1": "1 commit",
      "chart.none": "No commits",
      "repo.thisSite": "this site",
      "repo.beta": "beta",
      "dash.updated": "Data refreshed {t}.",
      "time.justNow": "just now",
    },
    zh: {
      "a11y.toDark": "切换到深色模式",
      "a11y.toLight": "切换到浅色模式",
      "unit.count": "个",
      "unit.times": "次",
      "kind.release": "正式版发布",
      "kind.prerelease": "测试版发布",
      "kind.tag": "版本标签",
      "kind.created": "首次公开",
      "created.site": "Studio RAYEONJIN 网站上线",
      "created.repo": "{repo} 源代码公开",
      "timeline.more": "查看全部记录（{n}）",
      "timeline.less": "收起",
      "timeline.empty": "暂无记录。",
      "error.load": "无法加载 GitHub 数据，请稍后再试。",
      "chart.aria": "最近 12 周的每周提交次数，最多 {n} 次",
      "chart.tip": "提交 {n} 次",
      "chart.none": "无提交",
      "repo.thisSite": "本站",
      "repo.beta": "测试版",
      "dash.updated": "数据更新于{t}。",
      "time.justNow": "刚刚",
    },
    es: {
      "a11y.toDark": "Cambiar a modo oscuro",
      "a11y.toLight": "Cambiar a modo claro",
      "unit.count": "",
      "unit.times": "",
      "kind.release": "Versión",
      "kind.prerelease": "Versión beta",
      "kind.tag": "Etiqueta de versión",
      "kind.created": "Lanzamiento",
      "created.site": "Lanzamiento del sitio de Studio RAYEONJIN",
      "created.repo": "Se publica el código fuente de {repo}",
      "timeline.more": "Ver historial completo ({n})",
      "timeline.less": "Ver menos",
      "timeline.empty": "Todavía no hay nada que mostrar.",
      "error.load": "No se pudieron cargar los datos de GitHub. Inténtalo de nuevo más tarde.",
      "chart.aria": "Commits por semana en las últimas 12 semanas, con un máximo de {n}",
      "chart.tip": "{n} commits",
      "chart.tip1": "1 commit",
      "chart.none": "Sin commits",
      "repo.thisSite": "este sitio",
      "repo.beta": "beta",
      "dash.updated": "Datos actualizados {t}.",
      "time.justNow": "hace un momento",
    },
  };

  // Page strings for languages other than Korean.
  const PAGE = {
    en: {
      "meta.description": "The small apps from Studio RAYEONJIN: everyday tools built to last, with their source code out in the open.",
      "a11y.home": "Studio RAYEONJIN home",
      "a11y.mainMenu": "Main menu",
      "a11y.language": "Language",
      "a11y.externalLinks": "External links",
      "nav.about": "About",
      "nav.works": "Work",
      "nav.dashboard": "Activity",
      "nav.history": "History",
      "nav.faq": "FAQ",
      "hero.title": "Small, kind<br>software.",
      "hero.tagline": "",
      "hero.lede": `This is where Studio RAYEONJIN’s apps live.${BR}Everyday tools, made one at a time and built to last.${BR}For now it’s mostly macOS apps. Work for other platforms will show up here when it’s ready.`,
      "shelf.label": "Apps",
      "shelf.catoshi": "Menu-bar cat with BTC prices",
      "shelf.uncomew": "Find what’s taking up space",
      "shelf.memo": "Notes that link to each other",
      "about.title": "Studio RAYEONJIN",
      "about.p1": `Every app here starts from a real, everyday need.${BR}Each one is used and refined day to day before it’s shared with anyone who needs the same thing.`,
      "about.why": `The reason the source is public is simple:${BR}nobody with the same need should have to burn time and effort on the same <span class="nw">trial and error</span>.${BR}Put that time into a different problem instead, and if you share what you build too, all the better.`,
      "about.p2": `If one fits what you need, it’s yours to use.${BR}Feedback is always welcome on ${TG}, and every message gets read.`,
      "works.title": "Work",
      "works.macNote": `macOS apps are shared as source code rather than ready-made installers.${BR}You build and install them on your own Mac with Apple’s free developer tools.${BR}Never done it before? Each app’s install guide walks you through it.`,
      "catoshi.altBar": "The Catoshi cat sitting in the macOS menu bar next to the BTC price and the Kimchi premium",
      "catoshi.altPanel": "The Catoshi price panel opened from the menu bar, showing Binance and Upbit prices and the Kimchi premium",
      "catoshi.shotNote": "Shown with simulated prices.",
      "catoshi.showPanel": "Show the price panel",
      "catoshi.tagline": "A little cat that lives in your menu bar.",
      "catoshi.desc": `A tiny cat that strolls across your menu bar and sometimes settles into a loaf.${BR}Alongside it, keep an eye on the BTC price, the Kimchi premium${BR}and where the market is heading.${BR}No exchange account or API key needed.`,
      "catoshi.license": 'Non-commercial personal use <span class="nw">(Catoshi Community License)</span>',
      "common.installGuide": "Install guide",
      "common.loading": "Loading…",
      "uncomew.tagline": "Find what’s taking up space.",
      "uncomew.desc": `When your Mac runs low on storage, find the large files and folders hiding on it and see what they’re for.${BR}Check apps by size and when you last used them before deciding what to clear out.${BR}Nothing is deleted automatically and the Trash is never emptied for you. You make the final call.`,
      "memo.status": "In development",
      "memo.tagline": "Local-first notes for macOS.",
      "memo.desc": `Notes for jotting things down fast and linking them together later.${BR}Markdown is there when you want it,${BR}and if you like, a local AI can surface connections between your ideas.${BR}The app doesn’t alter your original text on its own.`,
      "next.title": "More on the way",
      "next.body": `New apps and work for other platforms will be posted here as they’re ready.${BR}News goes out on GitHub and Telegram first.`,
      "next.link": "Follow on Telegram",
      "dash.title": "Activity",
      "dash.lede": "The figures below come from public GitHub repositories and refresh every 3 hours.",
      "dash.tileWorks": "Published apps",
      "dash.tileVersions": "Published versions",
      "dash.tileCommits": "Commits (30 days)",
      "dash.tileLast": "Last update",
      "dash.chartTitle": "Weekly commits",
      "dash.chartSub": "Last 12 weeks · all public repositories",
      "dash.chartCaption": "Commits per week",
      "dash.thWeek": "Week of",
      "dash.thCommits": "Commits",
      "dash.thRepo": "Repository",
      "dash.thVersion": "Latest version",
      "dash.thUpdated": "Last updated",
      "dash.thLang": "Language",
      "history.title": "History",
      "history.lede": "Launches and releases, pulled straight from GitHub.",
      "history.rss": "Subscribe via RSS",
      "faq.title": "FAQ",
      "faq.q1": "Is it really free?",
      "faq.a1": `Yes. Downloading and building cost nothing.${BR}Licenses differ by project, so check the LICENSE file in each repository.`,
      "faq.q3": "Can I take the code and change it?",
      "faq.a3": `Absolutely. Fork it, change it, or use it as the starting point for something new.${BR}Uncomew (MIT) and MemoWeaver (Apache-2.0) can be used commercially too.${BR}Just keep the copyright and license notices.${BR}Catoshi can be modified and shared for non-commercial personal use only.${BR}If you build something, let us know on ${TG}. We’d love to see it.`,
      "faq.q2": "Where can I send feedback or report a problem?",
      "faq.a2": `Reach out through the project’s GitHub repository or on ${TG}.${BR}Including your version, setup, what happened and any error messages helps a lot.${BR}Replies may take a while, so thanks for your patience.`,
      "footer.fine": "© 2026 Rayeonjin · This site uses no cookies or analytics.",
    },
    zh: {
      "meta.description": "Studio RAYEONJIN 的小应用合集：放在手边、能长久使用的日常工具，源代码全部公开。",
      "a11y.home": "返回 Studio RAYEONJIN 首页",
      "a11y.mainMenu": "主菜单",
      "a11y.language": "语言",
      "a11y.externalLinks": "外部链接",
      "nav.about": "简介",
      "nav.works": "作品",
      "nav.dashboard": "动态",
      "nav.history": "历程",
      "nav.faq": "常见问题",
      "hero.title": "做小而美、<br>有温度的软件。",
      "hero.tagline": "Small, kind software.",
      "hero.lede": `这里收录了 Studio RAYEONJIN 的应用。${BR}都是放在手边、能长久用下去的日常工具，一个一个慢慢做。${BR}目前以 macOS 应用为主，其他平台的作品准备好后也会发布在这里。`,
      "shelf.label": "应用列表",
      "shelf.catoshi": "菜单栏小猫与 BTC 行情",
      "shelf.uncomew": "找出占用空间的大文件",
      "shelf.memo": "彼此相连的笔记",
      "about.title": "Studio RAYEONJIN",
      "about.p1": `这里的每个应用，都源于日常中的真实需求。${BR}经过反复使用和打磨后，再开放给有同样需要的人。`,
      "about.why": `公开源代码的理由很简单：${BR}希望有同样需要的人，不必再把时间和精力花在同样的反复试错上。${BR}省下的时间可以去解决别的问题；如果你也愿意把成果公开出来，那就再好不过了。`,
      "about.p2": `觉得合用，尽管拿去用。${BR}有任何想法，欢迎到 ${TG} 留言，每条都会认真看。`,
      "works.title": "作品",
      "works.macNote": `macOS 应用以源代码形式发布，不提供现成的安装包。${BR}用苹果免费的开发工具，在自己的 Mac 上编译安装。${BR}第一次也没关系，按照每个应用的安装指南一步步来即可。`,
      "catoshi.altBar": "macOS 菜单栏里的 Catoshi 小猫，旁边显示 BTC 行情和泡菜溢价",
      "catoshi.altPanel": "点击菜单栏后弹出的 Catoshi 行情面板，显示币安和 Upbit 的价格以及泡菜溢价",
      "catoshi.shotNote": "画面中的行情为模拟数据。",
      "catoshi.showPanel": "查看行情面板",
      "catoshi.tagline": "住在菜单栏里的小猫。",
      "catoshi.desc": `一只在菜单栏里散步，累了就揣着手趴下歇会儿的小猫。${BR}有它陪着，还能随时看到 BTC 行情、泡菜溢价${BR}和整体市场走势。${BR}不需要交易所账户，也不需要 API Key。`,
      "catoshi.license": '仅限非商业个人使用<span class="nw">（Catoshi Community License）</span>',
      "common.installGuide": "安装指南",
      "common.loading": "正在加载…",
      "uncomew.tagline": "看看是什么占满了空间。",
      "uncomew.desc": `Mac 存储空间告急时，帮你找出藏在各处的大文件和文件夹，弄清它们的用途。${BR}参考应用的大小和最近使用时间，再决定要清理哪些。${BR}不会自动删除，也不会替你清空废纸篓，最终由你自己决定。`,
      "memo.status": "开发中",
      "memo.tagline": "本地优先的 macOS 笔记应用。",
      "memo.desc": `随手记下，日后再把零散的想法串联起来。${BR}需要时再用 Markdown，${BR}也可以让本地 AI 帮你发现想法之间的联系。${BR}应用不会擅自改动你写下的原文。`,
      "next.title": "更多作品筹备中",
      "next.body": `新的应用和其他平台的作品，准备好后会发布在这里。${BR}最新消息会先在 GitHub 和 Telegram 上公布。`,
      "next.link": "在 Telegram 上关注",
      "dash.title": "开发动态",
      "dash.lede": "以下数据来自 GitHub 公开仓库，每 3 小时更新一次。",
      "dash.tileWorks": "已公开应用",
      "dash.tileVersions": "已发布版本",
      "dash.tileCommits": "近 30 天提交",
      "dash.tileLast": "最近更新",
      "dash.chartTitle": "每周提交",
      "dash.chartSub": "最近 12 周 · 全部公开仓库",
      "dash.chartCaption": "每周提交次数",
      "dash.thWeek": "周",
      "dash.thCommits": "提交",
      "dash.thRepo": "仓库",
      "dash.thVersion": "最新版本",
      "dash.thUpdated": "最近更新",
      "dash.thLang": "语言",
      "history.title": "历程",
      "history.lede": '公开的作品和版本发布，直接取自 <span class="nw">GitHub 记录</span>。',
      "history.rss": "通过 RSS 订阅",
      "faq.title": "常见问题",
      "faq.q1": "真的免费吗？",
      "faq.a1": `是的，下载和编译都不收任何费用。${BR}各项目的许可协议有所不同，请查看各仓库中的 LICENSE 文件。`,
      "faq.q3": "可以拿代码去改、去用吗？",
      "faq.a3": `当然可以。欢迎 fork 后自行修改，或者拿来当作新项目的起点。${BR}Uncomew（MIT）和 MemoWeaver（Apache-2.0）也可用于商业用途，${BR}只需保留版权和许可声明。${BR}Catoshi 仅可在非商业的个人使用范围内修改和分享。${BR}如果你做出了什么，欢迎在 ${TG} 上告诉我们，很期待看到。`,
      "faq.q2": "有建议或遇到问题，该怎么反馈？",
      "faq.a2": `请通过对应项目的 GitHub 仓库或 ${TG} 告诉我们。${BR}附上所用版本、运行环境、具体现象和错误信息，会很有帮助。${BR}回复可能不够及时，<span class="nw">还请见谅</span>。`,
      "footer.fine": "© 2026 Rayeonjin · 本站不使用 Cookie，也不使用任何统计分析工具。",
    },
    es: {
      "meta.description": "Las pequeñas apps de Studio RAYEONJIN: herramientas para el día a día, pensadas para durar y con el código fuente a la vista.",
      "a11y.home": "Inicio de Studio RAYEONJIN",
      "a11y.mainMenu": "Menú principal",
      "a11y.language": "Idioma",
      "a11y.externalLinks": "Enlaces externos",
      "nav.about": "Estudio",
      "nav.works": "Proyectos",
      "nav.dashboard": "Actividad",
      "nav.history": "Historial",
      "nav.faq": "FAQ",
      "hero.title": "Software pequeño<br>y cercano.",
      "hero.tagline": "Small, kind software.",
      "hero.lede": `Aquí están las apps de Studio RAYEONJIN.${BR}Herramientas para el día a día, hechas una a una y pensadas para durar.${BR}Por ahora son sobre todo apps para macOS; lo demás llegará aquí cuando esté listo.`,
      "shelf.label": "Apps",
      "shelf.catoshi": "Gato de la barra de menús y precio de BTC",
      "shelf.uncomew": "Descubre qué ocupa espacio",
      "shelf.memo": "Notas que se enlazan entre sí",
      "about.title": "Studio RAYEONJIN",
      "about.p1": `Cada app nace de una necesidad real <span class="nw">del día a día</span>.${BR}Primero la usamos y pulimos a fondo; después la compartimos con quien tenga la misma necesidad.`,
      "about.why": `El motivo para publicar el código es sencillo:${BR}que nadie con la misma necesidad pierda tiempo y esfuerzo repitiendo el mismo <span class="nw">ensayo y error</span>.${BR}Dedica ese tiempo a otro problema y, si además compartes lo que construyas, mucho mejor.`,
      "about.p2": `Si alguna te resulta útil, úsala con total libertad.${BR}Si quieres darnos tu opinión, escríbenos por ${TG}: leemos todos los mensajes.`,
      "works.title": "Proyectos",
      "works.macNote": `Las apps para macOS se publican como código fuente, no como instaladores listos para usar.${BR}Se compilan e instalan en tu propio Mac con las herramientas gratuitas de Apple.${BR}¿Es tu primera vez? La guía de instalación de cada app te lleva paso a paso.`,
      "catoshi.altBar": "El gato de Catoshi en la barra de menús de macOS, junto al precio de BTC y la prima kimchi",
      "catoshi.altPanel": "Panel de precios de Catoshi abierto desde la barra de menús, con los precios de Binance y Upbit y la prima kimchi",
      "catoshi.shotNote": "Pantalla recreada con precios simulados.",
      "catoshi.showPanel": "Ver el panel de precios",
      "catoshi.tagline": "Un gatito que vive en tu barra de menús.",
      "catoshi.desc": `Un gatito que pasea por tu barra de menús y de vez en cuando se acurruca a descansar.${BR}A su lado puedes seguir el precio de BTC, la prima kimchi${BR}y el rumbo general del mercado.${BR}No necesitas cuenta en ningún exchange ni clave API.`,
      "catoshi.license": 'Uso personal no comercial <span class="nw">(Catoshi Community License)</span>',
      "common.installGuide": "Guía de instalación",
      "common.loading": "Cargando…",
      "uncomew.tagline": "Descubre qué ocupa espacio en tu Mac.",
      "uncomew.desc": `Cuando te quedas sin espacio, encuentra los archivos y carpetas grandes escondidos en tu Mac y averigua para qué sirven.${BR}Revisa las apps por tamaño y por la última vez que las usaste antes de decidir qué limpiar.${BR}No borra nada automáticamente ni vacía la Papelera <span class=\"nw\">por ti</span>: la última palabra es tuya.`,
      "memo.status": "En desarrollo",
      "memo.tagline": "Notas para macOS que viven en tu Mac.",
      "memo.desc": `Notas para apuntar rápido y enlazarlas entre sí más adelante.${BR}Markdown solo cuando te haga falta${BR}y, si quieres, una IA local que encuentra relaciones entre tus ideas.${BR}La app no modifica por su cuenta el texto que escribiste.`,
      "next.title": "Más proyectos en camino",
      "next.body": `Las nuevas apps y los proyectos para otras plataformas se publicarán aquí cuando estén listos.${BR}Las novedades llegan primero a GitHub y Telegram.`,
      "next.link": "Sigue las novedades en Telegram",
      "dash.title": "Actividad",
      "dash.lede": "Las cifras de abajo salen de los repositorios públicos de GitHub y se actualizan cada 3 horas.",
      "dash.tileWorks": "Apps publicadas",
      "dash.tileVersions": "Versiones",
      "dash.tileCommits": "Commits (30 días)",
      "dash.tileLast": "Último cambio",
      "dash.chartTitle": "Commits por semana",
      "dash.chartSub": "Últimas 12 semanas · todos los repositorios públicos",
      "dash.chartCaption": "Commits por semana",
      "dash.thWeek": "Semana del",
      "dash.thCommits": "Commits",
      "dash.thRepo": "Repositorio",
      "dash.thVersion": "Última versión",
      "dash.thUpdated": "Última actualización",
      "dash.thLang": "Lenguaje",
      "history.title": "Historial",
      "history.lede": "Lanzamientos y versiones, tomados directamente de GitHub.",
      "history.rss": "Suscríbete por RSS",
      "faq.title": "Preguntas frecuentes",
      "faq.q1": "¿De verdad es gratis?",
      "faq.a1": `Sí. Descargarlo y compilarlo no cuesta nada.${BR}La licencia cambia según el proyecto, así que consulta el archivo LICENSE <span class="nw">de cada repositorio</span>.`,
      "faq.q3": '¿Puedo usar el código <span class="nw">y modificarlo?</span>',
      "faq.a3": `Claro que sí. Haz un fork, modifícalo o úsalo como punto de partida para algo nuevo.${BR}Uncomew (MIT) y MemoWeaver (Apache-2.0) también admiten uso comercial.${BR}Solo mantén los avisos de copyright y licencia.${BR}Catoshi solo puede modificarse y compartirse para uso personal no comercial.${BR}Si construyes algo, cuéntanoslo por ${TG}. Nos encantará verlo.`,
      "faq.q2": "¿Dónde puedo enviar comentarios o informar de un problema?",
      "faq.a2": `Escríbenos en el repositorio de GitHub del proyecto o por ${TG}.${BR}Ayuda mucho que incluyas la versión, tu entorno, lo que ocurrió y los mensajes de error.${BR}Puede que tardemos en responder; gracias por <span class="nw">tu paciencia</span>.`,
      "footer.fine": "© 2026 Rayeonjin · Este sitio no usa cookies ni herramientas de analítica.",
    },
  };

  // Capture the Korean source before anything changes.
  const KO = {};
  document.querySelectorAll("[data-i18n]").forEach((n) => { KO[n.dataset.i18n] = n.innerHTML; });
  document.querySelectorAll("[data-i18n-attr]").forEach((n) => {
    n.dataset.i18nAttr.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":");
      KO[key] = n.getAttribute(attr);
    });
  });

  let lang = LANGS.includes(window.__lang) ? window.__lang : "ko";

  function t(key, vars) {
    const table = lang === "ko" ? KO : PAGE[lang];
    let s = SCRIPT[lang][key] ?? table?.[key] ?? SCRIPT.ko[key] ?? KO[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
    return s;
  }

  // Chinese has no spaces, so browsers may break inside a word (安|装包).
  // Group each multi-character word so lines only break between words.
  const segmenter = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter("zh", { granularity: "word" }) : null;
  const HAN = /\p{Script=Han}/u;
  function keepWordsTogether(node) {
    if (!segmenter) return;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) if (HAN.test(walker.currentNode.nodeValue)) texts.push(walker.currentNode);
    for (const text of texts) {
      if (text.parentElement && text.parentElement.closest(".nw")) continue;
      const frag = document.createDocumentFragment();
      for (const { segment } of segmenter.segment(text.nodeValue)) {
        if (segment.length > 1 && HAN.test(segment)) {
          const span = document.createElement("span");
          span.className = "nw";
          span.textContent = segment;
          frag.append(span);
        } else {
          frag.append(segment);
        }
      }
      text.replaceWith(frag);
    }
  }

  function apply() {
    const root = document.documentElement;
    root.lang = HTML_LANG[lang];
    document.querySelectorAll("[data-i18n]").forEach((n) => {
      n.innerHTML = t(n.dataset.i18n);
      if (lang === "zh") keepWordsTogether(n);
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((n) => {
      n.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":");
        n.setAttribute(attr, t(key));
      });
    });
    const sel = document.getElementById("lang-select");
    if (sel) sel.value = lang;
    root.classList.remove("i18n-pending");
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  function setLang(next) {
    if (!LANGS.includes(next) || next === lang) return;
    lang = next;
    try { localStorage.setItem("lang", next); } catch (e) {}
    try {
      const url = new URL(location.href);
      url.searchParams.set("lang", next);
      history.replaceState(null, "", url);
    } catch (e) {}
    apply();
  }

  window.I18N = {
    t,
    keepWordsTogether: (n) => { if (lang === "zh") keepWordsTogether(n); },
    get lang() { return lang; },
    get locale() { return LOCALE[lang]; },
    setLang,
  };

  document.getElementById("lang-select")?.addEventListener("change", (e) => setLang(e.target.value));
  apply();
})();
