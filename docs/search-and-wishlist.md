# Search and wishlist

## Search normalization

The store's predictive endpoint performs prefix matching, but the full search
endpoint requires an explicit trailing wildcard on this shop. Forms marked with
`data-normalize-search-query` append that wildcard at submit time. Predictive
search's **View all** URL uses the same normalized query.

The results template and header remove the technical `*` before displaying the
query back to the customer. Keep `data-normalize-search-query` on both the
header and results-page forms if either form is replaced. The wildcard behavior
is a JavaScript enhancement required by this shop's current search index; the
plain Shopify query remains the no-JavaScript fallback.

Regression check: `swing` should navigate to `/search?q=swing*...` and return the
same swing products offered by predictive search.

## Local wishlist

The wishlist deliberately works without an app or customer account. It stores a
small product record array in `localStorage` under `loemies:wishlist:v1` and is
therefore specific to the browser/device. The wishlist page lives at the
Shopify-native alternate search template route `/search?view=wishlist`, so no
merchant-created Page resource is required.

The product page saves/removes items and dispatches `loemies:wishlist:change`.
The header listens for that event and for cross-tab storage changes to keep all
counts current. The wishlist page refreshes each saved product from Shopify's
localized product JSON endpoint before rendering it. A stored snapshot remains
available as a graceful fallback when a request temporarily fails. A confirmed
404/410 removes the stale entry instead of leaving a link to a deleted product.

The previous `loemies:wishlist:<product-id>` Boolean format is migrated when a
saved product is next visited.

Regression checks:

1. Save a product and confirm both header counts become `1`.
2. Open `/search?view=wishlist` and confirm the product appears.
3. Remove it and confirm the empty state and zero counts appear immediately.
4. Repeat in a second tab and confirm the count follows the storage change.
5. Verify the empty and populated layouts at 390px and 1280px widths.
