(() => {
  const STORAGE_KEY = 'loemies:wishlist:v1';

  const readItems = () => {
    try {
      const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value.filter((item) => item?.handle) : [];
    } catch (_error) {
      return [];
    }
  };

  const writeItems = (items) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (_error) {
      // The page remains usable for this view when storage is blocked.
    }

    document.dispatchEvent(new CustomEvent('loemies:wishlist:change', {
      detail: { count: items.length },
    }));
  };

  const decodeHtmlEntities = (text) => {
    const decoder = document.createElement('textarea');
    decoder.innerHTML = text;
    return decoder.value;
  };

  // Same table as assets/cart.js so JS-rendered prices match Liquid's
  // `| money` output ("€41,99" instead of Intl's "€41.99").
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

  const createMoneyFormatter = (rawFormat) => {
    const format = decodeHtmlEntities(rawFormat || '');

    return (amount, currency) => {
      // Prefer the shared helper when product-card.js is present.
      if (typeof window.LoemiesFormatMoney === 'function') {
        return window.LoemiesFormatMoney(amount, currency);
      }

      const value = Number(amount || 0) / 100;
      const placeholder = format.match(/\{\{\s*(\w+)\s*\}\}/);
      const delimiters = MONEY_PLACEHOLDER_DELIMITERS[placeholder?.[1]];

      if (delimiters) {
        const [units, decimals] = value.toFixed(delimiters.decimals).split('.');
        const grouped = units.replace(/\B(?=(\d{3})+(?!\d))/g, delimiters.thousands);
        return format.replace(placeholder[0], decimals ? grouped + delimiters.decimal + decimals : grouped);
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
  };

  const createElement = (tag, className, textContent) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  };

  const initialize = async (page) => {
    if (page.dataset.initialized === 'true') return;
    page.dataset.initialized = 'true';

    const grid = page.querySelector('[data-wishlist-grid]');
    const empty = page.querySelector('[data-wishlist-empty]');
    const status = page.querySelector('[data-wishlist-status]');
    if (!grid || !empty || !status) return;

    // Shopify's global route always ends with a slash. The Liquid fallback
    // (routes.root_url) does not on locale paths like "/nl", which used to
    // produce "/nlproducts/…" fetches, so normalise it before concatenating.
    const rawRoot = window.Shopify?.routes?.root || page.dataset.rootUrl || '/';
    const root = rawRoot.endsWith('/') ? rawRoot : `${rawRoot}/`;
    const currency = page.dataset.currency || 'EUR';
    const formatMoney = createMoneyFormatter(page.dataset.moneyFormat);
    let items = readItems();

    const showEmpty = () => {
      grid.hidden = true;
      empty.hidden = false;
      status.textContent = '';
    };

    const removeItem = (handle, card, title) => {
      items = items.filter((item) => item.handle !== handle);
      writeItems(items);
      card.remove();
      status.textContent = (page.dataset.removedStatus || '')
        .replace('__PRODUCT__', title);
      if (!items.length) showEmpty();
    };

    const productUrl = (item) => `${root}products/${encodeURIComponent(item.handle)}`;

    const createRemoveButton = (item, card, title) => {
      const removeButton = createElement('button', 'wishlist-card__remove', page.dataset.removeLabel);
      removeButton.type = 'button';
      removeButton.setAttribute('aria-label', `${page.dataset.removeLabel}: ${title}`);
      removeButton.addEventListener('click', () => removeItem(item.handle, card, title));
      return removeButton;
    };

    const appendImage = (parent, imageUrl) => {
      if (imageUrl) {
        const image = document.createElement('img');
        image.src = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}width=600`;
        image.alt = '';
        image.width = 600;
        image.height = 600;
        image.loading = 'lazy';
        parent.append(image);
      } else {
        const placeholder = createElement('span', 'wishlist-card__placeholder', '♡');
        placeholder.setAttribute('aria-hidden', 'true');
        parent.append(placeholder);
      }
    };

    const updateCartCount = (cart) => {
      document.querySelectorAll('.header-cart__count').forEach((count) => {
        count.textContent = String(cart.item_count);
      });
      const labelTemplate = page.dataset.cartCountLabel || '';
      if (!labelTemplate) return;
      document.querySelectorAll('.header-cart').forEach((link) => {
        link.setAttribute('aria-label', labelTemplate.replace('__COUNT__', String(cart.item_count)));
      });
    };

    const addToCart = async (variantId, button, errorElement) => {
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      errorElement.hidden = true;

      try {
        const response = await fetch(`${root}cart/add.js`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.description || payload.message || page.dataset.addError);
        }

        const cartResponse = await fetch(`${root}cart.js`, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        });
        if (cartResponse.ok) updateCartCount(await cartResponse.json());

        const idleLabel = button.textContent;
        button.textContent = `${page.dataset.addedLabel} ✓`;
        button.classList.add('is-added');
        window.setTimeout(() => {
          button.textContent = idleLabel;
          button.classList.remove('is-added');
          button.disabled = false;
          button.removeAttribute('aria-busy');
        }, 2000);
      } catch (error) {
        errorElement.textContent = error?.message || page.dataset.addError;
        errorElement.hidden = false;
        button.disabled = false;
        button.removeAttribute('aria-busy');
      }
    };

    // Product gone from the store (404/410) or a snapshot without enough data:
    // a greyed, link-less card that stays in localStorage until the user
    // removes it themselves.
    const createUnavailableCard = (item) => {
      const title = item.title || page.dataset.unavailableLabel;
      const card = createElement('article', 'wishlist-card wishlist-card--unavailable');
      const media = createElement('div', 'wishlist-card__media');
      appendImage(media, item.image);

      const body = createElement('div', 'wishlist-card__body');
      body.append(createElement('h2', '', title));
      if (item.title) {
        body.append(createElement('p', 'wishlist-card__availability', page.dataset.unavailableLabel));
      }

      const actions = createElement('div', 'wishlist-card__actions');
      actions.append(createRemoveButton(item, card, title));
      body.append(actions);
      card.append(media, body);
      return card;
    };

    const createCard = (item, product) => {
      const title = product.title || item.title || item.handle;
      const url = productUrl(item);
      const card = createElement('article', 'wishlist-card');
      const imageLink = createElement('a', 'wishlist-card__media');
      imageLink.href = url;
      imageLink.setAttribute('aria-label', title);
      appendImage(imageLink, product.featured_image || product.images?.[0] || item.image);

      const body = createElement('div', 'wishlist-card__body');
      const heading = createElement('h2');
      const titleLink = createElement('a', '', title);
      titleLink.href = url;
      heading.append(titleLink);

      const price = createElement(
        'p',
        'wishlist-card__price',
        formatMoney(product.price ?? item.price, product.currency || item.currency || currency),
      );
      body.append(heading, price);

      if (product.available === false) {
        body.append(createElement('p', 'wishlist-card__availability', page.dataset.unavailableLabel));
      }

      const errorElement = createElement('p', 'wishlist-card__error');
      errorElement.hidden = true;
      errorElement.setAttribute('role', 'alert');

      const actions = createElement('div', 'wishlist-card__actions');
      const variants = Array.isArray(product.variants) ? product.variants : [];

      if (product.available !== false && variants.length === 1) {
        const addButton = createElement('button', 'wishlist-card__add', page.dataset.addToCartLabel);
        addButton.type = 'button';
        addButton.setAttribute('aria-label', `${page.dataset.addToCartLabel}: ${title}`);
        addButton.addEventListener('click', () => addToCart(variants[0].id, addButton, errorElement));
        actions.append(addButton);
      } else if (product.available !== false && variants.length > 1) {
        const chooseLink = createElement('a', '', page.dataset.chooseOptionsLabel);
        chooseLink.href = url;
        actions.append(chooseLink);
      } else {
        // Sold out, or rendered from the stored snapshot (no variant data).
        const viewLink = createElement('a', '', page.dataset.viewLabel);
        viewLink.href = url;
        actions.append(viewLink);
      }

      actions.append(createRemoveButton(item, card, title));
      body.append(actions, errorElement);
      card.append(imageLink, body);
      return card;
    };

    if (!items.length) {
      showEmpty();
      return;
    }

    const results = await Promise.all(items.map(async (item) => {
      try {
        const response = await fetch(`${root}products/${encodeURIComponent(item.handle)}.js`, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        });
        if (response.status === 404 || response.status === 410) return { item, unavailable: true };
        if (!response.ok) throw new Error('Product unavailable');
        return { item, product: await response.json() };
      } catch (_error) {
        // Transient failure: render from the stored snapshot when possible so
        // a flaky connection never hides (or deletes) a saved product.
        return item.title ? { item, product: item } : { item, unavailable: true };
      }
    }));

    const cards = results.map((result) => (
      result.product ? createCard(result.item, result.product) : createUnavailableCard(result.item)
    ));

    if (!cards.length) {
      status.textContent = page.dataset.loadError;
      empty.hidden = false;
      return;
    }

    grid.replaceChildren(...cards);
    grid.hidden = false;
    empty.hidden = true;
    status.textContent = '';
  };

  document.querySelectorAll('[data-wishlist-page]').forEach(initialize);
  document.addEventListener('shopify:section:load', (event) => {
    event.target.querySelectorAll('[data-wishlist-page]').forEach(initialize);
  });
})();
