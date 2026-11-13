(() => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  document.body.classList.add('is-loading');
  const fill = document.getElementById('loading-fill');
  const percent = document.getElementById('loading-percent');
  const status = document.getElementById('loading-status');
  const enter = document.getElementById('enter-button');
  let finished = false;

  const setProgress = (value, message) => {
    const safe = Math.max(0, Math.min(100, Math.round(value)));
    fill.style.width = `${safe}%`;
    percent.textContent = `${safe}%`;
    if (message) status.textContent = message;
  };

  const preloadImage = (src) => new Promise((resolve) => {
    const image = new Image();
    const done = () => resolve({ ok: image.naturalWidth > 0, src });
    image.onload = async () => {
      try { if (image.decode) await image.decode(); } catch (_) { /* image is still usable */ }
      done();
    };
    image.onerror = done;
    image.src = src;
    if (image.complete) done();
  });

  const leave = () => {
    if (finished) return;
    finished = true;
    preloader.classList.add('is-leaving');
    document.body.classList.remove('is-loading');
    window.setTimeout(() => preloader.remove(), 800);
  };

  enter.addEventListener('click', leave);

  const criticalAssets = [
    'assets/images/brand/class-logo.webp',
    'assets/images/hero-class.webp'
  ];

  const run = async () => {
    setProgress(8, 'Preparing your universe...');
    let completed = 0;
    const jobs = criticalAssets.map(async (src) => {
      const result = await preloadImage(src);
      completed += 1;
      const value = 8 + (completed / criticalAssets.length) * 82;
      setProgress(value, result.ok ? (completed === 1 ? 'Loading class identity...' : 'Loading the first memory...') : 'Preparing available assets...');
      return result;
    });

    const timeout = new Promise((resolve) => window.setTimeout(() => resolve('timeout'), 5000));
    await Promise.race([Promise.allSettled(jobs), timeout]);
    setProgress(100, 'Your universe is ready.');
    enter.disabled = false;
    enter.classList.add('is-ready');
    // Short transition only; loading itself is based on the critical asset state.
    window.setTimeout(leave, 1100);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();
