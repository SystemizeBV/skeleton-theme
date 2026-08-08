# Loemies Shopify theme

Loemies is a custom Shopify Online Store 2.0 theme with a playful, pastel-led identity and a polished retail foundation. The design pairs soft cream, blush, lavender, sage, and butter with high-contrast ink and plum for readable, confident storefront UI.

## Brand foundation

- Merchant-editable color palette, typography, page width, spacing, and corner radii
- Poppins display typography paired with Work Sans body copy by default
- Responsive, no-JavaScript navigation built with native HTML disclosure elements
- Logo upload with an automatic shop-name wordmark fallback
- Search, customer account, cart count, footer navigation, and payment support
- Semantic landmarks, a keyboard skip link, visible focus states, and reduced-motion support

All global brand controls are available in **Online Store → Themes → Customize → Theme settings**. Header and footer content is configured in its corresponding section group.

## Local development with Shopify CLI

Node.js and a Shopify development store are required. Commands can use the current Shopify CLI through `npx`, so no global install is necessary.

Start an authenticated local preview for the Loemies development store:

```bash
npx @shopify/cli@4.5.2 theme dev \
  --store y1a0kp-n0.myshopify.com \
  --host 0.0.0.0
```

The explicit host is required when the development server runs inside a VM. Shopify CLI may also request the store's customer-facing storefront password; enter it at the prompt or provide it through a local secret, and never commit it to the theme.

Run Shopify's theme checks:

```bash
npx @shopify/cli@4.5.2 theme check
```

Upload a safe, unpublished preview theme:

```bash
npx @shopify/cli@4.5.2 theme push --unpublished --store y1a0kp-n0.myshopify.com
```

The CLI opens an authentication flow on first use. Avoid pushing to the live theme until the unpublished preview has been reviewed across mobile and desktop breakpoints.

## Project structure

```text
assets/      Global CSS and theme assets
blocks/      Reusable theme blocks
config/      Theme settings schema and saved defaults
layout/      Storefront document layout
locales/     Storefront and editor translations
sections/    Merchant-editable page, header, and footer sections
snippets/    Shared Liquid fragments
templates/   Shopify JSON and Liquid templates
```

## Quality checks

Before handing off a change:

1. Run `npx @shopify/cli@4.5.2 theme check`.
2. Preview with real products, menus, accounts, and cart states.
3. Test keyboard navigation, zoom, and small-screen layout.
4. Confirm any merchant-edited color combinations retain sufficient contrast.

## Provenance

Loemies is purpose-built on Shopify's open-source [Skeleton Theme](https://github.com/Shopify/skeleton-theme), rather than Dawn. Skeleton provides the lean Shopify-native architecture; the visual system and storefront components in this repository are custom Loemies work.

The upstream Skeleton Theme is distributed under the MIT License. See [LICENSE.md](./LICENSE.md).
