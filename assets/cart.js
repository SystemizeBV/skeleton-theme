/*
 * Loemies cart: AJAX line updates via /cart/change.js plus the Section
 * Rendering API. Every mutation re-fetches this section's HTML and swaps the
 * <loemies-cart> innerHTML, so totals, upsells, and the free-shipping note stay
 * server-rendered. Event listeners are delegated on the custom element itself
 * (which survives swaps); init() rebinds per-render state after each swap.
 * Without JS the plain form POST (Update cart button) keeps working.
 */

const CART_QUANTITY_DEBOUNCE_MS = 400;
const CART_UPSELL_PRICE_CEILING_CENTS = 3500; // Fallback recommendations stay impulse-priced (≤ €35).

class LoemiesCart extends HTMLElement {
  connectedCallback() {
    this.sectionId = this.dataset.sectionId || '';
    this.upsellError = this.dataset.upsellError || '';
    this.updatedMessage = this.dataset.updatedMessage || '';
    this.errorMessage = this.dataset.errorMessage || '';
    this.updateTimers = new Map();
    this.queue = Promise.resolve();
    this.pendingFocus = null;

    this.ajaxEnabled = Boolean(this.sectionId && window.fetch && window.DOMParser);
    this.classList.toggle('js-enabled', this.ajaxEnabled);

    if (!this.delegatesBound) {
      this.delegatesBound = true;
      this.addEventListener('click', (event) => this.handleClick(event));
      this.addEventListener('change', (event) => this.handleChange(event));
      this.addEventListener('keydown', (event) => this.handleKeydown(event));
    }

    this.init();
  }

  disconnectedCallback() {
    this.stickyObserver?.disconnect();
    this.stickyObserver = null;
    this.updateTimers.forEach((timer) => window.clearTimeout(timer));
    this.updateTimers.clear();
  }

  // Re-runs after every section swap: only per-render state lives here.
  init() {
    this.status = this.querySelector('[data-cart-status]');
    this.querySelectorAll('[data-cart-quantity-input]').forEach((input) => this.syncButtons(input));
    this.initStickyCheckout();
    this.fillAutomaticUpsells();
  }

  handleClick(event) {
    if (this.getAttribute('aria-busy') === 'true') {
      // Keyboard activation can reach controls that pointer-events already block.
      if (event.target.closest('[data-cart-quantity-button], [data-cart-remove], [data-cart-upsell-add]')) {
        event.preventDefault();
      }
      return;
    }

    const stepper = event.target.closest('[data-cart-quantity-button]');
    if (stepper && this.contains(stepper)) {
      const input = stepper.closest('[data-cart-quantity]')?.querySelector('[data-cart-quantity-input]');
      if (input) this.changeQuantity(input, Number(stepper.dataset.direction));
      return;
    }

    const removeLink = event.target.closest('[data-cart-remove]');
    if (removeLink && this.contains(removeLink)) {
      if (!this.ajaxEnabled) return; // Native url_to_remove navigation.
      const key = removeLink.closest('[data-cart-line]')?.dataset.key;
      if (!key) return;
      event.preventDefault();
      this.scheduleLineUpdate(key, 0, 0);
      return;
    }

    const upsellButton = event.target.closest('[data-cart-upsell-add]');
    if (upsellButton && this.contains(upsellButton)) this.addUpsell(upsellButton);
  }

  handleChange(event) {
    const input = event.target.closest('[data-cart-quantity-input]');
    if (!input || !this.contains(input)) return;
    this.normalizeQuantity(input);
    this.syncButtons(input);
    this.scheduleFromInput(input);
  }

  handleKeydown(event) {
    if (event.key !== 'Enter') return;
    const input = event.target.closest('[data-cart-quantity-input]');
    if (!input || !this.contains(input) || !this.ajaxEnabled) return;
    // Implicit submission would trigger the (hidden) Update button; update in place instead.
    event.preventDefault();
    this.normalizeQuantity(input);
    this.syncButtons(input);
    this.scheduleFromInput(input, 0);
  }

  limits(input) {
    const minimum = Number(input.min) || 0;
    const maximum = input.max === '' ? Number.POSITIVE_INFINITY : Number(input.max);
    const increment = Number(input.step) || 1;
    return { minimum, maximum, increment };
  }

  normalizeQuantity(input) {
    const { minimum, maximum, increment } = this.limits(input);
    const rawValue = Number(input.value);
    const safeValue = Number.isFinite(rawValue) ? rawValue : minimum;
    const steppedValue = minimum + Math.round((safeValue - minimum) / increment) * increment;
    input.value = Math.min(maximum, Math.max(minimum, steppedValue));
  }

