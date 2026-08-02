# Product reviews

The product page renders approved reviews from Shopify custom data and sends new
customer submissions through Shopify's contact form for moderation.

## Shopify custom-data setup

Create a metaobject definition in **Settings → Custom data → Metaobjects**:

- Name: `Product review`
- Type: `product_review`
- Storefront access: enabled

Add these fields using the exact keys below:

| Name | Key | Type | Required |
| --- | --- | --- | --- |
| Reviewer name | `reviewer_name` | Single line text | Yes |
| Rating | `rating` | Integer, minimum 1 and maximum 5 | Yes |
| Review title | `title` | Single line text | No |
| Location | `location` | Single line text | No |
| Message | `message` | Multi-line text | Yes |
| Review date | `review_date` | Date | No |
| Source | `source` | Single line text | No |
| Verified purchase | `verified_purchase` | True or false | No |
| Original review ID | `original_review_id` | Single line text | No |
| Original review URL | `original_review_url` | URL | No |

Use `Reviewer name` as the display-name field. Keep imported-review provenance in
the source, original ID, and original URL fields even when it isn't shown to
customers.

Create a product metafield definition in **Settings → Custom data → Products**:

- Name: `Reviews`
- Namespace and key: `custom.reviews`
- Type: Metaobject
- Reference: `Product review`
- Accept a list of entries: enabled
- Storefront access: enabled

## Creating and publishing a review

1. Go to **Content → Metaobjects → Product review → Add entry**.
2. Enter the original reviewer name, rating, optional title, location, message, date, and source.
3. Use `Verified purchase` only when the original data proves the purchase.
4. Set the entry to **Active** when it is approved, or **Draft** while reviewing it.
5. Open the matching product in Shopify Admin and select the entry in its
   `Reviews` metafield.
6. Reorder the selected entries on the product to control their storefront order.

Edits to an active entry appear wherever that entry is connected. Draft entries
aren't exposed through the storefront metafield.

## Customer submissions

The product-page form collects name, location, private email, rating, message,
and publication consent. Shopify sends the submission to the store's contact
email with the product title, product URL, and a `Pending moderation` status.

After checking a submission, create a `Product review` entry and connect it to
the relevant product. This deliberate approval step prevents visitors from
writing directly to storefront data.

## Importing reviews from an older store

Preserve at least these columns in the source export:

```text
product_handle,reviewer_name,rating,title,location,message,review_date,source,original_review_id,original_review_url,verified_purchase
```

Do not mark an imported review as a verified purchase unless the source export
contains reliable order or verification evidence. Keep the original export as
an audit record.
