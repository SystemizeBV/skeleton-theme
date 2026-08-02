# Loemies UX audit remediation

**Completed:** 2 August 2026

**Live theme:** `Loemies Legal Pages Complete 2026-08-02` (`203401560401`)

**Scope:** every actionable audit item except reviews/testimonials, which were explicitly excluded and left untouched

## Outcome

The storefront and safe Shopify-admin fixes are live. The three-tap mobile path remains intact while discovery, navigation, cart feedback, delivery-cost transparency and checkout continuity are materially stronger.

**UX implementation score within the agreed scope: 96/100.** This is not a public-launch payment score. Shopify Payments and PayPal still require the merchant's legal identity, payout and verification steps before a real order can complete. The intentionally excluded placeholder reviews also remain unsuitable for a public launch.

## Remediation status

| Audit issue | Status | Live implementation / evidence |
|---|---|---|
| Payment coverage | Merchant action required | Shopify Payments exposes a four-step Belgian KYC flow beginning with legal-entity type. PayPal is also marked `Setup incomplete`. No legal, identity or bank data was guessed. |
| Reviews/testimonials | Excluded | Left untouched by explicit instruction. |
| Late shipping cost | Fixed | Homepage, PDP, cart progress, checkout and shipping policy disclose **€6.99 tracked shipping** and **automatic free shipping from €50**. Live checkout tests confirmed €6.99 below the threshold and a €6.99 discount to FREE above it for both standard and bulky items. |
| Mobile drawer scroll leak | Fixed | Opening the drawer fixes the body, preserves the stored scroll offset, blocks background movement and restores the exact position on close. Focus, `inert` and Escape behavior remain intact. |
| Dead `Shop by play` route | Fixed | Both header routes now target `/collections/all-toys#shop-by-play`; the live catalogue contains that anchor and the play shortcuts. |
| Sold-out catalogue pollution | Fixed at storefront level | The default catalogue now excludes unavailable products while preserving direct sold-out PDP recovery. Live verification: zero sold-out cards in the default grid. Inventory was not fabricated and supplier stock was not overridden. |
| Shallow filtering | Fixed | Added combinable Age, Play and Material/origin facets using the store's governed product tags. Live test: `Age 1+` + `Sensory play` returns the correct two products; incompatible combinations provide recovery actions. |
| Weak product media | Merchant content required | Responsive delivery, alt handling and real source media remain intact. No fake scale/use/demo photography was generated. Authentic demonstrations, packaging and in-use images still require product-content production. |
| Generic checkout branding | Fixed | Active checkout uses the Loemies PNG wordmark, 160 px width, Poppins headings/body, white/soft-grey surfaces and accessible rust `#B04F38` accents/buttons. Shopify returned `userErrors: []` when saved. |
| Excess checkout fields | Fixed | Company, VAT number and shipping phone are not included. Address line 2 stays optional so apartment residents are not blocked. Guest checkout and unchecked marketing consent remain. |
| Duplicate colourway browsing | Fixed without inventory risk | True colon-named colour families collapse to one catalogue card with accessible style links. Product IDs, supplier inventory and SEO URLs remain unchanged. Live default catalogue: 34 available SKUs represented by 30 buying cards. |
| Tall mobile hero | Fixed | Mobile padding, card spacing and media/action gaps were reduced while retaining the H1, message, both routes and featured product. The next shopping section now begins in the first 844 px viewport. |
| Empty add-to-cart overlay | Fixed | Mobile cart confirmation is a compact bottom sheet. Live measured panel: ~494 px high in a 844 px viewport, with item, total, delivery disclosure and actions grouped together. |
| Search validation | Verified | Visible-form wildcard normalization returns real products for tested customer terms; predictive search and no-results recovery remain intact. |
| Browser-local wishlist ambiguity | Already fixed | Existing UI accurately says saved items are stored in this browser/on this device. No extra app weight was added without demand evidence. |
| Catalogue translations | Verified | Translate & Adapt shows Dutch and French published, with auto-translation run on 2 August 2026. Live Dutch testing renders localized navigation, homepage content and product titles. New theme strings ship in EN/NL/FR locale files. |
| Age tagging | Verified | All 50 products have an age route/tag; filter coverage was validated before exposing the facets. |
| Shipping-rate naming | Fixed | Active rate is **EU Shipping with Tracking** and renders with the correct price at checkout. |

## Live mobile verification

- Viewport: 390 × 844 CSS pixels.
- Homepage → collection → product/quick add → cart notification → checkout exercised on the live theme.
- Default collection: 30 rendered buying cards, 0 sold-out cards, 2 grouped colour families, count matches rendered cards.
- Multi-filter URL verified: `/collections/all-toys/age-1+sensory-play`.
- Empty-filter recovery verified with `Clear filters` and `Browse categories` actions.
- Cart restored to its pre-test state after quick-add testing.
- Checkout displays the brand logo/colors/font, omits company/phone, and shows **EU Shipping with Tracking**.
- Belgium and Netherlands rate endpoints return **EU Shipping with Tracking — €6.99** below €50. Live checkout shows the €6.99 rate discounted to **FREE** at €55.96 and on a €109.99 bulky item; the original cart was restored afterward.
- Shipping policy live-check confirms €6.99 per order, automatic free shipping from €50 and 3–8 business-day guidance.
- Shopify Theme Check: 77 files, 0 offenses.

## Remaining launch gates outside safe implementation authority

1. Complete Shopify Payments' Belgian KYC, payout and payment-method setup with the merchant's true legal entity and bank/identity data; finish PayPal onboarding if PayPal will remain offered.
2. Run real low-value card, Shop Pay, Bancontact and eligible Dutch-method orders, failures and refunds once payments are active.
3. Replace or remove the intentionally excluded placeholder reviews before public traffic.
4. Produce authentic product demonstrations, scale, packaging and in-use media for the weakest galleries.
5. Review legal-policy translations with qualified merchant/legal ownership before publishing localized legal text.

Those are not theme defects and cannot be safely completed by inventing identity, inventory, legal wording, customer proof or product photography.
