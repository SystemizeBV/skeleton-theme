# Loemies full-site mobile UX and conversion audit

**Audit date:** 2 August 2026

**Store tested:** `y1a0kp-n0.myshopify.com`

**Primary viewport:** 390 × 844 CSS pixels

**Journey tested:** homepage → collection → quick add/product → cart → checkout, plus search, localization, trust pages, empty states, sold-out recovery, footer and mobile navigation

## Executive verdict

Loemies now has a strong, coherent storefront. It is not ready to claim a 95/100 conversion score.

The shortest realistic path reaches checkout in **three taps**: `Shop all toys` → product `Add to cart` → `Checkout`. That is excellent. The problem is what happens around and after those taps. The checkout currently exposes only PayPal and payment is not live, delivery cost and method remain hidden until the shopper submits an address, 16 of 50 products are sold out, the mobile menu scrolls the page behind itself, and the navigation contains a dead `Shop by play` destination. Most seriously, the homepage publishes invented reviews, including a free-shipping claim that contradicts the real offer. Those are not cosmetic defects; they attack completion, trust and findability.

**Current conversion score: 76/100.** The theme-level shopping experience is **91/100**, but the public-launch journey is only **76/100** because the payment and trust failures are hard blockers. With genuine social proof removed/replaced, payments activated and tested, shipping cost disclosed earlier, navigation defects fixed, and unavailable inventory cleaned up, **95/100 is realistic**. It is not honest today.

## Audit context and limits

- **Platform:** Shopify Online Store 2.0.
- **Plan:** not verifiable from the storefront or repository. Checkout recommendations therefore separate Basic-or-higher controls from Shopify Plus-only controls.
- **Theme:** heavily customized Loemies build based on Shopify Skeleton.
- **Frontend apps:** no injected storefront app blocks or third-party overlay widgets were detected. Translate & Adapt and supplier/inventory tooling affect content or operations, not the visible theme experience.
- **Inferred audience:** Belgian and Dutch parents, grandparents and gift buyers shopping for wooden, Montessori, sensory and active-play toys.
- **Catalogue:** 50 products, approximately €13.99–€149.99; Belgium and Netherlands are the enabled delivery countries in the checkout tested.
- **Missing commercial data:** device/channel split, new-versus-returning mix, funnel analytics, search terms, revenue by product and session recordings were not supplied. The severity ratings are therefore based on direct observation and established usability research, not claimed analytics causality.
- **Development exceptions:** payment activation and fabricated reviews were previously marked as intentionally deferred. They are still counted here because this audit scores the complete path to a completed public order.

## End-to-end buying journey

### Shortest realistic route: 3 taps before checkout

| Step | Shopper action | Decisions introduced | What happens |
|---|---|---:|---|
| 1. Landing | Tap **Shop all toys** in the homepage hero | 1: shop everything or choose an age path | Clear value proposition, delivery/returns announcement and two focused CTAs create orientation quickly. |
| 2. Discovery | Scan the 50-product collection and tap **Add to cart** on a suitable card | Product, age, price and availability | Two-column cards, age badges, prices and quick-add controls support fast scanning. Availability is undermined by 16 sold-out products. |
| 3. Cart feedback | Tap **Checkout** in the full-screen added-to-cart confirmation | Checkout now, view cart or continue shopping | Feedback is unmistakable and the primary action is correctly dominant. The panel wastes a large blank middle area but does not hide the CTA. |
| 4. Checkout | Choose PayPal express or complete contact and delivery fields | Express versus form; country; address; marketing consent | Guest checkout is clear, marketing is opt-in and policy links are present. Payment choice, branding, field load and delivery-price disclosure are weak. |
| 5. Payment | Attempt to pay | PayPal only | The tested checkout cannot reach a valid completed-order outcome. The site therefore fails its one non-negotiable job. |

The realistic product-evaluation route is **five taps before checkout**: `Shop all toys` → product card/title → `Add to cart` → confirmation → `Checkout`. It adds a useful PDP rather than gratuitous steps: gallery, age guidance, inventory status, dispatch time, tracking, returns, details and sold-out recovery all answer purchase questions in context.

