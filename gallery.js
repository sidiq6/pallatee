(() => {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  const filters = [...document.querySelectorAll('.filter-button')];
  const count = document.getElementById('gallery-count');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const closeButton = document.getElementById('lightbox-close');
  const prevButton = document.getElementById('lightbox-prev');
  const nextButton = document.getElementById('lightbox-next');
  let items = [];
  let visibleItems = [];
  let currentIndex = 0;
  let lastFocus = null;

  const categoryNames = { together: 'Together', core: 'Core moments', bali: 'Bali trip', portrait: 'Class portrait' };
  const safeAlt = (category, index) => `${categoryNames[category] || 'Class memory'} — photo ${index + 1}`;

  const makeCard = (item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-card';
    button.setAttribute('aria-label', `Open ${safeAlt(item.category, item.index)}`);
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = safeAlt(item.category, item.index);
    img.loading = 'lazy';
    img.decoding = 'async';
    const label = document.createElement('span');
    label.className = 'gallery-card-label';
    label.innerHTML = `${categoryNames[item.category]}<small>VIEW MEMORY ↗</small>`;
    button.append(img, label);
    button.addEventListener('click', () => openLightbox(item));
    return button;
  };

  const render = (filter = 'all') => {
    visibleItems = filter === 'all' ? [...items] : items.filter((item) => item.category === filter);
    grid.replaceChildren();
    visibleItems.forEach((item, index) => grid.appendChild(makeCard(item, index)));
    count.textContent = `${visibleItems.length} ${visibleItems.length === 1 ? 'PHOTO' : 'PHOTOS'}`;
  };

  const openLightbox = (item) => {
    visibleItems = visibleItems.length ? visibleItems : items;
    currentIndex = visibleItems.findIndex((entry) => entry.src === item.src);
    if (currentIndex < 0) currentIndex = 0;
    lastFocus = document.activeElement;
    updateLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  };

  const updateLightbox = () => {
    const item = visibleItems[currentIndex];
    if (!item) return;
    lightboxImage.src = item.src;
    lightboxImage.alt = safeAlt(item.category, item.index);
    lightboxCaption.textContent = categoryNames[item.category];
    lightboxCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImage.src = '';
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  };
  const move = (direction) => {
    currentIndex = (currentIndex + direction + visibleItems.length) % visibleItems.length;
    updateLightbox();
  };

  filters.forEach((button) => button.addEventListener('click', () => {
    filters.forEach((filter) => filter.classList.toggle('is-selected', filter === button));
    render(button.dataset.filter);
  }));
  closeButton.addEventListener('click', closeLightbox);
  prevButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });

  fetch('data/gallery.json')
    .then((response) => { if (!response.ok) throw new Error('Unable to load gallery data'); return response.json(); })
    .then((data) => {
      Object.entries(data).forEach(([category, files]) => {
        files.forEach((file, index) => items.push({ src: file.src, category, index }));
      });
      items.push({ src: 'assets/images/albums/class-portrait-poster.webp', category: 'portrait', index: 0 });
      render('all');
    })
    .catch(() => {
      grid.innerHTML = '<p class="gallery-loading">Album belum dapat dimuat. Jalankan website menggunakan VS Code Live Server.</p>';
      count.textContent = 'ASSET ERROR';
    });
})();
