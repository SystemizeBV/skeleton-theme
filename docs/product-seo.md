# Product SEO and structured data

## Catalogue standard

Product SEO is maintained in English, Dutch, and French. Titles lead with the
plain-language product noun and include the most useful differentiators—material,
format, colour, size, or piece count—without keyword repetition. Storefront titles
may be descriptive; search-engine titles are kept to 65 characters or fewer and
include `Loemies` once. Meta descriptions are unique, natural summaries between
100 and 165 characters.

Descriptions should help a parent decide, not merely restate a supplier feed.
Keep the opening benefit-led, retain verifiable specifications such as age,
dimensions, materials, certifications, contents, and care, and avoid absolute
safety or environmental claims that the business cannot substantiate.

The August 2026 catalogue pass covered all 50 active products and all four SEO
fields (`title`, `body_html`, `meta_title`, and `meta_description`) in English,
Dutch, and French. Forty-four checksum-valid EAN-13 values were copied from SKU
to Shopify's barcode field; six non-EAN SKUs were intentionally left without a
barcode.

## Product rich results

Do not add a second Product JSON-LD implementation. Shopify's
`{{ product | structured_data }}` filter in `snippets/meta-tags.liquid` is the
single product source. It generates the localized product, brand, image, offer,
price, currency, availability, SKU, GTIN, variant URL, and canonical product URL.
Product and variant data in Shopify must therefore remain the source of truth.

The footer's `OnlineStore` entity provides business identity and the confirmed
30-day merchant return policy for Belgium and the Netherlands. Shipping markup
is deliberately omitted until delivery times and shipping rates are represented
as complete, verified structured data.

## Release checks

1. Confirm every translated product field is present and not marked outdated.
2. Check that SEO titles are no longer than 65 characters and descriptions are
   between 100 and 165 characters.
3. Parse every `application/ld+json` block on a localized product URL and verify
   Product, Offer, price, EUR currency, availability, SKU/GTIN, and OnlineStore
   return-policy fields.
4. Run `shopify theme check --path .`.
5. Remove storefront password protection before launch; crawlers cannot index a
   password page. Validate representative in-stock and out-of-stock URLs with
   Google's Rich Results Test after the public domain is connected.
