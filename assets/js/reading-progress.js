(function () {
  const article = document.querySelector(".post-content-main");
  if (!article) return;

  const bar = document.querySelector(".reading-progress-bar");
  if (!bar) return;

  let ticking = false;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    bar.style.width = progress + "%";

    if (progress > 0) {
      bar.classList.add("reading-progress-active");
    } else {
      bar.classList.remove("reading-progress-active");
    }
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  });
})();
