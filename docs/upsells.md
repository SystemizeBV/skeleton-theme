# Complementary products and upsells

The product and cart pages use the same per-product recommendations. Nothing is shown when a product has no eligible recommendation, so the storefront never fills the space with arbitrary products.

## Recommended setup

1. Install Shopify Search & Discovery.
2. Open **Search & Discovery → Product recommendations** in Shopify Admin.
3. Select a product and add its **Complementary products**.
4. Save. The same choices can now appear beneath the add-to-cart controls and in the cart.

Keep each list deliberate. One or two inexpensive, genuinely useful additions will usually be stronger than a large recommendation grid. The theme automatically skips unavailable products, the current product, duplicate recommendations, and products already in the cart.

For carts containing several products, configured complementary products are selected in rounds: the first eligible recommendation from each cart item is considered before any item contributes a second recommendation. This prevents the first product in the cart from occupying every available position.

## Theme controls

In the product template, **Complementary products** controls the copy, colors, maximum number of items, quick add, and whether the block is visible.

In the cart template, select the **Complementary products** block to control the same presentation. **Use automatic recommendations as fallback** fills any positions left after manual pairings with Shopify-generated related products. Disable that setting for a strictly curated-only cart, or remove the block to disable cart upsells entirely.

Quick add is offered only when a product has a single default variant. Products with choices link to their product page so a customer cannot accidentally add the wrong option.

## Optional custom metafields

Search & Discovery is the primary source. These product metafields add finer control when needed:

- `custom.upsell_products` — **List of products**. Used as a fallback when no Search & Discovery complementary products exist.
- `custom.disable_upsells` — **True or false**. Hides recommendations originating from that product on both pages.
- `custom.upsell_heading` — **Single line text**. Replaces the product-page upsell heading for that product.

The custom product list is intentionally a fallback, not an override. This keeps Search & Discovery as the single source of truth for most merchandising.

## Merchandising guardrails

- Prefer accessories, refills, storage, matching pieces, or a lower-priced adjacent item.
- Avoid recommending a substitute for the product the customer already chose.
- Keep the recommendation specific; the block is hidden when no pairing is configured.
- Use Shopify discounts separately if a bundle price is required. The upsell component itself does not create or imply a discount.
