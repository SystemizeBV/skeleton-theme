(() => {
  const selector = '[data-responsive-image-src]';
  // Product cards never render wider than 272px. A 960px ceiling still
  // covers very high-density displays without asking Shopify for 1200–1600px
  // card assets that cannot improve the visible result.
  const responsiveWidths = [180, 240, 320, 360, 400, 440, 480, 540, 640, 720, 800, 960];

  const loadImage = (image) => {
    const source = image.dataset.responsiveImageSrc;
    if (!source) return;

    const sourceAtWidth = (width) => source.replace(/([?&])width=\d+/, `$1width=${width}`);
    const sourceWidth = Number.parseInt(image.dataset.responsiveImageWidth || '960', 10);
    const widths = responsiveWidths.filter((width) => width <= sourceWidth);
    if (!widths.includes(sourceWidth)) widths.push(sourceWidth);
    image.sizes = image.dataset.responsiveImageSizes || '100vw';
    image.srcset = widths.map((width) => `${sourceAtWidth(width)} ${width}w`).join(', ');
    image.src = source;
    image.removeAttribute('data-responsive-image-src');
    image.removeAttribute('data-responsive-image-width');
    image.removeAttribute('data-responsive-image-sizes');
  };

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll(selector).forEach(loadImage);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      loadImage(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '400px 0px', threshold: 0.01 });

  const observeImages = (root = document) => {
    root.querySelectorAll(selector).forEach((image) => observer.observe(image));
  };

  observeImages();
  document.addEventListener('shopify:section:load', (event) => observeImages(event.target));
})();
