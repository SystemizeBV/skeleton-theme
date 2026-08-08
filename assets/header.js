(() => {
  const WISHLIST_STORAGE_KEY = 'loemies:wishlist:v1';

  const readWishlist = () => {
    try {
      const value = JSON.parse(window.localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value.filter((item) => item?.handle) : [];
    } catch (_error) {
      return [];
    }
  };

  const updateWishlistCount = (event) => {
    const eventCount = Number(event?.detail?.count);
    const count = Number.isInteger(eventCount) ? eventCount : readWishlist().length;

    document.querySelectorAll('[data-wishlist-count]').forEach((element) => {
      element.textContent = String(count);
    });

    document.querySelectorAll('[data-wishlist-link]').forEach((link) => {
      const labelTemplate = link.dataset.labelTemplate || link.getAttribute('aria-label') || '';
      link.setAttribute('aria-label', labelTemplate.replace('__COUNT__', String(count)));
    });
  };

  const normalizeSearchQuery = (form) => {
    if (form.dataset.searchNormalized === 'true') return;
    form.dataset.searchNormalized = 'true';

    form.addEventListener('submit', (event) => {
      const input = form.querySelector('input[type="search"][name="q"]');
      if (!input) return;

      const query = input.value.trim();
      if (!query) return;

      // Shopify's predictive endpoint performs prefix matching, while the full
      // search endpoint on this shop requires an explicit trailing wildcard.
      // Normalizing here keeps Enter, the search button, and the results-page
      // form consistent with predictive suggestions.
      if (!query.endsWith('*')) input.value = `${query}*`;

      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
      }
    });
  };

  const initializeMenu = (menu) => {
    if (menu.dataset.initialized === 'true') return;
    menu.dataset.initialized = 'true';

    const summary = menu.querySelector(':scope > summary');
    const closeButton = menu.querySelector('[data-mobile-menu-close]');
    const panel = menu.querySelector('.mobile-menu__panel');
    const header = menu.closest('.site-header');
    const pageRegions = [
      document.querySelector('main'),
      document.querySelector('.shopify-section-group-footer-group'),
      header?.querySelector('.site-header__announcement'),
      menu.parentElement?.querySelector('.site-header__brand'),
      menu.parentElement?.querySelector('.header-search'),
      menu.parentElement?.querySelector('.site-header__actions'),
      header?.querySelector('.site-header__nav-row'),
    ].filter(Boolean);
    let lockedScrollY = 0;
    let previousBodyStyles = null;

    const lockPageScroll = () => {
      if (previousBodyStyles) return;
      lockedScrollY = window.scrollY;
      previousBodyStyles = {
        position: document.body.style.position,
        insetBlockStart: document.body.style.insetBlockStart,
        width: document.body.style.width,
        overflow: document.body.style.overflow,
      };
      document.documentElement.classList.add('mobile-menu-open');
      document.body.classList.add('mobile-menu-open');
      document.body.style.position = 'fixed';
      document.body.style.insetBlockStart = `-${lockedScrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    };

    const unlockPageScroll = () => {
      if (!previousBodyStyles) return;
      const restoreY = lockedScrollY;
      document.documentElement.classList.remove('mobile-menu-open');
      document.body.classList.remove('mobile-menu-open');
      document.body.style.position = previousBodyStyles.position;
      document.body.style.insetBlockStart = previousBodyStyles.insetBlockStart;
      document.body.style.width = previousBodyStyles.width;
      document.body.style.overflow = previousBodyStyles.overflow;
      previousBodyStyles = null;
      window.scrollTo({ top: restoreY, left: 0, behavior: 'instant' });
    };

    const close = ({ restoreFocus = true } = {}) => {
      if (!menu.open) return;
      menu.open = false;
      if (restoreFocus) summary?.focus({ preventScroll: true });
    };

    menu.addEventListener('toggle', () => {
      summary?.setAttribute('aria-expanded', String(menu.open));
      if (menu.open) {
        panel?.removeAttribute('inert');
        panel?.setAttribute('aria-hidden', 'false');
      } else {
        panel?.setAttribute('inert', '');
        panel?.setAttribute('aria-hidden', 'true');
      }
      pageRegions.forEach((region) => {
        if (menu.open) {
          region.setAttribute('inert', '');
        } else {
          region.removeAttribute('inert');
        }
      });

      if (menu.open) {
        lockPageScroll();
        window.requestAnimationFrame(() => {
          menu.querySelector('.mobile-menu__panel a, .mobile-menu__panel summary, .mobile-menu__panel button')
            ?.focus({ preventScroll: true });
        });
      } else {
        unlockPageScroll();
      }
    });

    closeButton?.addEventListener('click', () => close());

    menu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== 'Tab' || !menu.open) return;
      const focusable = [
        summary,
        ...menu.querySelectorAll('.mobile-menu__panel a, .mobile-menu__panel summary, .mobile-menu__panel button:not(:disabled)'),
      ].filter((element) => element && !element.closest('[inert]'));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => close({ restoreFocus: false }));
    });

    const desktopQuery = window.matchMedia('(min-width: 62rem)');
    const handleDesktop = (event) => {
      if (event.matches) close({ restoreFocus: false });
    };
    desktopQuery.addEventListener?.('change', handleDesktop);

    summary?.setAttribute('aria-expanded', String(menu.open));
    if (menu.open) {
      panel?.removeAttribute('inert');
      panel?.setAttribute('aria-hidden', 'false');
    } else {
      panel?.setAttribute('inert', '');
      panel?.setAttribute('aria-hidden', 'true');
    }
  };

  const initializeDesktopDropdown = (dropdown) => {
    if (dropdown.dataset.initialized === 'true') return;
    dropdown.dataset.initialized = 'true';

    dropdown.addEventListener('toggle', () => {
      if (!dropdown.open) return;
      document.querySelectorAll('.desktop-menu__dropdown[open]').forEach((candidate) => {
        if (candidate !== dropdown) candidate.open = false;
      });
    });

    dropdown.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !dropdown.open) return;
      event.preventDefault();
      dropdown.open = false;
      dropdown.querySelector(':scope > summary')?.focus({ preventScroll: true });
    });
  };

  const initializeSearch = (form) => {
    if (form.dataset.predictiveInitialized === 'true') return;
    form.dataset.predictiveInitialized = 'true';

    const input = form.querySelector('input[type="search"]');
    const panel = form.querySelector('[data-predictive-search-panel]');
    const results = form.querySelector('[data-predictive-search-results]');
    const status = form.querySelector('[data-predictive-search-status]');
    const allResults = form.querySelector('[data-predictive-search-all]');
    if (!input || !panel || !results || !status || !allResults || !window.fetch) return;

    let requestController = null;
    let requestTimer = null;

    const close = () => {
      panel.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
    };

    const open = () => {
      panel.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    };

    const formatPrice = (price) => {
      const currency = window.Shopify?.currency?.active || 'EUR';

      // Prefer the shop money-format formatter (product-card.js) so search
      // suggestions match Liquid's `| money` output; it expects cents.
      if (typeof window.LoemiesFormatMoney === 'function') {
        return window.LoemiesFormatMoney(Math.round(Number(price) * 100), currency);
      }

      // Keep predictive prices identical to Liquid's `money` filter even on
      // routes that do not load product-card.js.
      const moneyFormat = form.dataset.moneyFormat || '';
      const placeholder = moneyFormat.match(/\{\{\s*(\w+)\s*\}\}/);
      const delimiters = {
        amount: { decimals: 2, thousands: ',', decimal: '.' },
        amount_no_decimals: { decimals: 0, thousands: ',', decimal: '.' },
        amount_with_comma_separator: { decimals: 2, thousands: '.', decimal: ',' },
        amount_no_decimals_with_comma_separator: { decimals: 0, thousands: '.', decimal: ',' },
        amount_with_space_separator: { decimals: 2, thousands: ' ', decimal: ',' },
        amount_no_decimals_with_space_separator: { decimals: 0, thousands: ' ', decimal: ',' },
      }[placeholder?.[1]];

      if (delimiters) {
        const value = Number(price || 0);
        const [units, decimals] = value.toFixed(delimiters.decimals).split('.');
        const grouped = units.replace(/\B(?=(\d{3})+(?!\d))/g, delimiters.thousands);
        return moneyFormat.replace(
          placeholder[0],
          decimals ? grouped + delimiters.decimal + decimals : grouped,
        );
      }

      const language = document.documentElement.lang || 'en';
      const country = window.Shopify?.country;
      const locale = country && !language.includes('-') ? `${language}-${country}` : language;

      try {
        return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(price));
      } catch (_error) {
        return `${price} ${currency}`;
      }
    };

    const createResult = (product, index) => {
      const link = document.createElement('a');
      link.className = 'header-predictive-search__item';
      link.href = product.url;
      link.id = `HeaderPredictiveResult-${index}`;
      link.setAttribute('role', 'option');

      if (product.image) {
        const image = document.createElement('img');
        image.src = `${product.image}${product.image.includes('?') ? '&' : '?'}width=96`;
        image.alt = '';
        image.width = 48;
        image.height = 48;
        image.loading = 'lazy';
        link.append(image);
      } else {
        const placeholder = document.createElement('span');
        placeholder.className = 'header-predictive-search__image-placeholder';
        placeholder.setAttribute('aria-hidden', 'true');
        link.append(placeholder);
      }

      const title = document.createElement('strong');
      title.textContent = product.title;
      link.append(title);

      const meta = document.createElement('span');
      meta.className = 'header-predictive-search__meta';

      const price = document.createElement('span');
      price.textContent = formatPrice(product.price);
      meta.append(price);

      if (product.available === false) {
        const availability = document.createElement('small');
        availability.className = 'header-predictive-search__sold-out';
        availability.textContent = form.dataset.soldOut || 'Sold out';
        meta.append(availability);
      }

      link.append(meta);

      return link;
    };

    const render = (products, query) => {
      const availableProducts = products.filter((product) => product.available !== false).slice(0, 4);
      results.replaceChildren(...availableProducts.map(createResult));
      status.textContent = availableProducts.length ? '' : form.dataset.noResults;
      const normalizedQuery = query.endsWith('*') ? query : `${query}*`;
      allResults.href = `${form.action}?q=${encodeURIComponent(normalizedQuery)}&options%5Bprefix%5D=last&filter.v.availability=1`;
      // Always offer the full-search link for a non-empty query: it is the
      // recovery path when predictive search returns nothing.
      allResults.hidden = !query;
      open();
    };

    const search = async (query) => {
      requestController?.abort();
      requestController = new AbortController();
      input.setAttribute('aria-busy', 'true');

      const root = window.Shopify?.routes?.root || '/';
      const parameters = new URLSearchParams({
        q: query,
        'resources[type]': 'product',
        'resources[limit]': '10',
        'resources[options][unavailable_products]': 'last',
        'resources[options][fields]': 'title,product_type,variants.title,vendor,tag',
      });

      try {
        const response = await fetch(`${root}search/suggest.json?${parameters}`, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
          signal: requestController.signal,
        });
        if (!response.ok) throw new Error('Predictive search request failed.');
        const payload = await response.json();
        if (input.value.trim() !== query) return;
        render(payload.resources?.results?.products || [], query);
      } catch (error) {
        if (error.name !== 'AbortError') close();
      } finally {
        input.removeAttribute('aria-busy');
      }
    };

    input.addEventListener('input', () => {
      window.clearTimeout(requestTimer);
      const query = input.value.trim();

      if (query.length < 2) {
        requestController?.abort();
        results.replaceChildren();
        status.textContent = '';
        close();
        return;
      }

      requestTimer = window.setTimeout(() => search(query), 180);
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        close();
        return;
      }

      if (event.key !== 'ArrowDown' || panel.hidden) return;
      const firstResult = panel.querySelector('a:not([hidden])');
      if (!firstResult) return;
      event.preventDefault();
      firstResult.focus();
    });

    panel.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        input.focus();
        return;
      }

      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const options = Array.from(panel.querySelectorAll('a:not([hidden])'));
      const currentIndex = options.indexOf(document.activeElement);
      if (currentIndex < 0) return;
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      options[(currentIndex + direction + options.length) % options.length].focus();
    });

    document.addEventListener('pointerdown', (event) => {
      if (!form.contains(event.target)) close();
    });
  };

  const initializeCompactMobileHeader = (header) => {
    if (!header || header.dataset.compactInitialized === 'true') return;
    header.dataset.compactInitialized = 'true';

    const group = header.closest('.shopify-section-group-header-group');
    const toggle = header.querySelector('[data-mobile-search-toggle]');
    const input = header.querySelector('#HeaderSearchInput');
    const mobileQuery = window.matchMedia('(max-width: 47.99rem)');
    if (!group || !toggle || !input) return;

    const update = () => {
      const compact = mobileQuery.matches && window.scrollY > 72;
      group.classList.toggle('is-compact', compact);
      if (!compact) group.classList.remove('is-search-open');
      toggle.setAttribute('aria-expanded', String(group.classList.contains('is-search-open')));
    };

    toggle.addEventListener('click', () => {
      const opening = !group.classList.contains('is-search-open');
      group.classList.toggle('is-search-open', opening);
      toggle.setAttribute('aria-expanded', String(opening));
      if (opening) window.requestAnimationFrame(() => input.focus({ preventScroll: true }));
    });

    let scheduled = false;
    window.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        update();
      });
    }, { passive: true });
    mobileQuery.addEventListener?.('change', update);
    update();
  };

  const initialize = (root = document) => {
    root.querySelectorAll('[data-mobile-menu]').forEach(initializeMenu);
    root.querySelectorAll('.desktop-menu__dropdown').forEach(initializeDesktopDropdown);
    root.querySelectorAll('[data-predictive-search]').forEach(initializeSearch);
    root.querySelectorAll('[data-normalize-search-query]').forEach(normalizeSearchQuery);
    root.querySelectorAll('.site-header').forEach(initializeCompactMobileHeader);
    updateWishlistCount();
  };

  initialize();
  document.addEventListener('pointerdown', (event) => {
    document.querySelectorAll('.desktop-menu__dropdown[open]').forEach((dropdown) => {
      if (!dropdown.contains(event.target)) dropdown.open = false;
    });
  });
  document.addEventListener('shopify:section:load', (event) => initialize(event.target));
  document.addEventListener('loemies:wishlist:change', updateWishlistCount);
  window.addEventListener('storage', (event) => {
    if (event.key === WISHLIST_STORAGE_KEY) updateWishlistCount();
  });
})();
