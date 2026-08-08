class LoemiesProduct extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === 'true') return;

    this.dataset.initialized = 'true';
    this.dataset.enhanced = 'true';

    this.variantSelect = this.querySelector('[data-variant-select]');
    this.quantityInput = this.querySelector('[data-quantity-input]');
    this.mediaTrack = this.querySelector('[data-media-track]');
    this.mediaItems = Array.from(this.querySelectorAll('[data-product-media]'));
    this.mediaThumbnails = Array.from(this.querySelectorAll('[data-media-thumbnail]'));
    this.galleryPrevious = this.querySelector('[data-gallery-previous]');
    this.galleryNext = this.querySelector('[data-gallery-next]');
    this.mediaCounterCurrent = this.querySelector('[data-media-counter-current]');
    this.lightbox = this.querySelector('[data-product-lightbox]');
    this.lightboxImage = this.querySelector('[data-lightbox-image]');
    this.lightboxTriggers = Array.from(this.querySelectorAll('[data-lightbox-open]'));
    this.wishlistButton = this.querySelector('[data-wishlist-toggle]');
    this.mobileBuyBar = this.querySelector('[data-mobile-buy-bar]');
    this.productDetails = this.querySelector('[data-product-details]');
    this.productForm = this.querySelector('[data-product-form]');
    this.cartNotification = document.querySelector('[data-cart-notification]');
    this.mobileGalleryQuery = window.matchMedia('(max-width: 47.99rem)');
    this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    this.syncMediaAccessibility();
    this.mobileGalleryQuery.addEventListener?.('change', () => this.syncMediaAccessibility());

    this.bindGallery();
    this.bindThumbnailImages();
    this.bindLightbox();
    this.bindWishlist();
    this.bindQuantity();
    this.bindVariants();
    this.bindMobileBuyBar();
    this.bindProductDetails();
    this.bindCartNotification();
    this.bindReviews();

    const initialModelMedia = this.mediaItems.find((item) => (
      item.classList.contains('is-active') && item.querySelector('model-viewer')
    ));

    if (initialModelMedia) {
      const initializeInitialModel = () => this.initializeProductModels(initialModelMedia);
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(initializeInitialModel, { timeout: 1500 });
      } else {
        window.setTimeout(initializeInitialModel, 0);
      }
    }
  }

  bindGallery() {
    this.mediaThumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener('click', (event) => {
        event.preventDefault();
        this.activateMedia(thumbnail.dataset.mediaId, true);
      });
    });

    this.galleryPrevious?.addEventListener('click', () => this.stepMedia(-1));
    this.galleryNext?.addEventListener('click', () => this.stepMedia(1));
    this.bindMediaCarousel();
    this.bindStageImages();
    this.updateGalleryControls();
  }

  isMediaCarousel() {
    return Boolean(this.mediaTrack) && this.mobileGalleryQuery.matches;
  }

  mediaScrollBehavior() {
    return this.reducedMotionQuery.matches ? 'auto' : 'smooth';
  }

  // On mobile the stage is a scroll-snap carousel: every slide stays visible
  // and reachable by swipe, so none of them may be aria-hidden. On desktop
  // only the active slide is shown and the rest are hidden from everyone.
  syncMediaAccessibility() {
    const carousel = this.isMediaCarousel();

    this.mediaItems.forEach((item) => {
      if (carousel) {
        item.removeAttribute('aria-hidden');
      } else {
        item.setAttribute('aria-hidden', String(!item.classList.contains('is-active')));
      }
    });

    if (carousel) this.scrollToActiveMedia('auto');
  }

  scrollToActiveMedia(behavior) {
    if (!this.mediaTrack) return;

    const activeMedia = this.mediaItems.find((item) => item.classList.contains('is-active'));
    if (!activeMedia) return;

    this.mediaTrack.scrollTo({
      left: activeMedia.offsetLeft,
      behavior: behavior || this.mediaScrollBehavior(),
    });
  }

  // Keeps the counter, arrows, and lazy image upgrades in sync with native
  // swiping by deriving the current slide from the scroll position.
  bindMediaCarousel() {
    if (!this.mediaTrack || this.mediaItems.length < 2) return;

    let scrollScheduled = false;
    this.mediaTrack.addEventListener('scroll', () => {
      if (scrollScheduled) return;
      scrollScheduled = true;
      window.requestAnimationFrame(() => {
        scrollScheduled = false;
        this.syncCarouselFromScroll();
      });
    }, { passive: true });
  }

  syncCarouselFromScroll() {
    if (!this.isMediaCarousel()) return;

    const slideWidth = this.mediaTrack.clientWidth;
    if (!slideWidth) return;

    const rawIndex = Math.round(this.mediaTrack.scrollLeft / slideWidth);
    const index = Math.max(0, Math.min(this.mediaItems.length - 1, rawIndex));
    const item = this.mediaItems[index];
    if (!item || item.classList.contains('is-active')) return;

    this.loadDeferredMediaImage(item);
    this.markActiveMedia(item, false);
  }

  // Carousel counterpart of the thumbnail-rail observer: upgrades placeholder
  // slides to their responsive sources as they scroll into (or near) view.
  bindStageImages() {
    if (!this.mediaTrack || !('IntersectionObserver' in window)) return;

    const deferredItems = this.mediaItems.filter((item) => item.querySelector('[data-media-image-src]'));
    if (!deferredItems.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        this.loadDeferredMediaImage(entry.target);
        observer.unobserve(entry.target);
      });
    }, { root: this.mediaTrack, rootMargin: '100% 100%', threshold: 0.01 });

    deferredItems.forEach((item) => observer.observe(item));
  }

  bindThumbnailImages() {
    const deferredImages = Array.from(this.querySelectorAll('[data-thumbnail-src]'));
    if (!deferredImages.length) return;

    const loadImage = (image) => {
      if (!image.dataset.thumbnailSrc) return;

      const source = image.dataset.thumbnailSrc;
      const sourceAtWidth = (width) => source.replace(/([?&])width=\d+/, `$1width=${width}`);
      image.sizes = '68px';
      image.srcset = [64, 96, 128, 144, 180]
        .map((width) => `${sourceAtWidth(width)} ${width}w`)
        .join(', ');
      image.src = source;
      image.removeAttribute('data-thumbnail-src');
    };

    if (!('IntersectionObserver' in window)) {
      deferredImages.forEach(loadImage);
      return;
    }

    const thumbnailRail = this.querySelector('.loemies-product__thumbnails');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadImage(entry.target);
        observer.unobserve(entry.target);
      });
    }, { root: thumbnailRail, threshold: 0.01 });

    deferredImages.forEach((image) => observer.observe(image));
  }

  stepMedia(direction) {
    const activeIndex = this.mediaItems.findIndex((item) => item.classList.contains('is-active'));
    if (activeIndex < 0) return;

    const nextMedia = this.mediaItems[activeIndex + direction];
    if (nextMedia) this.activateMedia(nextMedia.dataset.mediaId, false);
  }

  updateGalleryControls() {
    const activeIndex = this.mediaItems.findIndex((item) => item.classList.contains('is-active'));
    if (activeIndex < 0) return;

    if (this.galleryPrevious) this.galleryPrevious.disabled = activeIndex === 0;
    if (this.galleryNext) this.galleryNext.disabled = activeIndex === this.mediaItems.length - 1;
    if (this.mediaCounterCurrent) this.mediaCounterCurrent.textContent = String(activeIndex + 1);
  }

  bindLightbox() {
    if (!this.lightbox || !this.lightboxImage || !this.lightboxTriggers.length) return;

    this.lightboxPrevious = this.lightbox.querySelector('[data-lightbox-previous]');
    this.lightboxNext = this.lightbox.querySelector('[data-lightbox-next]');

    this.lightboxTriggers.forEach((trigger) => {
      trigger.addEventListener('click', () => this.openLightbox(trigger));
    });

    this.lightboxPrevious?.addEventListener('click', () => this.stepLightbox(-1));
    this.lightboxNext?.addEventListener('click', () => this.stepLightbox(1));

    this.lightbox.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      this.stepLightbox(event.key === 'ArrowLeft' ? -1 : 1);
    });

    this.lightbox.querySelector('[data-lightbox-close]')?.addEventListener('click', () => {
      this.lightbox.close();
    });

    this.lightbox.addEventListener('click', (event) => {
      if (event.target === this.lightbox || event.target.matches('[data-lightbox-layout]')) {
        this.lightbox.close();
      }
    });

    this.lightbox.addEventListener('close', () => {
      this.lightboxImage.removeAttribute('src');
      this.lightboxImage.alt = '';

      const trigger = this.lightboxTrigger;
      this.lightboxTrigger = null;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    });
  }

  openLightbox(trigger) {
    if (typeof this.lightbox.showModal !== 'function') return;
    if (!this.showLightboxMedia(trigger)) return;

    if (!this.lightbox.open) this.lightbox.showModal();
  }

  showLightboxMedia(trigger) {
    const sourceImage = trigger.querySelector('img');
    const source = sourceImage?.dataset.mediaImageSrc || sourceImage?.currentSrc || sourceImage?.src;
    if (!source) return false;

    this.lightboxTrigger = trigger;
    this.lightboxImage.src = source.replace(/([?&])width=\d+/, '$1width=2400');
    this.lightboxImage.alt = sourceImage.alt || '';
    this.updateLightboxControls();
    return true;
  }

  stepLightbox(direction) {
    if (!this.lightbox?.open || !this.lightboxTrigger) return;

    const index = this.lightboxTriggers.indexOf(this.lightboxTrigger);
    if (index < 0) return;

    const nextTrigger = this.lightboxTriggers[index + direction];
    if (nextTrigger) this.showLightboxMedia(nextTrigger);
  }

  updateLightboxControls() {
    const index = this.lightboxTriggers.indexOf(this.lightboxTrigger);

    if (this.lightboxPrevious) this.lightboxPrevious.disabled = index <= 0;
    if (this.lightboxNext) {
      this.lightboxNext.disabled = index < 0 || index >= this.lightboxTriggers.length - 1;
    }
  }

  bindWishlist() {
    if (!this.wishlistButton) return;

    const productKey = this.wishlistButton.dataset.wishlistKey;
    const productHandle = this.wishlistButton.dataset.wishlistHandle;
    if (!productKey || !productHandle) return;

    this.wishlistStorageKey = `loemies:wishlist:${productKey}`;
    this.wishlistListStorageKey = 'loemies:wishlist:v1';
    const productRecord = {
      id: productKey,
      handle: productHandle,
      title: this.wishlistButton.dataset.wishlistTitle || '',
      url: this.wishlistButton.dataset.wishlistUrl || '',
      image: this.wishlistButton.dataset.wishlistImage || '',
      price: Number(this.wishlistButton.dataset.wishlistPrice || 0),
      currency: this.wishlistButton.dataset.wishlistCurrency || 'EUR',
      available: this.wishlistButton.dataset.wishlistAvailable === 'true',
      addedAt: new Date().toISOString(),
    };
    let wishlistItems = [];
    let legacySaved = false;

    try {
      const storedItems = JSON.parse(window.localStorage.getItem(this.wishlistListStorageKey) || '[]');
      wishlistItems = Array.isArray(storedItems) ? storedItems.filter((item) => item?.handle) : [];
      legacySaved = window.localStorage.getItem(this.wishlistStorageKey) === 'true';
    } catch (_error) {
      wishlistItems = [];
    }

    let isSaved = wishlistItems.some((item) => (
      String(item.id) === String(productKey) || item.handle === productHandle
    ));

    // Migrate the previous per-product Boolean storage format whenever that
    // product is visited, preserving existing saved hearts after the upgrade.
    if (!isSaved && legacySaved) {
      wishlistItems.push(productRecord);
      isSaved = true;
      try {
        window.localStorage.setItem(this.wishlistListStorageKey, JSON.stringify(wishlistItems));
        window.localStorage.removeItem(this.wishlistStorageKey);
      } catch (_error) {
        // The current-page state still reflects the legacy saved value.
      }
      document.dispatchEvent(new CustomEvent('loemies:wishlist:change', {
        detail: { count: wishlistItems.length },
      }));
    }

    this.updateWishlist(isSaved);
    this.wishlistButton.addEventListener('click', () => {
      const nextState = this.wishlistButton.getAttribute('aria-pressed') !== 'true';

      try {
        const latestStoredItems = JSON.parse(window.localStorage.getItem(this.wishlistListStorageKey) || '[]');
        if (Array.isArray(latestStoredItems)) {
          wishlistItems = latestStoredItems.filter((item) => item?.handle);
        }

        if (nextState) {
          wishlistItems = wishlistItems.filter((item) => (
            String(item.id) !== String(productKey) && item.handle !== productHandle
          ));
          wishlistItems.push(productRecord);
        } else {
          wishlistItems = wishlistItems.filter((item) => (
            String(item.id) !== String(productKey) && item.handle !== productHandle
          ));
        }
        window.localStorage.setItem(this.wishlistListStorageKey, JSON.stringify(wishlistItems));
        window.localStorage.removeItem(this.wishlistStorageKey);
      } catch (_error) {
        // Keep the control useful for this page view when storage is unavailable.
      }

      this.updateWishlist(nextState);
      document.dispatchEvent(new CustomEvent('loemies:wishlist:change', {
        detail: { count: wishlistItems.length },
      }));
    });
  }

  updateWishlist(isSaved) {
    if (!this.wishlistButton) return;

    const label = isSaved
      ? this.wishlistButton.dataset.labelRemove
      : this.wishlistButton.dataset.labelSave;

    this.wishlistButton.setAttribute('aria-pressed', String(isSaved));
    this.wishlistButton.setAttribute('aria-label', label);
    this.wishlistButton.title = label;
  }

  bindQuantity() {
    if (!this.quantityInput) return;

    this.querySelector('[data-quantity-minus]')?.addEventListener('click', () => {
      this.changeQuantity(-1);
    });

    this.querySelector('[data-quantity-plus]')?.addEventListener('click', () => {
      this.changeQuantity(1);
    });

    this.quantityInput.addEventListener('input', () => this.updateQuantityButtons());
    this.quantityInput.addEventListener('change', () => this.updateQuantityButtons());
    this.updateQuantityButtons();
  }

  bindVariants() {
    if (!this.variantSelect) return;

    this.variantSelect.addEventListener('change', () => this.updateVariant());
  }

  bindMobileBuyBar() {
    const primarySubmit = this.querySelector('[data-product-submit]');
    if (!this.mobileBuyBar || !primarySubmit || !('IntersectionObserver' in window)) return;

    this.mobileBuyBarObserver = new IntersectionObserver(([entry]) => {
      const hasScrolledPastSubmit = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      this.mobileBuyBar.classList.toggle('is-visible', hasScrolledPastSubmit);
      this.mobileBuyBar.toggleAttribute('inert', !hasScrolledPastSubmit);
      if (hasScrolledPastSubmit) this.loadMobileBuyBarImage();
    }, { threshold: 0 });

    this.mobileBuyBarObserver.observe(primarySubmit);
  }

  bindProductDetails() {
    if (!this.productDetails) return;

    const mobileQuery = window.matchMedia('(max-width: 47.99rem)');
    const updateDisclosure = (event) => {
      this.productDetails.open = !event.matches;
    };

    updateDisclosure(mobileQuery);
    mobileQuery.addEventListener?.('change', updateDisclosure);
  }

  bindCartNotification() {
    if (!this.productForm || !this.cartNotification || !window.fetch || !window.FormData) return;

    this.productForm.addEventListener('submit', (event) => this.addToCart(event));

    if (this.cartNotification.dataset.initialized === 'true') return;
    this.cartNotification.dataset.initialized = 'true';

    this.cartNotification.querySelectorAll('[data-cart-notification-close]').forEach((button) => {
      button.addEventListener('click', () => this.closeCartNotification());
    });

    this.cartNotification.addEventListener('cancel', (event) => {
      event.preventDefault();
      this.closeCartNotification();
    });
  }

  async addToCart(event) {
    event.preventDefault();
    this.setCartLoading(true);

    const root = window.Shopify?.routes?.root || '/';
    const errorElement = this.cartNotification.querySelector('[data-cart-notification-error]');
    if (errorElement) errorElement.hidden = true;

    try {
      const addResponse = await fetch(`${root}cart/add.js`, {
        method: 'POST',
        body: new FormData(this.productForm),
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      const addedItem = await addResponse.json();

      if (!addResponse.ok) {
        throw new Error(addedItem.description || addedItem.message || this.dataset.cartError);
      }

      const cartResponse = await fetch(`${root}cart.js`, {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!cartResponse.ok) throw new Error(this.dataset.cartError);

      const cart = await cartResponse.json();
      this.updateCartNotification(addedItem, cart);
      this.openCartNotification();
    } catch (error) {
      if (errorElement) {
        errorElement.textContent = error.message;
        errorElement.hidden = false;
        this.openCartNotification();
      } else {
        HTMLFormElement.prototype.submit.call(this.productForm);
      }
    } finally {
      this.setCartLoading(false);
    }
  }

  setCartLoading(isLoading) {
    const buttons = [
      this.querySelector('[data-product-submit]'),
      this.querySelector('[data-product-submit-mobile]'),
    ].filter(Boolean);

    buttons.forEach((button) => {
      button.disabled = isLoading;
      button.setAttribute('aria-busy', String(isLoading));
    });

    if (!isLoading) {
      const selectedOption = this.variantSelect?.selectedOptions[0];
      this.updateAvailability(selectedOption ? selectedOption.dataset.available === 'true' : true);
    }
  }

  updateCartNotification(item, cart) {
    const image = this.cartNotification.querySelector('[data-cart-notification-image]');
    const title = this.cartNotification.querySelector('[data-cart-notification-product]');
    const variant = this.cartNotification.querySelector('[data-cart-notification-variant]');
    const quantity = this.cartNotification.querySelector('[data-cart-notification-quantity]');
    const price = this.cartNotification.querySelector('[data-cart-notification-price]');
    const total = this.cartNotification.querySelector('[data-cart-notification-total]');

    const imageUrl = item.featured_image?.url || item.image;
    if (image && imageUrl) {
      image.src = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}width=224`;
      image.alt = item.product_title || '';
      image.hidden = false;
    } else if (image) {
      image.hidden = true;
    }

    if (title) title.textContent = item.product_title || item.title || '';
    if (variant) {
      variant.textContent = item.variant_title || '';
      variant.hidden = !item.variant_title;
    }
    if (quantity) quantity.textContent = String(item.quantity || 1);
    if (price) price.textContent = this.formatMoney(item.final_price ?? item.price, cart.currency);
    if (total) total.textContent = this.formatMoney(cart.total_price, cart.currency);
    this.updateShippingNotice(cart);

    document.querySelectorAll('.header-cart__count').forEach((count) => {
      count.textContent = String(cart.item_count);
    });
    document.querySelectorAll('.header-cart').forEach((link) => {
      link.setAttribute(
        'aria-label',
        this.dataset.cartLabelTemplate.replace('__COUNT__', String(cart.item_count)),
      );
    });
  }

  formatMoney(amount, currency) {
    // Prefer the shared shop-format formatter from product-card.js so
    // JS-rendered prices match Liquid's `| money` output exactly.
    if (typeof window.LoemiesFormatMoney === 'function') {
      return window.LoemiesFormatMoney(amount, currency);
    }

    try {
      return new Intl.NumberFormat(document.documentElement.lang || 'en', {
        style: 'currency',
        currency: currency || 'EUR',
      }).format(Number(amount || 0) / 100);
    } catch (_error) {
      return `${(Number(amount || 0) / 100).toFixed(2)} ${currency || 'EUR'}`;
    }
  }

  // Mirrors the free-shipping progress line in the cart drawer: the dialog
  // markup and data attributes ship with the cart notification snippet, so
  // degrade silently whenever they are absent.
  updateShippingNotice(cart) {
    const notice = this.cartNotification.querySelector('[data-cart-notification-shipping]');
    if (!notice) return;

    const threshold = Number(this.cartNotification.dataset.freeShippingThreshold);
    const belowTemplate = this.cartNotification.dataset.shippingBelowTemplate;
    const aboveText = this.cartNotification.dataset.shippingAbove;
    const staticText = this.cartNotification.dataset.shippingStatic || '';
    if (!Number.isFinite(threshold) || threshold <= 0 || !belowTemplate || !aboveText) {
      notice.textContent = staticText;
      notice.classList.remove('is-unlocked');
      notice.hidden = !staticText;
      return;
    }

    const remaining = threshold - Number(cart.total_price || 0);
    notice.textContent = remaining > 0
      ? belowTemplate.replace('{amount}', this.formatMoney(remaining, cart.currency))
      : aboveText;
    notice.hidden = false;
  }

  openCartNotification() {
    if (typeof this.cartNotification.showModal !== 'function') {
      window.location.assign(`${window.Shopify?.routes?.root || '/'}cart`);
      return;
    }

    if (!this.cartNotification.open) this.cartNotification.showModal();
    document.documentElement.classList.add('cart-notification-open');
    window.requestAnimationFrame(() => {
      this.cartNotification.classList.add('is-open');
      this.cartNotification.querySelector('.loemies-cart-notification__close')?.focus({ preventScroll: true });
    });
  }

  closeCartNotification() {
    this.cartNotification.classList.remove('is-open');
    document.documentElement.classList.remove('cart-notification-open');

    window.setTimeout(() => {
      if (this.cartNotification.open) this.cartNotification.close();
    }, 180);
  }

  loadMobileBuyBarImage() {
    const image = this.mobileBuyBar?.querySelector('[data-mobile-bar-image-src]');
    if (!image) return;

    const source = image.dataset.mobileBarImageSrc;
    const sourceAtWidth = (width) => source.replace(/([?&])width=\d+/, `$1width=${width}`);
    image.sizes = '40px';
    image.srcset = [48, 72, 96].map((width) => `${sourceAtWidth(width)} ${width}w`).join(', ');
    image.src = source;
    image.removeAttribute('data-mobile-bar-image-src');
  }

  changeQuantity(direction) {
    const step = Number(this.quantityInput.step) || 1;
    const min = Number(this.quantityInput.min) || step;
    const max = this.quantityInput.max ? Number(this.quantityInput.max) : Number.POSITIVE_INFINITY;
    const current = Number(this.quantityInput.value) || min;
    const next = Math.min(max, Math.max(min, current + direction * step));

    this.quantityInput.value = String(next);
    this.quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
    this.updateQuantityButtons();
  }

  updateVariant() {
    const selectedOption = this.variantSelect.selectedOptions[0];
    if (!selectedOption) return;

    const available = selectedOption.dataset.available === 'true';
    const compareAtPrice = selectedOption.dataset.compareAtPrice || '';
    const mediaId = selectedOption.dataset.mediaId;
    const variantUrl = selectedOption.dataset.url;

    this.updateText('[data-product-price]', selectedOption.dataset.price);
    this.updateText('[data-product-price-mobile]', selectedOption.dataset.price);
    this.updateText('[data-product-compare-price]', compareAtPrice);
    this.updateText('[data-product-sku]', selectedOption.dataset.sku);
    this.updateText('[data-unit-price]', selectedOption.dataset.unitPrice);

    this.toggleElement('[data-product-compare-price]', Boolean(compareAtPrice));
    this.toggleElement('[data-sale-badge]', Boolean(compareAtPrice));
    this.toggleElement('[data-product-sku-row]', Boolean(selectedOption.dataset.sku));
    this.toggleElement('[data-unit-price-row]', Boolean(selectedOption.dataset.unitPrice));

    this.updateAvailability(available);
    this.updateQuantityRules(selectedOption);
    this.updateShippingMessage(selectedOption);

    if (mediaId) this.activateMedia(mediaId, false);
    if (variantUrl) window.history.replaceState({}, '', variantUrl);

    this.variantSelect.dispatchEvent(new CustomEvent('variant:change', {
      bubbles: true,
      detail: { variantId: this.variantSelect.value, available },
    }));
  }

  updateAvailability(available) {
    const availability = this.querySelector('[data-product-availability]');
    const submitButton = this.querySelector('[data-product-submit]');
    const submitText = this.querySelector('[data-product-submit-text]');
    const mobileSubmitButton = this.querySelector('[data-product-submit-mobile]');
    const mobileSubmitText = this.querySelector('[data-product-submit-text-mobile]');
    const dynamicCheckout = this.querySelector('[data-dynamic-checkout]');

    if (availability) {
      availability.textContent = available ? this.dataset.availableText : this.dataset.soldOutText;
      availability.classList.toggle('is-sold-out', !available);
    }

    if (submitButton) submitButton.disabled = !available;
    if (submitText) submitText.textContent = available ? this.dataset.addToCartText : this.dataset.soldOutText;
    if (mobileSubmitButton) mobileSubmitButton.disabled = !available;
    if (mobileSubmitText) mobileSubmitText.textContent = available ? this.dataset.addToCartText : this.dataset.soldOutText;
    if (dynamicCheckout) dynamicCheckout.hidden = !available;
    if (this.quantityInput) this.quantityInput.disabled = !available;
    this.updateQuantityButtons();
  }

  updateShippingMessage(option) {
    const message = this.querySelector('[data-product-shipping-message]');
    if (!message) return;

    const threshold = Number(this.dataset.freeShippingThreshold) || 0;
    const price = Number(option.dataset.priceCents) || 0;
    const qualifies = threshold > 0 && price >= threshold;
    message.textContent = qualifies
      ? this.dataset.freeShippingQualified
      : this.dataset.shippingStandard;
  }

  updateQuantityRules(option) {
    if (!this.quantityInput) return;

    const min = Number(option.dataset.quantityMin) || 1;
    const step = Number(option.dataset.quantityStep) || 1;
    const max = option.dataset.quantityMax;

    this.quantityInput.min = String(min);
    this.quantityInput.step = String(step);

    if (max) {
      this.quantityInput.max = max;
    } else {
      this.quantityInput.removeAttribute('max');
    }

    const current = Number(this.quantityInput.value) || min;
    const upperBound = max ? Number(max) : Number.POSITIVE_INFINITY;
    const bounded = Math.min(upperBound, Math.max(min, current));
    let aligned = min + Math.round((bounded - min) / step) * step;

    if (aligned > upperBound) {
      aligned = min + Math.floor((upperBound - min) / step) * step;
    }

    this.quantityInput.value = String(Math.max(min, aligned));
    this.updateQuantityButtons();
  }

  updateQuantityButtons() {
    if (!this.quantityInput) return;

    const current = Number(this.quantityInput.value);
    const min = Number(this.quantityInput.min) || 1;
    const max = this.quantityInput.max ? Number(this.quantityInput.max) : Number.POSITIVE_INFINITY;
    const unavailable = this.quantityInput.disabled;
    const minus = this.querySelector('[data-quantity-minus]');
    const plus = this.querySelector('[data-quantity-plus]');

    if (minus) minus.disabled = unavailable || !Number.isFinite(current) || current <= min;
    if (plus) plus.disabled = unavailable || !Number.isFinite(current) || current >= max;
  }

  activateMedia(mediaId, focusThumbnail) {
    const activeMedia = this.mediaItems.find((item) => item.dataset.mediaId === String(mediaId));
    if (!activeMedia) return;

    this.loadDeferredMediaImage(activeMedia);
    this.markActiveMedia(activeMedia, focusThumbnail);

    if (this.isMediaCarousel()) this.scrollToActiveMedia();
  }

  // Updates active classes, accessibility state, thumbnails, and controls
  // without moving the carousel — swipe syncing reuses it mid-scroll.
  markActiveMedia(activeMedia, focusThumbnail) {
    const carousel = this.isMediaCarousel();

    this.mediaItems.forEach((item) => {
      const isActive = item === activeMedia;
      item.classList.toggle('is-active', isActive);

      if (carousel) {
        item.removeAttribute('aria-hidden');
      } else {
        item.setAttribute('aria-hidden', String(!isActive));
      }

      if (!isActive) this.pauseMedia(item);
    });

    this.mediaThumbnails.forEach((thumbnail) => {
      const isCurrent = thumbnail.dataset.mediaId === activeMedia.dataset.mediaId;

      if (isCurrent) {
        thumbnail.setAttribute('aria-current', 'true');
        if (!carousel) thumbnail.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        if (focusThumbnail) thumbnail.focus({ preventScroll: true });
      } else {
        thumbnail.removeAttribute('aria-current');
      }
    });

    if (activeMedia.querySelector('model-viewer')) {
      this.initializeProductModels(activeMedia);
    }

    this.updateGalleryControls();
  }

  loadDeferredMediaImage(mediaItem) {
    const image = mediaItem.querySelector('[data-media-image-src]');
    if (!image) return;

    const source = image.dataset.mediaImageSrc;
    const sourceAtWidth = (width) => source.replace(/([?&])width=\d+/, `$1width=${width}`);
    const sourceWidth = Number.parseInt(image.dataset.mediaImageWidth || '2200', 10);
    const widths = [360, 480, 540, 640, 672, 720, 800, 900, 1088, 1280, 1600, 1800, 2200].filter(
      (width) => width <= sourceWidth,
    );
    if (!widths.includes(sourceWidth)) widths.push(sourceWidth);

    image.sizes = '(min-width: 1280px) 544px, (min-width: 1024px) calc((100vw - 192px) / 2), (min-width: 768px) calc(100vw - 160px), calc(100vw - 32px)';
    image.srcset = widths.map((width) => `${sourceAtWidth(width)} ${width}w`).join(', ');
    image.src = source;
    image.removeAttribute('data-media-image-src');
  }

  pauseMedia(item) {
    item.querySelectorAll('video').forEach((video) => video.pause());
    item.querySelectorAll('model-viewer').forEach((model) => model.pause?.());
    item.querySelectorAll('iframe').forEach((frame) => {
      frame.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
      frame.contentWindow?.postMessage(JSON.stringify({ method: 'pause' }), '*');
    });
  }

  initializeProductModels(scope = this) {
    const modelElements = Array.from(scope.querySelectorAll('model-viewer')).filter(
      (model) => model.dataset.modelUiInitialized !== 'true',
    );
    if (!modelElements.length) return;

    const setupModelViewerUi = () => {
      modelElements.forEach((model) => {
        if (!model.dataset.modelUiInitialized && window.Shopify?.ModelViewerUI) {
          model.dataset.modelUiInitialized = 'true';
          model.modelViewerUi = new window.Shopify.ModelViewerUI(model);
        }

        const arButton = model.closest('[data-product-media]')?.querySelector('[data-model-ar]');
        if (arButton && typeof model.activateAR === 'function') {
          arButton.hidden = false;
          arButton.addEventListener('click', () => model.activateAR());
        }
      });
    };

    if (window.Shopify?.loadFeatures) {
      window.Shopify.loadFeatures([
        {
          name: 'model-viewer-ui',
          version: '1.0',
          onLoad: (error) => {
            if (!error) setupModelViewerUi();
          },
        },
      ]);
    } else {
      setupModelViewerUi();
    }

    this.initializeShopifyXr();
  }

  initializeShopifyXr() {
    if (this.productXrInitialized) return;

    const modelJson = this.querySelector('[data-product-model-json]');
    if (!modelJson) return;

    this.productXrInitialized = true;

    const setup = () => {
      if (!window.ShopifyXR || !modelJson.isConnected) return;

      try {
        window.ShopifyXR.addModels(JSON.parse(modelJson.textContent));
        window.ShopifyXR.setupXRElements();
        modelJson.remove();
      } catch (error) {
        console.warn('Unable to initialize Shopify XR media.', error);
      }
    };

    if (window.ShopifyXR) {
      setup();
      return;
    }

    document.addEventListener('shopify_xr_initialized', setup, { once: true });
    window.Shopify?.loadFeatures?.([
      {
        name: 'shopify-xr',
        version: '1.0',
        onLoad: (error) => {
          if (!error) setup();
        },
      },
    ]);
  }

  bindReviews() {
    this.reviewsSection = this.querySelector('[data-native-reviews]');
    if (!this.reviewsSection) return;

    this.reviewList = this.reviewsSection.querySelector('[data-review-list]');
    this.reviewCards = Array.from(this.reviewsSection.querySelectorAll('[data-review-card]'));
    this.reviewSort = this.reviewsSection.querySelector('[data-reviews-sort]');
    this.reviewLoadMore = this.reviewsSection.querySelector('[data-reviews-load-more]');
    this.reviewRatingFilters = Array.from(
      this.reviewsSection.querySelectorAll('[data-review-rating-filter]'),
    );
    this.visibleReviewCount = 5;
    this.activeReviewRating = null;

    if (!this.reviewList || !this.reviewCards.length) return;

    this.reviewSort?.addEventListener('change', () => {
      this.visibleReviewCount = 5;
      this.renderReviews();
    });

    this.reviewRatingFilters.forEach((button) => {
      button.addEventListener('click', () => {
        const rating = button.dataset.reviewRatingFilter;
        this.activeReviewRating = this.activeReviewRating === rating ? null : rating;
        this.visibleReviewCount = 5;

        this.reviewRatingFilters.forEach((filterButton) => {
          filterButton.setAttribute(
            'aria-pressed',
            String(filterButton.dataset.reviewRatingFilter === this.activeReviewRating),
          );
        });

        this.renderReviews();
      });
    });

    this.reviewLoadMore?.addEventListener('click', () => {
      this.visibleReviewCount += 5;
      this.renderReviews();
    });

    this.renderReviews();
  }

  renderReviews() {
    if (!this.reviewList || !this.reviewCards?.length) return;

    const sort = this.reviewSort?.value || 'newest';
    const sortedCards = [...this.reviewCards].sort((first, second) => {
      if (sort === 'highest' || sort === 'lowest') {
        const direction = sort === 'highest' ? -1 : 1;
        const ratingDifference = Number(first.dataset.reviewRating) - Number(second.dataset.reviewRating);
        if (ratingDifference !== 0) return ratingDifference * direction;
      }

      const dateDifference = Date.parse(second.dataset.reviewDate) - Date.parse(first.dataset.reviewDate);
      if (dateDifference !== 0) return dateDifference;
      return Number(first.dataset.reviewIndex) - Number(second.dataset.reviewIndex);
    });

    sortedCards.forEach((card) => this.reviewList.append(card));

    const matchingCards = sortedCards.filter(
      (card) => !this.activeReviewRating || card.dataset.reviewRating === this.activeReviewRating,
    );

    sortedCards.forEach((card) => {
      const matchIndex = matchingCards.indexOf(card);
      card.hidden = matchIndex < 0 || matchIndex >= this.visibleReviewCount;
    });

    if (this.reviewLoadMore) {
      this.reviewLoadMore.hidden = matchingCards.length <= this.visibleReviewCount;
    }
  }

  updateText(selector, value) {
    const element = this.querySelector(selector);
    if (element) element.textContent = value || '';
  }

  toggleElement(selector, show) {
    const element = this.querySelector(selector);
    if (element) element.hidden = !show;
  }
}

if (!customElements.get('loemies-product')) {
  customElements.define('loemies-product', LoemiesProduct);
}
