(() => {
  const slugify = (value) =>
    value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const initializeTableOfContents = (content) => {
    if (content.dataset.tocReady === 'true') return;

    const articleBody = content.closest('.loemies-article__body');
    const toc = articleBody?.querySelector('[data-article-toc]');
    const list = toc?.querySelector('[data-article-toc-list]');
    const disclosure = toc?.querySelector('[data-article-toc-disclosure]');
    if (!toc || !list) return;

    const minimumHeadings = Number.parseInt(content.dataset.tocMinHeadings || '3', 10);
    const headingSelector = content.dataset.tocIncludeH3 === 'true' ? 'h2, h3' : 'h2';
    const headings = Array.from(content.querySelectorAll(headingSelector)).filter(
      (heading) => heading.textContent.trim() !== '' && !heading.closest('[data-toc-ignore]'),
    );

    if (headings.length < minimumHeadings) return;

    const headingSet = new Set(headings);
    const usedIds = new Set(
      Array.from(document.querySelectorAll('[id]'))
        .filter((element) => !headingSet.has(element))
        .map((element) => element.id),
    );

    headings.forEach((heading, index) => {
      const label = heading.textContent.trim();
      const baseId = slugify(heading.id || label) || `section-${index + 1}`;
      let headingId = baseId;
      let duplicateIndex = 2;

      while (usedIds.has(headingId)) {
        headingId = `${baseId}-${duplicateIndex}`;
        duplicateIndex += 1;
      }

      heading.id = headingId;
      heading.tabIndex = -1;
      usedIds.add(headingId);

      const item = document.createElement('li');
      item.className = `loemies-article__toc-item loemies-article__toc-item--${heading.tagName.toLowerCase()}`;

      const link = document.createElement('a');
      link.href = `#${headingId}`;
      link.textContent = label;
      link.addEventListener('click', () => {
        window.setTimeout(() => heading.focus({ preventScroll: true }), 0);
      });

      item.append(link);
      list.append(item);
    });

    content.dataset.tocReady = 'true';
    toc.hidden = false;

    if (disclosure && window.matchMedia('(max-width: 47.99rem)').matches) {
      disclosure.open = false;
    }
  };

  const initializeAllTablesOfContents = (scope = document) => {
    scope.querySelectorAll('[data-article-content]').forEach(initializeTableOfContents);
  };

  initializeAllTablesOfContents();
  document.addEventListener('shopify:section:load', (event) => initializeAllTablesOfContents(event.target));
})();
