// Guestbook: a dialog opened from the footer link (or a #guestbook URL).
// Entries come from, and are posted to, the Supabase Edge Function in
// supabase/functions/guestbook. New entries show up right away.
(() => {
  const ENDPOINT = "https://ggnvczlkfekdcjlafvup.supabase.co/functions/v1/guestbook";
  const dialog = document.getElementById("guestbook-dialog");
  const opener = document.getElementById("guestbook-open");
  const list = document.getElementById("guestbook-list");
  const form = document.getElementById("guestbook-form");
  const status = document.getElementById("guestbook-status");
  if (!dialog || !list || !form || !status || typeof dialog.showModal !== "function") return;

  const t = (k) => (window.I18N ? window.I18N.t(k) : k);
  const lang = () => (window.I18N ? window.I18N.lang : "ko");
  const locale = () => (window.I18N ? window.I18N.locale : "ko-KR");
  const button = form.querySelector('button[type="submit"]');
  let openedAt = 0;
  let shown = null;
  let entries = null; // null = not loaded, "error" = failed to load

  const show = (key, state) => {
    shown = key;
    status.textContent = key ? t(key) : "";
    status.dataset.state = state || "";
  };

  const note = (key) => {
    list.replaceChildren();
    const li = document.createElement("li");
    li.className = "gb-note";
    li.textContent = t(key);
    list.append(li);
  };

  const render = () => {
    if (entries === null) return note("guestbook.loading");
    if (entries === "error") return note("guestbook.loadFailed");
    if (!entries.length) return note("guestbook.empty");
    const fmt = new Intl.DateTimeFormat(locale(), { dateStyle: "medium" });
    list.replaceChildren(...entries.map((e) => {
      const li = document.createElement("li");
      li.className = "gb-entry";
      const head = document.createElement("p");
      head.className = "gb-head";
      const name = document.createElement("strong");
      name.textContent = e.nickname;
      const time = document.createElement("time");
      time.dateTime = e.created_at;
      time.textContent = fmt.format(new Date(e.created_at));
      head.append(name, time);
      const text = document.createElement("p");
      text.className = "gb-text";
      text.textContent = e.message;
      li.append(head, text);
      return li;
    }));
  };

  async function load() {
    try {
      const res = await fetch(ENDPOINT);
      entries = res.ok ? (await res.json()).entries ?? [] : "error";
    } catch (e) {
      entries = "error";
    }
    render();
  }

  // Keep texts in the current language when the visitor switches.
  document.addEventListener("langchange", () => {
    if (shown) status.textContent = t(shown);
    if (dialog.open) render();
  });

  const open = () => {
    if (dialog.open) return;
    if (shown !== "guestbook.sending") show(null);
    openedAt = Date.now();
    entries = null;
    render();
    dialog.showModal();
    form.elements.nickname.focus();
    load();
  };
  const close = () => dialog.close();

  opener?.addEventListener("click", (event) => { event.preventDefault(); open(); });
  document.getElementById("guestbook-close")?.addEventListener("click", close);
  // A click on the backdrop lands on the dialog element itself.
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  dialog.addEventListener("close", () => {
    if (location.hash === "#guestbook") history.replaceState(null, "", location.pathname + location.search);
  });
  if (location.hash === "#guestbook") open();
  window.addEventListener("hashchange", () => { if (location.hash === "#guestbook") open(); });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      show("guestbook.invalid", "error");
      form.querySelector(":invalid")?.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    button.disabled = true;
    show("guestbook.sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, lang: lang(), elapsed: Date.now() - openedAt }),
      });
      if (res.ok) {
        form.reset();
        show("guestbook.sent", "ok");
        load();
      } else if (res.status === 422) {
        const body = await res.json().catch(() => ({}));
        show(body.error === "links" ? "guestbook.links" : "guestbook.invalid", "error");
      } else if (res.status === 429) {
        show("guestbook.busy", "error");
      } else {
        show("guestbook.failed", "error");
      }
    } catch (e) {
      show("guestbook.failed", "error");
    } finally {
      button.disabled = false;
    }
  });
})();
