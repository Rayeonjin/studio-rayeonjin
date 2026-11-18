// Coffee chat form: posts to the Supabase Edge Function in supabase/functions/coffee-chat.
(() => {
  const ENDPOINT = "https://ggnvczlkfekdcjlafvup.supabase.co/functions/v1/coffee-chat";
  const form = document.getElementById("coffee-form");
  const status = document.getElementById("coffee-status");
  if (!form || !status) return;

  const t = (k) => (window.I18N ? window.I18N.t(k) : k);
  const lang = () => (window.I18N ? window.I18N.lang : "ko");
  const button = form.querySelector('button[type="submit"]');
  const started = Date.now();
  let shown = null;

  const show = (key, state) => {
    shown = key;
    status.textContent = key ? t(key) : "";
    status.dataset.state = state || "";
  };
  // Keep the message in the current language when the visitor switches.
  document.addEventListener("langchange", () => { if (shown) status.textContent = t(shown); });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      show("coffee.invalid", "error");
      form.querySelector(":invalid")?.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    button.disabled = true;
    show("coffee.sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, lang: lang(), elapsed: Date.now() - started }),
      });
      if (res.ok) {
        form.reset();
        show("coffee.sent", "ok");
      } else if (res.status === 422) {
        show("coffee.invalid", "error");
      } else if (res.status === 429) {
        show("coffee.busy", "error");
      } else {
        show("coffee.failed", "error");
      }
    } catch (e) {
      show("coffee.failed", "error");
    } finally {
      button.disabled = false;
    }
  });
})();