## Findings, ranked

### 1. Payment is not launch-ready and the checkout offers only PayPal

- **Where:** mobile checkout, express checkout and Payment section.
- **Evidence:** the tested checkout showed one yellow PayPal express button and PayPal as the only payment method. Card entry, Shop Pay, Apple Pay/Google Pay, Bancontact and iDEAL/Wero were absent; payment completion is known to be disabled during development.
- **Why this hurts:** a checkout that cannot accept the shopper's preferred payment method is a terminal failure, not friction. For a Belgium/Netherlands audience, omitting local methods violates Jakob's law: shoppers expect the payment methods they routinely use elsewhere. Shopify documents cards and accelerated wallets with Shopify Payments in Belgium, plus Bancontact for Belgian customers and iDEAL/Wero for eligible Dutch customers.
- **Rating:** **Critical** · **High conversion impact** · **Shopify payment settings** (no theme work; no plan upgrade inherently required).
- **Action:** activate Shopify Payments, cards, Shop Pay and compatible wallets; activate Bancontact for Belgium and iDEAL/Wero when eligible; run real low-value orders, refunds, failures and mobile-wallet tests before removing the password.

Sources: [Shopify payment methods in Belgium](https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries/belgium/payment-methods), [Shopify Bancontact requirements](https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/bancontact?lang=en).

### 2. The homepage publishes fabricated social proof and one testimonial promises free shipping

- **Where:** homepage `4.8/5 based on 25 family reviews` block and its 25 testimonial cards.
- **Evidence:** the reviews are acknowledged placeholders. One card says free shipping was applied automatically, while the header and cart promise tracked EU delivery and checkout calculates shipping later. Collection cards mostly have no rating while one card displays `(1)`.
- **Why this hurts:** false precision looks manufactured, and the free-shipping contradiction creates a concrete expectation the checkout cannot meet. Trust is cumulative and fragile; inconsistent evidence forces recall and comparison instead of recognition. This can also create advertising, consumer-protection and platform-policy exposure.
- **Rating:** **Critical** · **High conversion impact** · **Customizer change now; app add/replace later**.
- **Action:** disable the entire testimonial/rating section before public launch. Reintroduce reviews only from verified orders through one review system, with identical rating logic on homepage, cards and PDPs. Never publish a claim that is not true for the current market and cart.

### 3. Shipping cost and speed appear only after a full address is entered

- **Where:** cart/added-to-cart confirmation and checkout Shipping method section.
- **Evidence:** the cart says `Tracking included with every parcel` but gives no amount or threshold. Checkout says `Enter your shipping address to view available shipping methods`; the collapsed mobile total initially excludes shipping.
- **Why this hurts:** Baymard reports unexpected extra costs as the leading stated abandonment reason. Hiding a predictable cost until after address entry creates sunk effort followed by surprise. The renamed rate, **EU Shipping with Tracking**, is clear once it appears, but it appears too late.
- **Rating:** **Major** · **High conversion impact** · **Theme setting/custom Liquid plus Shopify shipping settings**.
- **Action:** publish a simple Belgium/Netherlands delivery-price table or `Shipping calculated at checkout — from €X` in the cart and PDP trust row. Add a delivery range beside it. Do not claim `free` unless every qualifying rule is configured and tested.

