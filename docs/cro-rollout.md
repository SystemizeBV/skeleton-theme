# CRO rollout runbook

Actions from the 2026-08-01 UX audit that must happen in Shopify admin, not in
theme code. Updated 2026-08-02 after the admin session: most items are done;
the remaining open items are listed first.

## Deferred launch dependencies

- [ ] **Activate Shopify Payments** (intentionally deferred while the store is
      in development; Settings → Payments → "Complete setup"):
      requires business verification and bank details only the owner can
      provide. Enable **Bancontact** (critical for Belgium), Shop Pay, and
      major cards. PayPal also shows "Setup incomplete" — finish its
      onboarding to receive payouts. The footer renders icons from
      `shop.enabled_payment_types`, so icons appear automatically once
      providers are active. See `footer-trust-setup.md`.
- [ ] **Replace the sample reviews with real ones before public launch.** The homepage
      "Testimonials" section currently contains 25 fabricated sample reviews
      (EN/NL/FR) added for design preview only. Publishing invented consumer
      reviews presented as genuine violates the EU Omnibus Directive and
      Belgian consumer law. Replace every block with a real, attributable
      quote — or disable the section — before the theme goes live.
      Review pipeline: `product-reviews.md` + post-purchase email automation.
- [ ] **Legal review**: Refund, Shipping, Terms, and Contact information were
      published from Shopify templates/drafts with store data filled in.
      Have them reviewed before launch; verify the shipping policy's
      processing (1–2 business days) and typical EU delivery estimate (3–8
      business days)
      match reality.
## Done 2026-08-02

- [x] Shopify Translate & Adapt installed and its full free automatic pass
      completed for both published catalogue languages. All 50 products now
      return localized, non-empty titles and descriptions on `/nl` and `/fr`;
      representative Dutch and French PDPs were verified with the correct
      document language, canonical URL, product title, purchasing UI, shipping
      promise, and return copy.
- [x] Age taxonomy completed across all 50 products using the maker's stated
      minimum age. Current coverage is 18 products at **Age 1+**, 3 at **Age
      2+**, 28 at **Age 3+**, and 1 at **Age 12 months+**. The four
      Bees & Blooms soft-furniture/play products without a more precise maker
      label use the conservative existing **Age 1+** store band. The exact
      audited changes are preserved in
      `docs/data/product-age-tags-2026-08-02.csv`.
- [x] Supplier inventory safeguards verified across Bees & Blooms, Woopie and
      Wooden Story products: Shopify inventory tracking is active at the
      Hertwill app location and **Sell when out of stock** is off. A live
      999-unit cart request returned Shopify `422`, added only the real 10-unit
      availability, and the audit cart was then cleared. Sold-out products are
      therefore honest supplier availability, not an overselling setting.
- [x] Product-media audit completed across all 50 products. Every product has
      genuine gallery media; the only featured source below 800px was Wooden
      Bowling Set: Vintage (452 × 584). Cards and its PDP now lead with the
      existing sharper 800 × 800 gallery asset, while the original remains in
      the gallery. Responsive PDP sources are capped to each original's true
      width, preventing CDN upscaling, and repeated supplier alt text is made
      unique by gallery position.
- [x] All 20 customer-facing rates in the two Hertwill shipping profiles were
      renamed to **EU Shipping with Tracking**. The shipping policy now uses
      the same name, removes the unsupported free-over-€49 claim and aligns
      processing to 1–2 business days. The theme consistently says tracked EU
      delivery and does not render free-shipping progress unless the global
      promise is explicitly enabled.
- [x] About and FAQ Online Store 2.0 templates added with localized EN/NL/FR
      content. The live `/pages/about-us` and `/pages/faq` Shopify pages were
      created, assigned to those templates, and are now linked in the footer.
- [x] Product and cart quantity controls now cap consumer orders at 10 units
      per product by default (configurable under Store promises), preventing
      accidental 999-unit carts while supplier inventory policy is reviewed.