  changeQuantity(input, direction) {
    const { minimum, maximum, increment } = this.limits(input);
    const currentValue = Number(input.value) || minimum;
    input.value = Math.min(maximum, Math.max(minimum, currentValue + direction * increment));
    this.syncButtons(input);
    this.scheduleFromInput(input);
  }

  syncButtons(input) {
    const control = input.closest('[data-cart-quantity]');
    if (!control) return;

    const { minimum, maximum } = this.limits(input);
    const currentValue = Number(input.value) || minimum;
    const decreaseButton = control.querySelector('[data-direction="-1"]');
    const increaseButton = control.querySelector('[data-direction="1"]');

    if (decreaseButton) decreaseButton.disabled = currentValue <= minimum;
    if (increaseButton) increaseButton.disabled = currentValue >= maximum;
  }

  scheduleFromInput(input, delay = CART_QUANTITY_DEBOUNCE_MS) {
    const key = input.closest('[data-cart-line]')?.dataset.key;
    if (!key || !this.ajaxEnabled) {
      this.markDirty(input);
      return;
    }

    if (Number(input.value) === Number(input.defaultValue)) {
      // Back at the server-rendered quantity; nothing to send.
      window.clearTimeout(this.updateTimers.get(key));
      this.updateTimers.delete(key);
      return;
    }

    this.scheduleLineUpdate(key, Number(input.value), delay);
  }

  // Debounced per line; keyed by the stable item key because line numbers
  // reindex whenever an earlier line is removed.
  scheduleLineUpdate(key, quantity, delay) {
    window.clearTimeout(this.updateTimers.get(key));
    this.updateTimers.set(
      key,
      window.setTimeout(() => {
        this.updateTimers.delete(key);
        this.queue = this.queue.then(() => this.changeLine(key, quantity)).catch(() => {});
      }, delay),
    );
  }

  lineElementFor(key) {
    let match = null;
    this.querySelectorAll('[data-cart-line]').forEach((candidate) => {
      if (!match && candidate.dataset.key === key) match = candidate;
    });
    return match;
  }

  // No-JS-era fallback, kept for the unlikely case AJAX prerequisites are missing.
  markDirty(input) {
    this.classList.add('is-dirty');
    input.closest('[data-cart-line]')?.classList.add('is-dirty');
    if (this.status) this.status.textContent = this.dataset.quantityMessage || '';
  }

  beginBusy() {
    this.pendingFocus = this.describeFocus(document.activeElement);
    this.setAttribute('aria-busy', 'true');
    this.querySelectorAll('[data-cart-quantity-button], [data-cart-upsell-add]').forEach((button) => {
      button.disabled = true;
    });
  }

  endBusy() {
    this.removeAttribute('aria-busy');
  }

  describeFocus(element) {
    if (!element || element === document.body || !this.contains(element)) return null;

    const lineElement = element.closest('[data-cart-line]');
    const descriptor = {
      key: lineElement?.dataset.key || '',
      line: lineElement?.dataset.line || '',
      control: 'generic',
    };

    if (element.closest('[data-cart-quantity-input]')) descriptor.control = 'input';
    else if (element.closest('[data-cart-remove]')) descriptor.control = 'remove';
    else if (element.closest('[data-cart-quantity-button]')) {
      descriptor.control = element.closest('[data-cart-quantity-button]').dataset.direction;
    }

    return descriptor;
  }

  restoreFocus(descriptor) {
    if (!descriptor) return;

    let lineElement = null;
    this.querySelectorAll('[data-cart-line]').forEach((candidate) => {
      if (!lineElement && descriptor.key && candidate.dataset.key === descriptor.key) lineElement = candidate;
    });

    let target = null;
    if (lineElement) {
      if (descriptor.control === 'input') target = lineElement.querySelector('[data-cart-quantity-input]');
      else if (descriptor.control === 'remove') target = lineElement.querySelector('[data-cart-remove]');
      else if (descriptor.control === '-1' || descriptor.control === '1') {
        target = lineElement.querySelector(`[data-cart-quantity-button][data-direction="${descriptor.control}"]`);
      }
      if (!target || target.disabled) target = lineElement.querySelector('[data-cart-quantity-input]') || target;
    }

    if (!target) {
      target = this.querySelector('[data-cart-quantity-input]')
        || this.querySelector('[data-cart-checkout]')
        || this.querySelector('.loemies-cart__empty-button');
    }

    target?.focus({ preventScroll: true });
  }

