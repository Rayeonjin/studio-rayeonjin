// Copy buttons for terminal commands.
document.querySelectorAll(".copy").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.dataset.copy || "";
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "복사됨";
    } catch {
      btn.textContent = "직접 복사해 주세요";
    }
    setTimeout(() => { btn.textContent = "복사"; }, 1600);
  });
});
