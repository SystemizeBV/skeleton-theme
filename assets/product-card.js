(() => {
  const WISHLIST_STORAGE_KEY = 'loemies:wishlist:v1';
  const notification = document.querySelector('[data-cart-notification]');
  let activeTrigger = null;
  const cartLabelTemplate = notification?.dataset.cartLabelTemplate || '';
  const cartError = notification?.dataset.cartError || '';

  const decodeHtmlEntities = (text) => {
    const decoder = document.createElement('textarea');
    decoder.innerHTML = text;
    return decoder.value;
  };

  // Shop money format string, e.g. "€{{amount_with_comma_separator}}",
  // so JS-rendered prices match Liquid's `| money` output exactly.
  const moneyFormat = decodeHtmlEntities(notification?.dataset.moneyFormat || '');

  const MONEY_PLACEHOLDER_DELIMITERS = {
    amount: { decimals: 2, thousands: ',', decimal: '.' },
    amount_no_decimals: { decimals: 0, thousands: ',', decimal: '.' },
    amount_with_comma_separator: { decimals: 2, thousands: '.', decimal: ',' },
    amount_no_decimals_with_comma_separator: { decimals: 0, thousands: '.', decimal: ',' },
    amount_with_apostrophe_separator: { decimals: 2, thousands: "'", decimal: '.' },
    amount_with_space_separator: { decimals: 2, thousands: ' ', decimal: ',' },
    amount_no_decimals_with_space_separator: { decimals: 0, thousands: ' ', decimal: ',' },
    amount_with_period_and_space_separator: { decimals: 2, thousands: ' ', decimal: '.' },
  };

  const formatMoney = (amount, currency) => {
    const value = Number(amount || 0) / 100;
    const placeholder = moneyFormat.match(/\{\{\s*(\w+)\s*\}\}/);
    const delimiters = MONEY_PLACEHOLDER_DELIMITERS[placeholder?.[1]];

    if (delimiters) {
      const [units, decimals] = value.toFixed(delimiters.decimals).split('.');
      const grouped = units.replace(/\B(?=(\d{3})+(?!\d))/g, delimiters.thousands);
      return moneyFormat.replace(placeholder[0], decimals ? grouped + delimiters.decimal + decimals : grouped);
    }

    try {
      return new Intl.NumberFormat(document.documentElement.lang || 'en', {
        style: 'currency',
        currency: currency || 'EUR',
      }).format(value);
    } catch (_error) {
      return `${value.toFixed(2)} ${currency || 'EUR'}`;
    }
  };

  // Shared with header.js so predictive-search prices match `| money` too.
  window.LoemiesFormatMoney = formatMoney;

  const closeNotification = () => {
    if (!notification) return;
    notification.classList.remove('is-open');
    document.documentElement.classList.remove('cart-notification-open');

    window.setTimeout(() => {
      if (notification.open) notification.close();
      if (activeTrigger?.isConnected) activeTrigger.focus({ preventScroll: true });
      activeTrigger = null;
    }, 180);
  };

  const openNotification = (trigger) => {
    if (!notification || typeof notification.showModal !== 'function') {
      window.location.assign(`${window.Shopify?.routes?.root || '/'}cart`);
      return;
    }

    activeTrigger = trigger;
    if (!notification.open) notification.showModal();
    document.documentElement.classList.add('cart-notification-open');
    window.requestAnimationFrame(() => {
      notification.classList.add('is-open');
      // Focus the heading first so screen readers announce "Added to your cart"
      // before the close button; Escape/close still return focus to the trigger.
      const focusTarget = notification.querySelector('#CartNotificationTitle')
        || notification.querySelector('.loemies-cart-notification__close');
      focusTarget?.focus({ preventScroll: true });
    });
  };

  const updateNotification = (item, cart) => {
    const image = notification.querySelector('[data-cart-notification-image]');
    const title = notification.querySelector('[data-cart-notification-product]');
    const variant = notification.querySelector('[data-cart-notification-variant]');
    const quantity = notification.querySelector('[data-cart-notification-quantity]');
    const price = notification.querySelector('[data-cart-notification-price]');
    const total = notification.querySelector('[data-cart-notification-total]');
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
    if (price) price.textContent = formatMoney(item.final_price ?? item.price, cart.currency);
    if (total) total.textContent = formatMoney(cart.total_price, cart.currency);

    // Free-shipping progress line; degrades silently when the data attributes are absent.
    const shipping = notification.querySelector('[data-cart-notification-shipping]');
    if (shipping) {
      const threshold = Number(notification.dataset.freeShippingThreshold || 0);
      const belowTemplate = notification.dataset.shippingBelowTemplate || '';
      const aboveText = notification.dataset.shippingAbove || '';
      const staticText = notification.dataset.shippingStatic || '';

      if (threshold > 0 && (belowTemplate || aboveText)) {
        const remaining = threshold - Number(cart.total_price || 0);
        const unlocked = remaining <= 0;
        shipping.textContent = unlocked
          ? aboveText
          : belowTemplate.replace('{amount}', formatMoney(remaining, cart.currency));
        shipping.classList.toggle('is-unlocked', unlocked);
        shipping.hidden = !shipping.textContent;
      } else if (staticText) {
        shipping.textContent = staticText;
        shipping.classList.remove('is-unlocked');
        shipping.hidden = false;
      } else {
        shipping.hidden = true;
      }
    }

    document.querySelectorAll('.header-cart__count').forEach((count) => {
      count.textContent = String(cart.item_count);
    });
    document.querySelectorAll('.header-cart').forEach((link) => {
      link.setAttribute('aria-label', cartLabelTemplate.replace('__COUNT__', String(cart.item_count)));
    });
  };

  const submitQuickAdd = async (event) => {
    const form = event.currentTarget;
    const button = form.querySelector('[data-quick-add-submit]');
    if (!notification || !window.fetch || !window.FormData || !button) return;

    event.preventDefault();
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');

    const errorElement = notification.querySelector('[data-cart-notification-error]');
    if (errorElement) errorElement.hidden = true;

    try {
      const root = window.Shopify?.routes?.root || '/';
      const addResponse = await fetch(`${root}cart/add.js`, {
        method: 'POST',
        body: new FormData(form),
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      const addedItem = await addResponse.json();

      if (!addResponse.ok) {
        throw new Error(addedItem.description || addedItem.message || cartError);
      }

      const cartResponse = await fetch(`${root}cart.js`, {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!cartResponse.ok) throw new Error(cartError);

      const cart = await cartResponse.json();
      updateNotification(addedItem, cart);
      openNotification(button);
    } catch (error) {
      if (!errorElement) {
        HTMLFormElement.prototype.submit.call(form);
        return;
      }

      errorElement.textContent = error.message;
      errorElement.hidden = false;
      openNotification(button);
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  };

  const initializeForms = (root = document) => {
    root.querySelectorAll('[data-quick-add-form]').forEach((form) => {
      if (form.dataset.quickAddInitialized === 'true') return;
      form.dataset.quickAddInitialized = 'true';
      form.addEventListener('submit', submitQuickAdd);
    });
  };

  const readWishlist = () => {
    try {
      const storedItems = JSON.parse(window.localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
      return Array.isArray(storedItems) ? storedItems.filter((item) => item?.handle) : [];
    } catch (_error) {
      return [];
    }
  };

  const updateWishlistButton = (button, items = readWishlist()) => {
    const isSaved = items.some((item) => (
      String(item.id) === String(button.dataset.wishlistKey)
      || item.handle === button.dataset.wishlistHandle
    ));
    const label = isSaved ? button.dataset.labelRemove : button.dataset.labelSave;
    button.setAttribute('aria-pressed', String(isSaved));
    button.setAttribute('aria-label', label || '');
    button.title = label || '';
  };

  const initializeWishlistButtons = (root = document) => {
    const items = readWishlist();
    root.querySelectorAll('[data-product-card-wishlist]').forEach((button) => {
      updateWishlistButton(button, items);
      if (button.dataset.wishlistInitialized === 'true') return;
      button.dataset.wishlistInitialized = 'true';

      button.addEventListener('click', () => {
        let wishlistItems = readWishlist();
        const productKey = button.dataset.wishlistKey;
        const productHandle = button.dataset.wishlistHandle;
        const isSaved = wishlistItems.some((item) => (
          String(item.id) === String(productKey) || item.handle === productHandle
        ));

        wishlistItems = wishlistItems.filter((item) => (
          String(item.id) !== String(productKey) && item.handle !== productHandle
        ));

        if (!isSaved) {
          wishlistItems.push({
            id: productKey,
            handle: productHandle,
            title: button.dataset.wishlistTitle || '',
            url: button.dataset.wishlistUrl || '',
            image: button.dataset.wishlistImage || '',
            price: Number(button.dataset.wishlistPrice || 0),
            currency: button.dataset.wishlistCurrency || 'EUR',
            available: button.dataset.wishlistAvailable === 'true',
            addedAt: new Date().toISOString(),
          });
        }

        try {
          window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
        } catch (_error) {
          // Keep the current-page state useful when storage is unavailable.
        }

        document.querySelectorAll('[data-product-card-wishlist]').forEach((candidate) => {
          updateWishlistButton(candidate, wishlistItems);
        });
        document.dispatchEvent(new CustomEvent('loemies:wishlist:change', {
          detail: { count: wishlistItems.length },
        }));
      });
    });
  };

  if (notification && notification.dataset.quickAddInitialized !== 'true') {
    notification.dataset.quickAddInitialized = 'true';
    notification.querySelectorAll('[data-cart-notification-close]').forEach((button) => {
      button.addEventListener('click', closeNotification);
    });
    notification.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeNotification();
    });
  }

  initializeForms();
  initializeWishlistButtons();
  document.addEventListener('shopify:section:load', (event) => {
    initializeForms(event.target);
    initializeWishlistButtons(event.target);
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== WISHLIST_STORAGE_KEY) return;
    const items = readWishlist();
    document.querySelectorAll('[data-product-card-wishlist]').forEach((button) => {
      updateWishlistButton(button, items);
    });
  });
})();
