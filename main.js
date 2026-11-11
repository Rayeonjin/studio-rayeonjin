// Catoshi walks along the shelf under the menu bar.
// Sprite coordinates come from Catoshi's CatoshiAtlasCatalog.
(() => {
  const FRAMES = {
    walk: [1014, 1075, 1136, 1197].map((x) => ({ x, w: 59 })),
    idle: [{ x: 0, w: 59 }, { x: 1258, w: 59 }, { x: 1319, w: 59 }, { x: 1380, w: 59 }],
    sit: [{ x: 61, w: 32 }, { x: 1441, w: 32 }, { x: 1475, w: 32 }, { x: 1509, w: 32 }],
    loaf: [{ x: 95, w: 81 }, { x: 1543, w: 81 }],
    groom: [{ x: 234, w: 36 }],
    stretch: [{ x: 178, w: 54 }],
    sleep: [{ x: 272, w: 77 }],
    happy: [{ x: 351, w: 64 }],
  };
  const REST_POSES = ["sit", "loaf", "groom", "stretch", "idle", "sleep"];
  const SPEED = 38; // px per second
  const STEP_MS = 150;

  const cat = document.getElementById("cat");
  const track = cat && cat.parentElement;
  if (!cat || !track) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let x = -70;
  let dir = 1; // 1 = walking right, -1 = left
  let mode = "walk";
  let modeUntil = 0;
  let frameIndex = 0;
  let lastStep = 0;
  let last = 0;
  let nextRestAt = 0;

  const rand = (a, b) => a + Math.random() * (b - a);

  function show(frame) {
    cat.style.width = frame.w + "px";
    cat.style.backgroundPosition = `-${frame.x}px 0`;
  }

  function place() {
    // Walk frames face right; mirror for leftward travel.
    cat.style.transform = `translateX(${x}px) scaleX(${dir})`;
  }

  function scheduleRest(now) {
    nextRestAt = now + rand(5000, 11000);
  }

  function rest(now, pose, ms) {
    mode = pose;
    modeUntil = now + ms;
    frameIndex = 0;
  }

  function tick(now) {
    if (!last) { last = now; scheduleRest(now); }
    const dt = Math.min(now - last, 100) / 1000;
    last = now;
    const width = track.clientWidth;

    if (mode === "walk") {
      x += SPEED * dt * dir;
      if (x > width + 20) { dir = -1; x = width + 20; }
      if (x < -80) { dir = 1; x = -80; }
      if (now > nextRestAt && x > 40 && x < width - 100) {
        const pose = REST_POSES[Math.floor(Math.random() * REST_POSES.length)];
        rest(now, pose, pose === "sleep" ? rand(5000, 8000) : rand(2200, 4200));
      }
    } else if (now > modeUntil) {
      mode = "walk";
      if (Math.random() < 0.35) dir *= -1;
      scheduleRest(now);
    }

    if (now - lastStep > (mode === "walk" ? STEP_MS : 700)) {
      lastStep = now;
      const set = FRAMES[mode];
      frameIndex = (frameIndex + 1) % set.length;
      show(set[frameIndex]);
    }
    place();
    requestAnimationFrame(tick);
  }

  cat.addEventListener("click", () => {
    const now = performance.now();
    rest(now, "happy", 1400);
    show(FRAMES.happy[0]);
  });

  if (reduced.matches) {
    x = Math.max(0, track.clientWidth - 120);
    show(FRAMES.loaf[0]);
    place();
  } else {
    show(FRAMES.walk[0]);
    place();
    requestAnimationFrame(tick);
  }
})();

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
