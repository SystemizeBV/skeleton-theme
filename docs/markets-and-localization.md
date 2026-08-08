# Markets and localization launch checklist

The theme-owned interface is complete and structurally identical in English,
Dutch, Belgian Dutch, Netherlands Dutch, French, and Belgian French. Locale
files do not publish languages or translate merchant-authored Shopify content.

## Published storefront languages — completed 2026-08-02

English, Dutch, and French are published. Shopify Translate & Adapt is installed
and completed automatic catalogue passes for Dutch and French. Live validation
confirmed 50/50 products in each localized feed have a translated title and a
non-empty translated description; `/nl/products/...` and `/fr/products/...`
render the correct `lang`, canonical, title, purchase labels, tracked-shipping
promise, and 30-day return copy.

Before removing password protection, re-confirm in **Settings → Markets** that
Belgium and the Netherlands expose the intended language choices. Shopify's
admin preview reports a language as not visible when the tester's current
region is outside an assigned market; the direct localized storefront URLs are
already valid.

1. Keep English, Dutch, and French published.
2. In **Settings → Markets**, keep Belgium and the Netherlands assigned and
   confirm the intended languages for each market.
3. Keep the regional theme locale files (`nl-BE`, `nl-NL`, and `fr-BE`) so
   Shopify can select regional copy when those locale codes are used.
4. Verify each generated language URL from Shopify rather than inventing paths.

The header automatically shows language and country/region controls when more
than one option is published. Language labels include the locale code so two
Dutch regional options remain distinguishable.

## Translate Shopify resources

Translate & Adapt now owns the Shopify-resource translation workflow for product
titles, descriptions, product types, metafield values, collections, pages,
blogs, articles, menus, policies, and merchant-overridden theme settings. Keep
an eye on its outdated-content indicators whenever English source content is
edited. Pay special attention to `custom.card_age`, `custom.card_detail`,
`custom.card_title`, filter values, complementary-product copy, and homepage SEO
settings.

Review Dutch separately for Belgium and the Netherlands wherever delivery,
returns, tax, payment, or legal wording differs. Legal and policy translations
must be approved by the business; the theme deliberately does not fabricate
them.

## Customer privacy and payments

Customize and localize the Shopify cookie banner in **Settings → Customer
privacy**. It is injected by Shopify outside the theme and can otherwise become
the largest mobile element.

Enable Shopify Payments and the genuinely supported local methods only after
business, bank, and KYC verification. The theme displays Shopify's real enabled
payment methods; it never claims card or Bancontact support before activation.