- [x] Policies published (Settings → Policies): **Refund** (Shopify 30-day
      template, return address + support@loemies.com), **Shipping** (tracked
      EU delivery, checkout-calculated rates, delivery estimates, 30-day returns), **Terms of service**
      (Systemize BV trading data, VAT BE 1004.376.305), **Contact
      information** (EU requirement). Privacy was already automated.
      Footer legal row + Customer service column (Contact/Shipping/Returns)
      picked them up automatically.
- [x] Return and cancellation **rules** updated from 14-day to **30-day**
      returns, matching the storefront claim everywhere.
- [x] Navigation: the dead "Shop by play" item (pointed at a removed homepage
      anchor) and the duplicate "Shop by age" dropdown entry were removed —
      in theme code (`sections/header.liquid`), since the header nav is
      hardcoded there, not menu-driven.
- [x] Christmas-scene image demoted on "Wooden Counting and Color Puzzle":
      a neutral packshot is now the featured image fronting the "Learning
      through play" rail.
- [x] Cookie banner verified correctly scoped: visible in Belgium and
      Netherlands only (Settings → Customer privacy) — no change needed.

## Reference (unchanged guidance)

- Review pipeline: theme reads `custom.reviews` product metafields
  (see `product-reviews.md`); approved entries surface as stars on product
  cards automatically. Seed via post-purchase review-request emails
  (~2 weeks after delivery).
- Image-style consistency: keep packshots with packshots and lifestyle with
  lifestyle within each homepage rail.
- When publishing this codebase over the live theme, reconcile
  customizer-edited copy (hero eyebrow/heading, brand-band heading) against
  the draft "Loemies CRO 2026-08-02" (#203394613585), then delete stale
  draft themes.

## PDP / Cart / Collection round — done 2026-08-02 (theme is LIVE)

Implemented in code and verified on the storefront:
- Cart: locale-safe dialog checkout link (was 404 on /nl and /fr); full AJAX
  cart (live totals, no "Update cart"); consistent tracked-delivery messaging
  in cart and the add-to-cart dialog (EN/NL/FR);
  mobile sticky checkout bar; summary above upsells on mobile; 44px steppers,
  16px checkout label; upsell price cap €35 + colorway-family dedup + shop
  money format everywhere.
- PDP: mobile swipe gallery (thumb rail hidden, ~150px fold gain); lightbox
  prev/next + arrow keys; facts chips under title (age/material/type from
  tags); "Reviews · 0" suppressed at zero reviews; review form trimmed;
  EAN hidden; assurance icons fixed; delivery promise restored ("Dispatched
  within 1–2 business days"); one-line mobile buy row; "You may also like"
  recommendations section (family-deduped).
- Collection: 24 products per page for mobile performance; homepage age tiles
  repointed to the four real age tags;
  /age-2 and /age-12-months tag pages with titles/breadcrumbs/SEO meta;
  browse chips cover all 4 real age tags; desktop filters auto-apply +
  outside-click close; scroll-to-results after filtering; hover second image
  on cards; sold-out greyscale; native lazy images; typography floor raised.
- Admin: collection default sort set to Best selling (needs sales data to
  take effect); payment icon rows hidden on cart + PDP until Bancontact.

Still open (owner / merchandising, not defects in the implemented launch path):
- [ ] Search & Discovery (app UI, unautomatable): enable out-of-stock
      demotion; configure complementary products for top-10 SKUs; long-term
      add an Age metafield facet.
- [ ] Commission ≥2048px studio/lifestyle photography and short product video
      for proven top sellers when budget permits. This would improve zoom and
      persuasion, but the live theme now presents the real current masters
      sharply and does not upscale them.
- [ ] Merge colorway duplicates (Cocoon Swings, Bean Bags) into variant
      products.
- [ ] Everything from the deferred launch dependencies above (payments,
      real reviews, legal review).
