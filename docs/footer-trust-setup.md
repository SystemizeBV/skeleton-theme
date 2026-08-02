# Footer, policies, and trust setup

The footer only links to content that actually exists. It can use a curated
customer-service menu, explicit page URLs, conventional page handles, or
Shopify's native policy URLs. Missing pages and policies are not represented by
placeholder links.

## Required Shopify admin setup

1. Complete and review the shipping, refund, privacy, and terms policies under
   **Settings > Policies** for every active market.
2. The live About (`/pages/about-us`) and FAQ (`/pages/faq`) pages are published
   with their dedicated theme templates. Translate their merchant-authored page
   titles and any future admin copy for each active market. Create a separate
   payment-information page only after the business has approved its payment
   methods and copy; do not publish generic or unreviewed legal text.
3. In the theme editor, select explicit footer URLs when a page uses a custom
   handle. Otherwise the theme detects common handles such as `/pages/about-us`,
   `/pages/faq`, `/pages/shipping-and-returns`, and `/pages/returns`.
4. Optionally assign a Customer service menu. When one is assigned, its links
   replace the detected help links; Shopify policy links remain in the legal row.
5. Enable all genuinely supported payment methods in Shopify Payments. The
   footer displays `shop.enabled_payment_types`; the theme does not claim that a
   payment method is available when Shopify has not enabled it.

## Market translations

Translate Shopify policies, page content, navigation titles, and metafield
values in addition to the theme locale files. Theme locale JSON cannot translate
merchant-authored resources. Review Dutch separately for Belgium (`nl-BE`) and
the Netherlands (`nl-NL`) where delivery, returns, tax, or contact wording
differs, and publish French and English versions for the intended markets.
