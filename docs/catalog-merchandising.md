# Catalogue merchandising setup

The theme now provides a visible quick-browse row for the existing Loemies age,
play-type, and gift tags. It also renders any filters configured through Shopify
Search & Discovery. Complete the following data setup in Shopify admin so those
filters become useful and consistent across the full catalogue.

## Product metafields

Create these product metafield definitions:

| Namespace and key | Type | Purpose |
| --- | --- | --- |
| `custom.age_band` | List of single-line text | Faceted age browsing |
| `custom.play_type` | List of single-line text | Faceted play-type browsing |
| `custom.material` | List of single-line text | Material filtering when the value materially narrows the range |
| `custom.play_location` | List of single-line text | Controlled values `Indoor`, `Outdoor`, or both |
| `custom.card_age` | Single-line text | Short card label, such as `2 years` |
| `custom.card_detail` | Single-line text | Optional second card label, such as `FSC wood` |
| `custom.card_title` | Single-line text | Short catalogue title when the product title is too long |

Use a controlled value set.

Age bands:

- 12–18 months
- 18–24 months
- 2–3 years
- 3–5 years
- 5+ years

Play types:

- Building and stacking
- Pretend play
- Puzzles
- Sensory and fine motor
- Active and outdoor
- Learning

Materials should use a short controlled set rather than free-form marketing
copy. For example: FSC-certified wood, solid wood, cotton, silicone, cardboard,
and recycled plastic. Keep certifications in their own accurate product data;
do not infer or add an FSC claim from the word "wood".

Play locations:

- Indoor
- Outdoor

Products suitable for both should receive both values. Translate metafield
values with Shopify Translate & Adapt so filters do not remain in English on
Dutch and French storefronts.

Translate merchant-authored collection titles and descriptions there as well.
The theme localizes its own All toys fallback and interface labels, but it does
not replace genuine custom collection copy with a machine-created translation.

Assign every product to every age band for which it is genuinely suitable. Do
not treat the age-band field as a minimum-age field: a parent selecting “2–3
years” expects all suitable toys, including toys whose minimum age is one year.

## Search & Discovery filters

In Shopify Search & Discovery, start with:

1. Age band (`custom.age_band`)
2. Play type (`custom.play_type`)
3. Shopify product category
4. Price
5. Availability

Add material (`custom.material`) and play location (`custom.play_location`) only
after most products have those fields populated and each option meaningfully
narrows the result set. Avoid vendor and duplicate product-type/category facets.
The theme automatically renders all filters enabled in Search & Discovery,
including active-value counts, price ranges, clear controls, and mobile state.
An empty or partially configured facet should be fixed in product data rather
than hard-coded into the theme.

## Collection merchandising

For the **All Toys** collection:

1. Use a curated/featured default order.
2. Keep available products ahead of unavailable products.
3. Mix play types, imagery, and price points in the first eight positions.
4. Avoid placing visually similar colour variants next to one another.
5. Move sold-out products to the end unless back-in-stock notifications are
   enabled.

Review the first page after every material inventory change. At the time this
document was created, 16 of 50 catalogue products were unavailable.

## Collection images

Assign a dedicated featured image to each category collection. The theme falls
back to the first product image when one is missing, but a curated cover avoids
duplicate imagery and accidental changes when collection ordering changes.

## Strategic landing pages

The existing tag pages now receive contextual on-page titles, descriptions, and
metadata. If organic search becomes important for terms such as “toys for
one-year-olds,” replace the corresponding tag page with a real automated
collection and give it unique editorial copy.
