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
      "meta.description": "Studio RAYEONJIN is a software studio making small, kind tools that run quietly on your own device. The source code is public, and every app stays close to everyday use.",
      "a11y.home": "Studio RAYEONJIN home",
      "a11y.mainMenu": "Main menu",
      "a11y.language": "Language",
      "a11y.externalLinks": "External links",
      "nav.about": "About",
      "nav.works": "Work",
      "nav.dashboard": "Activity",
      "nav.history": "History",
      "nav.support": "Support",
      "nav.faq": "FAQ",
      "hero.eyebrow": "Software studio · Korea",
      "hero.title": "Small, kind<br>software.",
      "hero.tagline": "",
      "hero.lede": `Studio RAYEONJIN is a software studio.${BR}We make everyday tools you can keep close and rely on for years.${BR}The focus right now is on macOS apps.${BR}Work for other platforms will show up here as soon as it’s ready.`,
      "hero.ctaWorks": "See the work",
      "hero.ctaAbout": "About the studio",
      "about.title": "Studio RAYEONJIN",
      "about.p1": `Every app here starts with a real, personal need.${BR}Each one was built for our own use first, then shared with anyone who needs the same thing.`,
      "about.p2": `If one fits what you need, it’s yours to use.${BR}Feedback is always welcome on ${TG}, and every message gets read.`,
      "about.p3": "Whatever the project, it follows three principles.",
      "principle1.title": "Stays on your device",
      "principle1.body": `No accounts, no cloud sync, no analytics.${BR}Your data and settings stay on your own device.`,
      "principle2.title": "Source in the open",
      "principle2.body": `The source code is public, so anyone can see exactly what runs.${BR}Each project’s license spells out how it may be used.`,
      "principle3.title": "Everything on record",
      "principle3.body": `Changelogs, known issues and data sources are all documented.${BR}Anything that hasn’t been verified is clearly marked as such.`,
      "works.title": "Work",
      "works.macNote": `macOS apps are shared as source code rather than ready-made installers.${BR}Build them on your own Mac with Apple’s free developer tools. Each app has an install guide.`,
      "catoshi.altBar": "The Catoshi cat sitting in the macOS menu bar next to the BTC price and the Kimchi premium",
      "catoshi.altPanel": "The Catoshi price panel opened from the menu bar, showing Binance and Upbit prices and the Kimchi premium",
      "catoshi.shotNote": "Shown with simulated prices.",
      "catoshi.tagline": "A little cat that lives in your menu bar.",
      "catoshi.desc": `A tiny cat that strolls across your menu bar, turns around and settles into a loaf.${BR}Alongside it, keep an eye on the BTC price, the Kimchi premium${BR}and where the market is heading.${BR}No exchange account or API key needed.`,
      "catoshi.license": 'Non-commercial personal use <span class="nw">(Catoshi Community License)</span>',
      "common.installGuide": "Install guide",
      "common.loading": "Loading…",
      "uncomew.tagline": "Find what’s taking up space.",
      "uncomew.desc": `When your Mac runs low on storage, find the large files and folders hiding on it and see what they’re for.${BR}Check apps by size and when you last used them before deciding what to clear out.${BR}Nothing is deleted automatically and the Trash is never emptied for you. You make the final call.`,
      "memo.status": "In development",
      "memo.tagline": "Local-first notes for macOS.",
      "memo.desc": `Notes for jotting things down fast and weaving them together later.${BR}Markdown is there when you want it,${BR}and if you like, a local AI can surface connections between your ideas.${BR}Keeping your original text safe always comes first.`,
      "next.title": "More on the way",
      "next.body": `New apps and work for other platforms will be posted here as they’re ready.${BR}News goes out on GitHub and Telegram first.`,
      "next.link": "Follow on Telegram",
      "dash.title": "Activity",
      "dash.lede": "Based on public GitHub repositories, refreshed every 3 hours.",
      "dash.tileWorks": "Public projects",
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
      "support.title": "Support the work",
      "support.lede": `If these apps are useful to you, you’re welcome to chip in.${BR}It genuinely helps the next project happen.`,
      "support.fairy": "Support on Fairy",
      "support.bmc": "Buy a coffee",
      "support.kofi": "Support on Ko-fi",
      "support.note": "Support isn’t payment for a license or features. Everyone gets the same features, updates and help.",
      "faq.title": "FAQ",
      "faq.q1": "Is it really free?",
      "faq.a1": `Yes. Downloading and building cost nothing.${BR}Licenses do differ by project, though:${BR}Catoshi is for non-commercial personal use only.${BR}Uncomew is MIT-licensed, and MemoWeaver uses Apache-2.0.${BR}See the LICENSE file in each repository for details.`,
      "faq.q2": "Where can I send feedback or report a problem?",
      "faq.a2": `Reach out through the project’s GitHub repository or on ${TG}.${BR}Including your version, setup, what happened and any error messages helps a lot.${BR}Replies may take a while, so thanks for your patience.`,
      "footer.fine": "© 2026 Rayeonjin · This site uses no cookies or analytics.",
    },
    zh: {
      "meta.description": "Studio RAYEONJIN 是一家软件工作室，专注于在你自己的设备上安静运行、小而美的日常工具。源代码公开，长久可用。",
      "a11y.home": "返回 Studio RAYEONJIN 首页",
      "a11y.mainMenu": "主菜单",
      "a11y.language": "语言",
      "a11y.externalLinks": "外部链接",
      "nav.about": "简介",
      "nav.works": "作品",
      "nav.dashboard": "动态",
      "nav.history": "历程",
      "nav.support": "支持",
      "nav.faq": "常见问题",
      "hero.eyebrow": "软件工作室 · 韩国",
      "hero.title": "做小而美、<br>有温度的软件。",
      "hero.tagline": "Small, kind software.",
      "hero.lede": `Studio RAYEONJIN 是一家软件工作室。${BR}我们做的是放在手边、能长久用下去的日常工具。${BR}目前以 macOS 应用为主，其他平台的作品准备好后也会陆续发布在这里。`,
      "hero.ctaWorks": "浏览作品",
      "hero.ctaAbout": "了解工作室",
      "about.title": "Studio RAYEONJIN",
      "about.p1": `这里的每个应用，都源于真实的个人需求。${BR}原本是做给自己用的工具，开放出来，让有同样需要的人也能用上。`,
      "about.p2": `觉得合用，尽管拿去用。${BR}有任何想法，欢迎到 ${TG} 留言，每条都会认真看。`,
      "about.p3": "无论做的是什么，都遵循以下三条原则。",
      "principle1.title": "数据留在你的设备上",
      "principle1.body": `不内置账号、云同步或数据统计工具。${BR}记录和设置只保存在你自己的设备上。`,
      "principle2.title": "源代码公开",
      "principle2.body": `源代码完全公开，运行的是什么，人人都能查看。${BR}各项目的使用范围以其许可协议为准。`,
      "principle3.title": "一切有据可查",
      "principle3.body": `更新日志、已知问题和数据来源都会写进文档。${BR}尚未核实的内容，也会如实注明。`,
      "works.title": "作品",
      "works.macNote": `macOS 应用以源代码形式发布，不提供现成的安装包。${BR}用苹果免费的开发工具在自己的 Mac 上编译即可，每个应用都附有安装指南。`,
      "catoshi.altBar": "macOS 菜单栏里的 Catoshi 小猫，旁边显示 BTC 行情和泡菜溢价",
      "catoshi.altPanel": "点击菜单栏后弹出的 Catoshi 行情面板，显示币安和 Upbit 的价格以及泡菜溢价",
      "catoshi.shotNote": "画面中的行情为模拟数据。",
      "catoshi.tagline": "住在菜单栏里的小猫。",
      "catoshi.desc": `一只在菜单栏里散步、转身、揣着手趴下的小猫。${BR}有它陪着，还能随时看到 BTC 行情、泡菜溢价${BR}和整体市场走势。${BR}不需要交易所账户，也不需要 API Key。`,
      "catoshi.license": '仅限非商业个人使用<span class="nw">（Catoshi Community License）</span>',
      "common.installGuide": "安装指南",
      "common.loading": "正在加载…",
      "uncomew.tagline": "看看是什么占满了空间。",
      "uncomew.desc": `Mac 存储空间告急时，帮你找出藏在各处的大文件和文件夹，弄清它们的用途。${BR}参考应用的大小和最近使用时间，再决定要清理哪些。${BR}不会自动删除，也不会替你清空废纸篓，最终由你自己决定。`,
      "memo.status": "开发中",
      "memo.tagline": "本地优先的 macOS 笔记应用。",
      "memo.desc": `随手记下，日后再把零散的想法串联起来。${BR}需要时再用 Markdown，${BR}也可以让本地 AI 帮你发现想法之间的联系。${BR}始终把保护原始文本放在第一位。`,
      "next.title": "更多作品筹备中",
      "next.body": `新的应用和其他平台的作品，准备好后会发布在这里。${BR}最新消息会先在 GitHub 和 Telegram 上公布。`,
      "next.link": "在 Telegram 上关注",
      "dash.title": "开发动态",
      "dash.lede": "数据来自 GitHub 公开仓库，每 3 小时更新一次。",
      "dash.tileWorks": "公开作品",
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
      "support.title": "支持开发",
      "support.lede": `如果这些作品对你有帮助，欢迎自愿支持。${BR}这对下一个作品的诞生很有帮助。`,
      "support.fairy": "通过 Fairy 支持",
      "support.bmc": "请喝一杯咖啡",
      "support.kofi": "通过 Ko-fi 支持",
      "support.note": "赞助并不是购买使用权或功能，所有人获得的功能、更新和支持完全相同。",
      "faq.title": "常见问题",
      "faq.q1": "真的免费吗？",
      "faq.a1": `是的，下载和编译都不收任何费用。${BR}不过各项目的许可协议有所不同：${BR}Catoshi 仅限非商业个人使用；${BR}Uncomew 采用 MIT 协议，MemoWeaver 采用 Apache-2.0 协议。${BR}详情请查看各仓库中的 LICENSE 文件。`,
      "faq.q2": "有建议或遇到问题，该怎么反馈？",
      "faq.a2": `请通过对应项目的 GitHub 仓库或 ${TG} 告诉我们。${BR}附上所用版本、运行环境、具体现象和错误信息，会很有帮助。${BR}回复可能不够及时，还请见谅。`,
      "footer.fine": "© 2026 Rayeonjin · 本站不使用 Cookie，也不使用任何统计分析工具。",
    },
    es: {
      "meta.description": "Studio RAYEONJIN es un estudio de software que crea herramientas pequeñas y cercanas que funcionan en tu propio dispositivo. El código fuente es público.",
      "a11y.home": "Inicio de Studio RAYEONJIN",
      "a11y.mainMenu": "Menú principal",
      "a11y.language": "Idioma",
      "a11y.externalLinks": "Enlaces externos",
      "nav.about": "Estudio",
      "nav.works": "Proyectos",
      "nav.dashboard": "Actividad",
      "nav.history": "Historial",
      "nav.support": "Apoyar",
      "nav.faq": "FAQ",
      "hero.eyebrow": "Estudio de software · Corea",
      "hero.title": "Software pequeño<br>y cercano.",
      "hero.tagline": "Small, kind software.",
      "hero.lede": `Studio RAYEONJIN es un estudio de software.${BR}Creamos herramientas para el día a día, pensadas para acompañarte durante años.${BR}Por ahora nos centramos en apps para macOS; los proyectos para otras plataformas llegarán aquí cuando estén listos.`,
      "hero.ctaWorks": "Ver proyectos",
      "hero.ctaAbout": "Conoce el estudio",
      "about.title": "Studio RAYEONJIN",
      "about.p1": `Cada app nace de una necesidad real y personal.${BR}Son herramientas hechas primero para uso propio y compartidas para que cualquiera con la misma necesidad pueda usarlas.`,
      "about.p2": `Si alguna te resulta útil, úsala con total libertad.${BR}Si quieres darnos tu opinión, escríbenos por ${TG}: leemos todos los mensajes.`,
      "about.p3": "Sea cual sea el proyecto, todos siguen tres principios.",
      "principle1.title": "Todo en tu dispositivo",
      "principle1.body": `Sin cuentas, sin sincronización en la nube y sin herramientas de analítica.${BR}Tus datos y ajustes se quedan en tu dispositivo.`,
      "principle2.title": "Código a la vista",
      "principle2.body": `El código fuente es público para que cualquiera pueda ver qué se ejecuta exactamente.${BR}La licencia de cada proyecto indica cómo se puede usar.`,
      "principle3.title": "Todo documentado",
      "principle3.body": `El historial de cambios, los problemas conocidos y las fuentes de datos quedan por escrito.${BR}Lo que no se ha podido verificar se indica claramente.`,
      "works.title": "Proyectos",
      "works.macNote": `Las apps para macOS se publican como código fuente, no como instaladores listos para usar.${BR}Se compilan en tu propio Mac con las herramientas gratuitas de Apple. Cada app tiene su guía de instalación.`,
      "catoshi.altBar": "El gato de Catoshi en la barra de menús de macOS, junto al precio de BTC y la prima kimchi",
      "catoshi.altPanel": "Panel de precios de Catoshi abierto desde la barra de menús, con los precios de Binance y Upbit y la prima kimchi",
      "catoshi.shotNote": "Pantalla recreada con precios simulados.",
      "catoshi.tagline": "Un gatito que vive en tu barra de menús.",
      "catoshi.desc": `Un gatito que pasea por tu barra de menús, se da la vuelta y se acurruca a descansar.${BR}A su lado puedes seguir el precio de BTC, la prima kimchi${BR}y el rumbo general del mercado.${BR}No necesitas cuenta en ningún exchange ni clave API.`,
      "catoshi.license": 'Uso personal no comercial <span class="nw">(Catoshi Community License)</span>',
      "common.installGuide": "Guía de instalación",
      "common.loading": "Cargando…",
      "uncomew.tagline": "Descubre qué ocupa espacio en tu Mac.",
      "uncomew.desc": `Cuando te quedas sin espacio, encuentra los archivos y carpetas grandes escondidos en tu Mac y averigua para qué sirven.${BR}Revisa las apps por tamaño y por la última vez que las usaste antes de decidir qué limpiar.${BR}No borra nada automáticamente ni vacía la Papelera <span class=\"nw\">por ti</span>: la última palabra es tuya.`,
      "memo.status": "En desarrollo",
      "memo.tagline": "Notas para macOS que viven en tu Mac.",
      "memo.desc": `Notas para apuntar rápido y unir las ideas más adelante.${BR}Markdown solo cuando te haga falta${BR}y, si quieres, una IA local que encuentra relaciones entre tus ideas.${BR}Lo primero siempre es proteger tu texto original.`,
      "next.title": "Más proyectos en camino",
      "next.body": `Las nuevas apps y los proyectos para otras plataformas se publicarán aquí cuando estén listos.${BR}Las novedades llegan primero a GitHub y Telegram.`,
      "next.link": "Sigue las novedades en Telegram",
      "dash.title": "Actividad",
      "dash.lede": "Datos de los repositorios públicos de GitHub, actualizados cada 3 horas.",
      "dash.tileWorks": "Proyectos públicos",
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
      "support.title": "Apoya el proyecto",
      "support.lede": `Si estas apps te resultan útiles, puedes hacer una aportación voluntaria.${BR}Ayuda de verdad a que llegue el siguiente proyecto.`,
      "support.fairy": "Apoyar en Fairy",
      "support.bmc": "Invitar a un café",
      "support.kofi": "Apoyar en Ko-fi",
      "support.note": "Las aportaciones no son un pago por licencias ni funciones: todo el mundo recibe las mismas funciones, actualizaciones y ayuda.",
      "faq.title": "Preguntas frecuentes",
      "faq.q1": "¿De verdad es gratis?",
      "faq.a1": `Sí. Descargarlo y compilarlo no cuesta nada.${BR}Eso sí, la licencia cambia según el proyecto:${BR}Catoshi es solo para uso personal no comercial.${BR}Uncomew usa la licencia MIT y MemoWeaver, Apache-2.0.${BR}Consulta el archivo LICENSE de cada repositorio para más detalles.`,
      "faq.q2": "¿Dónde puedo enviar comentarios o informar de un problema?",
      "faq.a2": `Escríbenos en el repositorio de GitHub del proyecto o por ${TG}.${BR}Ayuda mucho que incluyas la versión, tu entorno, lo que ocurrió y los mensajes de error.${BR}Puede que tardemos en responder; gracias por tu paciencia.`,
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
