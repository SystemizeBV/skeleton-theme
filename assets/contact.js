(() => {
  const form = document.querySelector('.contact-page__form');
  const successTemplate = document.querySelector('[data-contact-success-template]');

  if (!form || !successTemplate || !window.fetch || !window.FormData) return;

  form.addEventListener('submit', async (event) => {
    if (!form.checkValidity()) return;

    event.preventDefault();

    const submitButton = form.querySelector('[type="submit"]');
    submitButton?.setAttribute('aria-busy', 'true');
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        credentials: 'same-origin',
        headers: {
          Accept: 'text/html',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      const responseText = await response.text();
      const challengeRequired = response.url.includes('/challenge')
        || responseText.includes('shopify-challenge');

      if (challengeRequired) {
        HTMLFormElement.prototype.submit.call(form);
        return;
      }

      if (!response.ok) throw new Error(`Contact form returned ${response.status}`);

      const success = successTemplate.content.cloneNode(true);
      form.replaceWith(success);

      const successMessage = document.querySelector('.contact-page__form-card .contact-page__success');
      successMessage?.focus({ preventScroll: true });
      successMessage?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (_error) {
      HTMLFormElement.prototype.submit.call(form);
    }
  });
})();