Source: [Baymard on reducing cart abandonment](https://baymard.com/learn/reduce-cart-abandonment).

### 4. The mobile drawer does not lock page scroll

- **Where:** sitewide mobile navigation drawer.
- **Evidence:** opening the drawer at page position 900 and swiping moved the document to position 1400 behind the open panel. Closing the menu returned the user to a different place. The markup has a `scroll-lock` attribute, but the header script never applies a body scroll lock.
- **Why this hurts:** an overlay must preserve the user's context. Background movement creates spatial disorientation and makes the menu feel broken. It is especially damaging mid-collection, where the shopper loses the products they were comparing.
- **Rating:** **Major** · **Medium conversion impact** · **Minor custom JavaScript/CSS**.
- **Action:** when the drawer opens, store `scrollY`, lock the document without layout shift, and restore that exact position on close. Keep the existing focus trap, `inert` handling and Escape behavior; those parts work.

### 5. `Shop by play` is a dead navigation promise

- **Where:** mobile drawer and desktop Shop dropdown.
- **Evidence:** both links point to `/#shop-by-play`; the homepage contains no element with that ID. `Shop by age` works, so the broken sibling is more noticeable.
- **Why this hurts:** navigation labels are promises. A tap that produces no visible change destroys information scent and makes users repeat the action. On mobile it looks like the site ignored the shopper.
- **Rating:** **Major** · **Medium conversion impact** · **Customizer change or custom Liquid**.
- **Action:** link to the actual play-navigation section/collection if it exists, add the missing anchor to the intended homepage section, or remove the item until the taxonomy is real.

### 6. One third of the catalogue is unavailable

- **Where:** All toys collection, pagination and sold-out PDPs.
- **Evidence:** 16 of 50 products are sold out. Page one sensibly pushes six unavailable items below available stock, and sold-out PDPs provide email recovery and a `Browse available toys` route, but shoppers still spend attention on products they cannot buy.
- **Why this hurts:** 32% unavailable inventory makes a small catalogue feel abandoned, reduces useful choice and adds dead-end evaluation. Recovery design cannot replace stock. It also makes paid landing traffic fragile if ads or search results point at unavailable products.
- **Rating:** **Major** · **High conversion impact** · **Shopify product/inventory admin or supplier app setting**.
- **Action:** restock genuinely, archive products that will not return, suppress long-term unavailable products from default merchandising and feeds, and monitor supplier sync. Do not enable `continue selling when out of stock` unless fulfilment is real.

### 7. Product filtering is too shallow for the catalogue promise

- **Where:** All toys collection filter drawer.
- **Evidence:** the drawer offers Availability, Price and Product type. Age is represented by single-destination chips above the grid, but there is no structured multi-select age facet, material facet, developmental-skill facet or combinable play-style filter.
- **Why this hurts:** shoppers choosing children's products commonly need to combine constraints—age + type + price. Forcing them to choose one browse route and then visually inspect 50 cards increases scanning load. Hick's law is not an argument for fewer useful filters; it is an argument for a clear, relevant set.
- **Rating:** **Major** · **Medium conversion impact** · **Shopify Search & Discovery configuration plus product metafields; minor custom Liquid/CSS if presentation changes**.
- **Action:** define controlled age, play style, material and skill metafields; populate every product; expose only facets with meaningful result counts. Keep the current age chips as shortcuts.

### 8. Product media is consistent in layout but not persuasive enough in content

- **Where:** collection cards and PDP galleries, most visibly the Vintage Bowling product before its featured image was corrected.
- **Evidence:** responsive delivery and alt text are implemented and the bowling PDP now chooses a sharp real 800×800 image. However many source masters stop at 800 px, and the catalogue lacks short demonstrations, scale-in-hand/room, packaging and close-up proof across products.
- **Why this hurts:** toys are tactile and size-sensitive. A gallery that only shows supplier packshots cannot answer scale, texture, movement and what's-in-the-box questions. Baymard's product-page research treats image coverage—not just image count—as central to evaluation.
- **Rating:** **Major** · **Medium conversion impact** · **Shopify product media/content production**.
- **Action:** produce a repeatable seven-shot brief: clean hero, scale, use, detail, contents, packaging and a short demonstration. Upload masters large enough for zoom; never upscale a small source in the theme.

Source: [Baymard product-page UX research](https://baymard.com/research/product-page).

### 9. Checkout branding breaks the storefront's visual continuity

- **Where:** checkout header, links, typography and controls.
- **Evidence:** the storefront uses the Loemies rust/cream palette, rounded components and a distinct wordmark; checkout shows plain text `Loemies`, default blue accents and generic Shopify styling.
- **Why this hurts:** the highest-anxiety transition looks like a different site. Even when technically secure, abrupt visual discontinuity creates a momentary `am I still in the right place?` check and weakens the trust built on the PDP and cart.
- **Rating:** **Major** · **Medium conversion impact** · **Checkout branding settings on Basic or higher; advanced styling requires plan upgrade**.
- **Action:** upload the real logo, apply the closest supported brand font, use accessible rust accents/buttons and coordinate the checkout background with the storefront. Keep the checkout restrained; continuity matters more than decoration.

Shopify confirms that logo, basic colors and font are available through the checkout editor on Basic or higher, while the Checkout Branding API and advanced Checkout Blocks branding are Plus-only: [checkout configuration limits](https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations), [checkout style settings](https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-style).

### 10. Checkout exposes unnecessary optional fields

- **Where:** checkout Delivery form.
- **Evidence:** Company, address line 2 and phone are all visible as optional fields alongside email, first name, last name, address, postal code and city.
- **Why this hurts:** optional is still perceived work. Baymard found that field count—not nominal step count—is the better measure of checkout effort, and reports 17% of checkout abandoners citing complexity. Company is especially irrelevant for the inferred consumer audience.
- **Rating:** **Major** · **Medium conversion impact** · **Checkout form settings**.
- **Action:** set Company to `Don't include`; keep phone only if the carrier operationally requires it; retain address line 2 as optional because removing it can block apartment residents. Test accelerated wallets after changing fields.

Sources: [Baymard on checkout field count](https://baymard.com/blog/checkout-flow-average-form-fields), [Shopify checkout form options](https://help.shopify.com/en/manual/checkout-settings/checkout-form-options), [Baymard on address line 2](https://baymard.com/blog/address-line-2).

### 11. Colourways are separate products, creating duplicate browsing work

- **Where:** collection/search cards for swings, bean bags and other colour-led ranges.
- **Evidence:** colour variants appear as separate catalogue items rather than one product with swatches/variants.
- **Why this hurts:** the grid spends scarce positions repeating the same decision and inflates the apparent result count. Shoppers must open multiple PDPs to compare colour, losing context each time.
- **Rating:** **Major** · **Medium conversion impact** · **Shopify product data restructuring plus custom Liquid/CSS for swatches**.
- **Action:** merge true colour-only duplicates into variants when inventory, URL/SEO and supplier sync permit it; expose accessible swatches on cards and PDPs. Keep separate products only when the content, dimensions or buying intent materially differs.

### 12. The homepage hero delays the first shoppable card on a small screen

- **Where:** homepage first viewport at 390 × 844.
- **Evidence:** announcement, sticky header, hero copy, two CTAs and a featured-pick visual fill the initial viewport; the `Popular` heading appears, but the first normal product card begins below it.
- **Why this hurts:** paid-social visitors often arrive ready to scan products. The hero explains the offer well, so it should not be removed, but its mobile height makes product proof one scroll later than necessary.
- **Rating:** **Minor** · **Medium conversion impact** · **Customizer change/minor CSS**.
- **Action:** reduce mobile hero vertical padding and featured-pick height by roughly 15–20%, preserving the H1, copy and both browse routes.

### 13. The add-to-cart confirmation has excessive empty space

- **Where:** full-screen mobile `Added to your cart` dialog.
- **Evidence:** item details sit at the top and total/actions at the bottom with a large empty white region between them.
- **Why this hurts:** the state is functionally excellent, but the empty gap makes one-item carts feel unfinished and pushes the relationship between product, total and action apart. Gestalt proximity suffers.
- **Rating:** **Minor** · **Low conversion impact** · **Minor CSS**.
- **Action:** use a compact bottom sheet or vertically group the item, total and actions while retaining the current dominant Checkout button and clear Continue shopping escape.

### 14. Search is technically strong but needs real-query validation before launch

- **Where:** header predictive search and search results form.
- **Evidence:** the header has a 44 px search target, predictive products with price and sold-out state, keyboard handling and a recovery-rich no-results state. The script appends a wildcard to submitted queries because this shop's full search requires it. Direct unnormalised English URLs for `vintage` and `bowling` returned zero while translated routes found the Vintage Bowling product; the customer-facing form is designed to avoid that condition.
- **Why this hurts:** the implementation is sensible, but relying on client-side query rewriting makes search quality dependent on JavaScript and does not prove that common customer vocabulary, misspellings and translated terms resolve well.
- **Rating:** **Minor** · **Medium conversion impact** · **Shopify Search & Discovery configuration; custom JavaScript only if failures are reproduced through the actual UI**.
- **Action:** export the top 50 real search terms after launch, test them in EN/NL/FR through the visible form, add synonym groups and redirects, and monitor zero-result terms. Do not call the current direct-URL discrepancy a storefront defect unless it reproduces through the actual form.

### 15. The wishlist is browser-local rather than account-persistent

- **Where:** header wishlist and wishlist results page.
- **Evidence:** wishlist data is stored in `localStorage`; it does not follow the user to another browser/device or authenticated account.
- **Why this hurts:** for a considered/gift purchase, users often research on mobile and return elsewhere. A saved item that silently disappears violates the feature's promise. This is not a launch blocker because cart and discovery paths are stronger.
- **Rating:** **Minor** · **Low conversion impact** · **App add/replace or custom customer-data implementation**.
- **Action:** label it `Saved on this device` now. Only add an app or account-backed implementation if analytics show meaningful wishlist use; do not add script weight for an unproven feature.

## What works and should survive a redesign

- **Orientation is immediate.** `Thoughtful toys, easier to choose`, the Montessori/wooden-toy eyebrow and age-based CTA explain product, tone and next action without a brand-film detour.
- **The core path is short.** Three taps to checkout is excellent application of Fitts's law: primary actions are large, nearby and visually dominant.
- **The mobile header earns its space.** Menu, search and cart use consistent 44 px targets; the compact sticky header remains after the announcement scrolls away. Search is prominent rather than buried in the drawer.
- **Navigation depth is controlled.** The Shop menu has five understandable choices instead of a mega-menu. The language/country selector exposes EN/NL/FR for Belgium and Netherlands without cluttering the primary row.
- **Collection scanning is good.** Two-column cards, age badges, prices, availability and quick add use a stable visual grammar. Horizontal age/play chips have a visible `Swipe to browse` cue.
- **Product pages answer buying questions at the decision point.** Age, stock, dispatch time, tracked EU shipping, 30-day returns, payment reassurance and details sit close to Add to cart. The sticky mobile buy bar reduces reach cost.
- **Cart feedback is unmistakable.** The added-to-cart state confirms the exact product and total, then offers Checkout, View cart and Continue shopping in a sensible hierarchy.
- **Edge states recover.** Empty cart points back to the catalogue; no-results search suggests broader terms and browsing; the 404 offers search and age routes; sold-out PDPs offer notification plus available alternatives.
- **Footer trust coverage is unusually complete.** Contact, FAQ, shipping, returns, policies, business identity and cookie preferences are present and readable. Critical delivery/return reassurance is also repeated on PDPs rather than hidden only in the footer.
- **Overlay restraint is good.** No newsletter popup, chat bubble or sale modal competed with the journey. A first-time regulated-market visitor should see one Shopify privacy/cookie interruption; returning/consented visitors see zero. Newsletter capture is inline.
- **Accessibility foundations are solid.** Skip link, visible labels, semantic controls, keyboard Escape, drawer focus management, `inert`, image alt handling and 44 px mobile controls are present. Preserve them while fixing background scroll.
- **Warm-session performance was good.** In the password/admin preview session, navigation showed approximately 354 ms DOMContentLoaded, 403 ms load, zero observed layout shift and no long tasks. These numbers are directional only: preview/admin scripts and warm cache make them unsuitable as a public cold-load benchmark. Run real-device Lighthouse and RUM after password removal.

## Cross-page consistency verdict

The theme feels like one brand, not a pile of app widgets. Rust, cream and muted green/lilac accents; rounded buttons/cards; strong rounded typography; age-chip styling; image ratios; spacing; and trust language are consistent from home through collection, PDP and cart. There are no visible third-party widgets fighting the design.

Three breaks matter:

1. **Checkout looks default** and abandons the storefront palette, logo treatment and component language.
2. **Review logic is inconsistent:** 25-review aggregate on the homepage, a single `(1)` badge on one card and empty rating states elsewhere.
3. **Shipping language conflicts:** `tracked EU delivery` and `tracking included` are consistent, but the fabricated free-shipping testimonial contradicts them and checkout withholds cost.

## Header and navigation verdict

The header actively helps buying. Search is a first-class mobile control, cart state is visible, the logo is readable without dominating, and the sticky behavior leaves only the compact header after the announcement. The drawer's five-option Shop hierarchy is appropriate for 50 products and localization is secondary but accessible.

It still ships with two avoidable defects: the background scroll leak and dead `Shop by play` target. Fix both before acquiring traffic. A navigation control that appears polished but fails is worse than omitting it.

## Footer verdict

The footer is structurally complete: support contact, About/FAQ/shipping/returns, account/cart, legal policies, payment area, newsletter, cookie preferences and company details. The tested policy/content destinations resolve and the cookie-preferences control opens Shopify's consent modal rather than navigating to a dead policy index. The density is justified and grouped well on mobile. Do not add more badges or legal copy above this baseline.

## Checkout controls by Shopify capability

### Fixable on Basic or higher in settings

- Upload the proper Loemies logo and set supported font, accent and button colours.
- Remove Company; determine whether phone is actually needed; keep address line 2 optional.
- Activate Shopify Payments, cards, Shop Pay and compatible wallets/local methods.
- Confirm the delivery rate is named **EU Shipping with Tracking** in every active shipping profile and market.
- Keep guest checkout prominent and marketing consent unchecked; both already work.
- Keep refund, shipping, privacy, terms and contact links visible; they already work.

### Requires Shopify Plus / Checkout Extensibility

- Apps that add content or functionality directly to the information, shipping and payment pages.
- Checkout Branding API control and advanced Checkout Blocks branding.
- Custom reassurance blocks, bespoke upsells or other component-level changes inside those checkout steps.

Shopify's current plan comparison explicitly makes information/shipping/payment-page app customizations and the Checkout Branding API Plus-only: [Shopify checkout customization comparison](https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations).

### Not possible through the storefront theme

- Reusing the theme's Liquid header/footer or arbitrary theme CSS inside checkout.
- Freely moving Shopify's protected checkout fields, payment controls or validation.
- Removing required legal/address/payment data just to shorten the form.

Do not upgrade to Plus merely to decorate checkout. First use the capable all-plan branding controls, fix payment coverage and disclose shipping cost earlier. Those have far higher expected return.

## Popup and interruption count

**First 30 seconds on mobile:** one expected interruption for a new regulated-market visitor—the Shopify privacy/cookie banner—and zero after consent. No newsletter popup, chat widget or stacked sale overlay was detected. Cookie preferences can be reopened from the footer and the modal provides Accept all, Decline all and Save choices. This is restrained and should remain so.

## Error and edge-state verdict

- **404:** strong recovery with branded illustration, explanation, search and age/category shortcuts.
- **No search results:** clear failure message, spelling/broader-query guidance and browse route.
- **Empty cart:** friendly copy and a direct catalogue CTA; not a dead end.
- **Sold out:** email notification and `Browse available toys` recovery; good theme behavior, but the 32% sold-out rate remains a commercial failure.

## Journey friction map: ten biggest blockers in order

| Journey order | Friction | Severity / impact | Owner |
|---:|---|---|---|
| 1 | Homepage presents fabricated `4.8/5` social proof and a false free-shipping quote | Critical / High | Customizer now; review system later |
| 2 | Hero height pushes the first normal product card below the first mobile viewport | Minor / Medium | Customizer/minor CSS |
| 3 | Mobile drawer permits background scrolling and loses browse position | Major / Medium | Custom JS/CSS |
| 4 | `Shop by play` in both menus points to a missing homepage anchor | Major / Medium | Customizer/Liquid |
| 5 | Collection has 16 sold-out products out of 50 | Major / High | Inventory/supplier operations |
| 6 | Filters cannot combine age with play style, material or developmental skill | Major / Medium | Search & Discovery/metafields |
| 7 | Separate colourway products duplicate comparison work | Major / Medium | Product data/Liquid |
| 8 | Product galleries lack consistent scale, use, detail and demonstration media | Major / Medium | Product content production |
| 9 | Cart does not reveal delivery price before checkout | Major / High | Shipping settings/Liquid |
| 10 | Checkout looks generic, exposes avoidable fields and offers only non-working PayPal | Critical / High | Checkout/payment settings; Plus only for advanced blocks |

## Top five sitewide quick wins this week

1. **Disable the homepage testimonial/review section** until every statement and aggregate comes from real verified orders.
2. **Fix or remove both `Shop by play` links** so every menu tap lands on a visible destination.
3. **Add robust mobile drawer scroll locking** while preserving the existing focus trap and scroll position.
4. **Trim mobile hero height by 15–20%** so the first product card becomes visible sooner.
5. **Brand checkout and remove Company** in Shopify settings; also decide whether carrier operations justify collecting phone.

Payment activation is more important than every quick win above, but it is listed as a launch gate rather than a design quick win because it requires merchant verification and end-to-end transaction testing.

## Top three strategic redesign changes

1. **Rebuild product discovery around structured product data.** Create governed age, play style, skill and material metafields; consolidate true colour variants; configure Search & Discovery facets and synonyms; then redesign cards around those attributes.
2. **Create an evidence-led product media and trust system.** Use the same photography brief for every SKU, add demonstration video, replace invented proof with verified-order reviews, and make rating eligibility identical across homepage, card and PDP.
3. **Design the cart-to-checkout promise as one system.** Show delivery range and cost logic before checkout, configure local payment methods, apply restrained checkout branding, remove avoidable fields and test the full Belgium/Netherlands order/refund journey on real devices.

## Scorecard

| Area | Score | Blunt assessment |
|---|---:|---|
| Landing and orientation | 9/10 | Clear, differentiated and focused; slightly tall on mobile. |
| Discovery and search | 8/10 | Excellent cards and shortcuts; shallow facets and catalogue duplication remain. |
| Product evaluation | 8/10 | Decision copy is strong; media content needs original proof. |
| Navigation and header | 8/10 | Helpful structure; one dead destination and a real drawer bug. |
| Cart and recovery states | 9/10 | Clear actions and unusually good recovery; shipping cost still hidden. |
| Trust and content | 5/10 | Excellent policy architecture is undercut by fabricated, contradictory reviews. |
| Checkout and payment | 4/10 | Guest flow is clean; generic branding, excess fields, late shipping and non-working PayPal-only payment fail launch readiness. |
| Mobile/accessibility | 9/10 | Strong foundations and tap targets; drawer scroll leak is the notable defect. |
| Performance discipline | 9/10 | Lean visible experience and no widget pile-up; public cold-load data still required. |
| Cross-page consistency | 7/10 | Theme is coherent; checkout, reviews and shipping claims break the system. |

**Weighted overall conversion score: 76/100.**

**Theme UX score excluding intentionally deferred payment/review placeholders: 91/100.**

**Target after the launch gates and strategic data/media work: 95/100.**

## Research basis

- [Baymard checkout usability research](https://baymard.com/research/checkout-usability)
- [Baymard on checkout form fields and perceived effort](https://baymard.com/blog/checkout-flow-average-form-fields)
- [Baymard product-page UX research](https://baymard.com/research/product-page)
- [Nielsen Norman Group heuristic summary](https://media.nngroup.com/media/articles/attachments/Heuristic_Summary_compressed.pdf)
- [Nielsen Norman Group on recognition rather than recall](https://media.nngroup.com/media/articles/attachments/Heuristic_6_A4_compressed.pdf)