  async changeLine(key, quantity) {
    // Resolve the 1-based line number against the current DOM at send time;
    // the queued update may run after earlier swaps reindexed the lines.
    const line = Number(this.lineElementFor(key)?.dataset.line);
    if (!line) return; // Line already gone (e.g. removed server-side).

    const root = window.Shopify?.routes?.root || '/';
    this.beginBusy();

    let response;
    try {
      response = await fetch(`${root}cart/change.js`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ line, quantity }),
      });
    } catch (_error) {
      this.fallbackChange(key, quantity);
      return;
    }

    let payload = null;
    try {
      payload = await response.json();
    } catch (_error) {
      // Non-JSON body; the section re-render below still resyncs the page.
    }

    const errorText = response.ok
      ? ''
      : payload?.description || payload?.message || this.errorMessage;
    const cart = response.ok && payload && typeof payload.item_count === 'number' ? payload : null;

    try {
      // Re-render even after a rejected change so quantities, caps, and
      // item.error_message reflect what the server actually kept.
      await this.renderSection(cart);
    } catch (_error) {
      this.fallbackChange(key, quantity);
      return;
    }

    this.endBusy();
    if (this.status) this.status.textContent = errorText || this.updatedMessage;
  }

  // Network-level failure: hand the mutation to the plain cart form.
  fallbackChange(key, quantity) {
    const lineElement = this.lineElementFor(key);

    if (quantity === 0) {
      const removeLink = lineElement?.querySelector('[data-cart-remove]');
      if (removeLink?.href) {
        window.location.assign(removeLink.href);
        return;
      }
      const updateInput = lineElement?.querySelector('input[name^="updates["]');
      if (updateInput) updateInput.value = '0';
    }

    this.submitForm();
  }

  submitForm() {
    const form = this.querySelector('.loemies-cart__form');
    if (form) HTMLFormElement.prototype.submit.call(form);
    else window.location.reload();
  }

  async renderSection(cart) {
    const root = window.Shopify?.routes?.root || '/';
    const response = await fetch(`${root}cart?section_id=${encodeURIComponent(this.sectionId)}`, {
      credentials: 'same-origin',
      headers: { Accept: 'text/html' },
    });
    if (!response.ok) throw new Error(`Section render failed (${response.status})`);

    const markup = await response.text();
    const parsed = new DOMParser().parseFromString(markup, 'text/html');
    const next = parsed.querySelector('loemies-cart');
    if (!next) throw new Error('Section markup is missing the cart root');

    const focusDescriptor = this.pendingFocus;
    this.pendingFocus = null;

    // Unflushed debounced edits refer to DOM that is about to be replaced;
    // the swap resets those inputs to server state anyway.
    this.updateTimers.forEach((timer) => window.clearTimeout(timer));
    this.updateTimers.clear();

    this.innerHTML = next.innerHTML;
    this.init();
    this.restoreFocus(focusDescriptor);

    if (cart) this.updateHeaderCount(cart);
    else this.refreshHeaderCount();
  }

  updateHeaderCount(cart) {
    const labelTemplate = this.dataset.cartLabelTemplate
      || document.querySelector('[data-cart-notification]')?.dataset.cartLabelTemplate
      || '';

    document.querySelectorAll('.header-cart__count').forEach((count) => {
      count.textContent = String(cart.item_count);
    });
    if (!labelTemplate) return;
    document.querySelectorAll('.header-cart').forEach((link) => {
      link.setAttribute('aria-label', labelTemplate.replace('__COUNT__', String(cart.item_count)));
    });
  }

  refreshHeaderCount() {
    const root = window.Shopify?.routes?.root || '/';
    fetch(`${root}cart.js`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((cart) => {
        if (cart) this.updateHeaderCount(cart);
      })
      .catch(() => {
        // The badge resyncs on the next full render; not worth surfacing.
      });
  }

  initStickyCheckout() {
    this.stickyObserver?.disconnect();
    this.stickyObserver = null;

    const bar = this.querySelector('[data-cart-sticky-checkout]');
    const checkoutButton = this.querySelector('[data-cart-checkout]');
    if (!bar || !checkoutButton || typeof IntersectionObserver !== 'function') return;

    this.stickyObserver = new IntersectionObserver(([entry]) => {
      const show = !entry.isIntersecting;
      bar.classList.toggle('is-visible', show);
      if (show) bar.removeAttribute('inert');
      else bar.setAttribute('inert', '');
    });
    this.stickyObserver.observe(checkoutButton);
  }

  async addUpsell(button) {
    const variantId = Number(button.dataset.variantId);
    if (!variantId || button.disabled) return;

    const originalLabel = button.textContent;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = button.dataset.loadingLabel || originalLabel;

    const root = window.Shopify?.routes?.root || '/';

    try {
      const response = await fetch(`${root}cart/add.js`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.description || payload.message || this.upsellError);
      }
    } catch (error) {
      if (this.status) this.status.textContent = error.message || this.upsellError;
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.textContent = originalLabel;
      button.focus({ preventScroll: true });
      return;
    }

    if (!this.ajaxEnabled) {
      window.location.reload();
      return;
    }

    this.beginBusy();
    try {
      await this.renderSection(null);
      this.endBusy();
      if (this.status) this.status.textContent = this.updatedMessage;
    } catch (_error) {
      window.location.reload();
    }
  }

  async fetchRelatedProducts(productId) {
    const root = window.Shopify?.routes?.root || '/';
    const query = new URLSearchParams({
      product_id: productId,
      limit: '8',
      intent: 'related',
    });
    const response = await fetch(`${root}recommendations/products.json?${query}`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload.products) ? payload.products : [];
  }

  formatMoney(cents, currency) {
    // Prefer the shared shop-format-aware helper so prices match `| money`.
    if (typeof window.LoemiesFormatMoney === 'function') {
      return window.LoemiesFormatMoney(cents, currency);
    }

    // product-card.js is absent on the cart template, so parse the shop money
    // format from this section's own data attribute (same table as there).
    const format = this.dataset.moneyFormat || '';
    const placeholder = format.match(/\{\{\s*(\w+)\s*\}\}/);
    const delimiters = {
      amount: { decimals: 2, thousands: ',', decimal: '.' },
      amount_no_decimals: { decimals: 0, thousands: ',', decimal: '.' },
      amount_with_comma_separator: { decimals: 2, thousands: '.', decimal: ',' },
      amount_no_decimals_with_comma_separator: { decimals: 0, thousands: '.', decimal: ',' },
      amount_with_apostrophe_separator: { decimals: 2, thousands: "'", decimal: '.' },
      amount_with_space_separator: { decimals: 2, thousands: ' ', decimal: ',' },
      amount_no_decimals_with_space_separator: { decimals: 0, thousands: ' ', decimal: ',' },
      amount_with_period_and_space_separator: { decimals: 2, thousands: ' ', decimal: '.' },
    }[placeholder?.[1]];

    if (delimiters) {
      const value = Number(cents || 0) / 100;
      const [units, decimals] = value.toFixed(delimiters.decimals).split('.');
      const grouped = units.replace(/\B(?=(\d{3})+(?!\d))/g, delimiters.thousands);
      return format.replace(placeholder[0], decimals ? grouped + delimiters.decimal + decimals : grouped);
    }

    try {
      return new Intl.NumberFormat(document.documentElement.lang || 'en', {
        style: 'currency',
        currency,
      }).format(Number(cents || 0) / 100);
    } catch (_error) {
      return `${(Number(cents || 0) / 100).toFixed(2)} ${currency}`;
    }
  }

  // "Kids' Cocoon Swing: Cow Print" → "kids' cocoon swing"; variants of one
  // product family share the part before the first colon.
  familyKey(title) {
    return String(title || '').split(':')[0].trim().toLowerCase();
  }

  renderAutomaticUpsell(container, product, sourceProductId) {
    const template = container.querySelector('[data-cart-upsell-template]');
    const cards = container.querySelector('[data-cart-upsell-cards]');
    if (!template || !cards) return false;

    const card = template.content.firstElementChild.cloneNode(true);
    const productUrl = product.url || `${window.Shopify?.routes?.root || '/'}products/${product.handle}`;
    const availableVariant = product.variants?.find((variant) => variant.available);
    const hasOnlyDefaultVariant =
      product.variants?.length === 1 &&
      product.options?.every((option) => option.values?.length === 1 && option.values[0] === 'Default Title');

    card.dataset.upsellHandle = product.handle;
    card.dataset.upsellSourceId = sourceProductId;
    card.querySelectorAll('[data-upsell-link]').forEach((link) => {
      link.href = productUrl;
      link.setAttribute('aria-label', product.title);
    });

    const title = card.querySelector('[data-upsell-title]');
    title.href = productUrl;
    title.textContent = product.title;

    const detail = card.querySelector('[data-upsell-detail]');
    if (product.type) {
      detail.textContent = product.type;
      detail.hidden = false;
    }

    const image = card.querySelector('[data-upsell-image]');
    if (product.featured_image) {
      const imageUrl = product.featured_image.startsWith('//') ? `https:${product.featured_image}` : product.featured_image;
      image.src = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}width=320`;
    } else {
      const fallback = document.createElement('span');
      fallback.className = 'loemies-upsell-card__image-fallback';
      fallback.setAttribute('aria-hidden', 'true');
      image.replaceWith(fallback);
    }

    const currency = container.dataset.currency || 'EUR';
    const formattedPrice = this.formatMoney(product.price_min ?? product.price, currency);
    const price = product.price_varies
      ? (container.dataset.fromPriceTemplate || '__PRICE__').replace('__PRICE__', formattedPrice)
      : formattedPrice;
    card.querySelector('[data-upsell-price]').textContent = price;

    const addButton = card.querySelector('[data-cart-upsell-add]');
    const optionsLink = card.querySelector('[data-upsell-options]');
    if (container.dataset.quickAdd === 'true' && hasOnlyDefaultVariant && availableVariant) {
      addButton.dataset.variantId = availableVariant.id;
    } else {
      addButton.hidden = true;
      optionsLink.href = productUrl;
      optionsLink.hidden = false;
    }

    cards.append(card);
    return true;
  }

  async fillAutomaticUpsells() {
    const container = this.querySelector('[data-cart-upsells]');
    if (!container || container.dataset.automaticFallback !== 'true') return;

    const cards = container.querySelector('[data-cart-upsell-cards]');
    const maximum = Number(container.dataset.maximum) || 2;
    if (!cards || cards.children.length >= maximum) return;

    const sourceProductIds = [...new Set(container.dataset.sourceProductIds.split(',').filter(Boolean))]
      .slice(0, maximum * 3);
    if (!sourceProductIds.length) return;

    const excludedHandles = new Set(container.dataset.cartProductHandles.split('|').filter(Boolean));
    const excludedFamilies = new Set(
      (container.dataset.cartFamilyKeys || '').split('|').filter(Boolean),
    );
    const contributionCounts = new Map(sourceProductIds.map((id) => [id, 0]));
    cards.querySelectorAll('[data-upsell-handle]').forEach((card) => {
      excludedHandles.add(card.dataset.upsellHandle);
      const cardFamily = this.familyKey(card.querySelector('h3 a')?.textContent);
      if (cardFamily) excludedFamilies.add(cardFamily);
      const sourceId = card.dataset.upsellSourceId;
      if (sourceId && contributionCounts.has(sourceId)) {
        contributionCounts.set(sourceId, contributionCounts.get(sourceId) + 1);
      }
    });

    try {
      const recommendations = await Promise.all(
        sourceProductIds.map(async (productId) => [productId, await this.fetchRelatedProducts(productId)]),
      );
      const recommendationsBySource = new Map(recommendations);
      const sourceOrder = new Map(sourceProductIds.map((id, index) => [id, index]));

      while (cards.children.length < maximum) {
        let addedThisRound = false;
        const balancedSources = [...sourceProductIds].sort(
          (first, second) =>
            contributionCounts.get(first) - contributionCounts.get(second) ||
            sourceOrder.get(first) - sourceOrder.get(second),
        );

        for (const sourceProductId of balancedSources) {
          if (cards.children.length >= maximum) break;
          const candidates = recommendationsBySource.get(sourceProductId) || [];
          let candidate;

          while (candidates.length && !candidate) {
            const product = candidates.shift();
            const productPrice = Number(product.price_min ?? product.price ?? 0);
            const productFamily = this.familyKey(product.title);
            if (
              product.available &&
              product.handle &&
              !excludedHandles.has(product.handle) &&
              !excludedFamilies.has(productFamily) &&
              productPrice <= CART_UPSELL_PRICE_CEILING_CENTS
            ) {
              candidate = product;
            }
          }

          if (!candidate) continue;
          if (this.renderAutomaticUpsell(container, candidate, sourceProductId)) {
            excludedHandles.add(candidate.handle);
            const candidateFamily = this.familyKey(candidate.title);
            if (candidateFamily) excludedFamilies.add(candidateFamily);
            contributionCounts.set(sourceProductId, contributionCounts.get(sourceProductId) + 1);
            addedThisRound = true;
          }
        }

        if (!addedThisRound) break;
      }

      if (cards.children.length) container.hidden = false;
    } catch (_error) {
      // Recommendations are an enhancement; the cart remains fully usable if the request fails.
    }
  }
}

if (!customElements.get('loemies-cart')) {
  customElements.define('loemies-cart', LoemiesCart);
}
