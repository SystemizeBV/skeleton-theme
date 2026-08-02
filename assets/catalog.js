(() => {
  const filterSelector = '[data-catalog-filters]';
  const formSelector = '.loemies-catalog__filter-form';
  const desktopQuery = window.matchMedia('(min-width: 48rem)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Marks every catalog form as JS-enhanced. The desktop stylesheet uses the
  // flag to hide the toolbar Apply button, because desktop facets commit
  // themselves and price keeps its own Apply inside the dropdown. Without JS
  // the flag never appears and the Apply button stays visible.
  const markEnhancedForms = () => {
    document.querySelectorAll(formSelector).forEach((form) => {
      form.dataset.catalogEnhanced = 'true';
    });
  };

  const syncBrowseOverflow = () => {
    document.querySelectorAll('.loemies-catalog__browse').forEach((browse) => {
      const links = browse.querySelector('.loemies-catalog__browse-links');
      if (!links) return;

      const updateState = () => {
        const isOverflowing = links.scrollWidth > links.clientWidth + 4;
        const hasReachedEnd = links.scrollLeft + links.clientWidth >= links.scrollWidth - 8;
        browse.classList.toggle('is-overflowing', isOverflowing);
        browse.classList.toggle('has-reached-end', isOverflowing && hasReachedEnd);
      };

      if (!links.dataset.catalogScrollReady) {
        links.addEventListener('scroll', updateState, { passive: true });
        links.dataset.catalogScrollReady = 'true';
      }

      updateState();
    });
  };

  const syncFilterLayout = () => {
    document.querySelectorAll(filterSelector).forEach((filters) => {
      const hasActiveFilters = filters.dataset.activeFilters === 'true';

      if (desktopQuery.matches) {
        filters.open = true;
        filters.dataset.wasDesktop = 'true';
        return;
      }

      if (!filters.dataset.catalogReady || filters.dataset.wasDesktop === 'true') {
        filters.open = hasActiveFilters;
      }

      filters.dataset.catalogReady = 'true';
      delete filters.dataset.wasDesktop;
    });
  };

  // After a filtered or sorted load the shopper's answer is the grid, not the
  // page header, so the grid is scrolled into view once. A restored scroll
  // position (back/forward navigation) is left alone.
  const scrollResultsIntoView = () => {
    const params = new URLSearchParams(window.location.search);
    let hasResultParam = false;

    params.forEach((value, key) => {
      if (key === 'sort_by' || key.indexOf('filter.') === 0) hasResultParam = true;
    });

    if (!hasResultParam) return;
    if (window.scrollY > 4) return;

    const grid = document.querySelector('[data-catalog-grid]');
    if (!grid) return;

    grid.scrollIntoView({
      behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  markEnhancedForms();
  syncFilterLayout();
  syncBrowseOverflow();
  scrollResultsIntoView();

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', syncFilterLayout);
  } else {
    desktopQuery.addListener(syncFilterLayout);
  }

  document.addEventListener('shopify:section:load', markEnhancedForms);
  document.addEventListener('shopify:section:load', syncFilterLayout);
  document.addEventListener('shopify:section:load', syncBrowseOverflow);
  window.addEventListener('resize', syncBrowseOverflow, { passive: true });

  document.addEventListener('toggle', (event) => {
    const openedGroup = event.target.closest('.loemies-catalog__filter-group[open]');
    if (!openedGroup || !desktopQuery.matches) return;

    openedGroup
      .closest('.loemies-catalog__filter-controls')
      ?.querySelectorAll('.loemies-catalog__filter-group[open]')
      .forEach((group) => {
        if (group !== openedGroup) group.open = false;
      });
  }, true);

  // Desktop dropdowns close when the shopper clicks anywhere outside them, the
  // behaviour every faceted storefront trains people to expect. Mobile keeps
  // the accordion open so several groups can be reviewed before applying.
  const closeOpenGroups = (target) => {
    if (!desktopQuery.matches) return;

    document.querySelectorAll('.loemies-catalog__filter-group[open]').forEach((group) => {
      if (!target || !group.contains(target)) group.open = false;
    });
  };

  document.addEventListener('click', (event) => closeOpenGroups(event.target));

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    const openGroup = event.target.closest?.('.loemies-catalog__filter-group[open]');
    closeOpenGroups(null);
    openGroup?.querySelector('.loemies-catalog__filter-summary')?.focus();
  });

  document.addEventListener('change', (event) => {
    const sort = event.target.closest('.loemies-catalog__sort-select');
    if (sort) {
      sort.form?.requestSubmit();
      return;
    }

    // Desktop facets commit on change instead of waiting for Apply. Price is
    // excluded: number inputs fire change on every blur, and a half-typed
    // range should never reload the page.
    if (!desktopQuery.matches) return;

    const facet = event.target.closest('.loemies-catalog__filter-option input[type="checkbox"]');
    if (!facet) return;

    facet.form?.requestSubmit();
  });

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('.loemies-catalog__filter-form');
    if (!form) return;

    form.querySelectorAll('input[type="number"]').forEach((input) => {
      if (input.value.trim() === '') input.disabled = true;
    });

    // The collection's own default order is what an unparameterised URL
    // already renders, so it never needs to travel in the query string.
    // Dropping the name keeps the select untouched for the shopper.
    const sort = form.querySelector('.loemies-catalog__sort-select');
    if (sort && sort.dataset.defaultSort && sort.value === sort.dataset.defaultSort) {
      sort.removeAttribute('name');
    }
  });
})();
