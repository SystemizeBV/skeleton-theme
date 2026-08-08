# Blog publishing, structured data, and SEO

The article template owns presentation and technical SEO. Article bodies should
contain only visible editorial content. Do not paste an `h1`, a table of
contents, or JSON-LD scripts into Shopify's article editor.

## What the theme generates automatically

Every article receives:

- one visible `h1` from the Shopify article title;
- canonical and social metadata from Shopify's search-engine listing fields;
- `BlogPosting` JSON-LD with headline, description, author, publisher,
  publication/update dates, word count, language, tags, and three featured-image
  aspect ratios;
- matching `BreadcrumbList` JSON-LD;
- a localized table of contents generated from main body `h2` headings, with an
  optional theme setting to include `h3` subsections;
- visible publication and update dates;
- an author biography card when the Shopify staff author has a biography or
  image;
- visible FAQ content and matching `FAQPage` JSON-LD when FAQ custom data is
  assigned;
- curated internal collection links when related collections are assigned.

The table of contents assigns safe, unique heading IDs at render time. Authors
can use Shopify's visual editor without preserving manually entered IDs.

## FAQ custom-data setup (recommended)

Create a metaobject definition under **Settings → Custom data → Metaobjects**:

- Name: `FAQ item`
- Type: `faq_item`
- Storefront access: enabled

Add these required fields using the exact keys:

| Name | Key | Type |
| --- | --- | --- |
| Question | `question` | Single-line text |
| Answer | `answer` | Multi-line text |

Use `Question` as the display-name field.

Create a blog-post metafield definition under
**Settings → Custom data → Blog posts**:

- Name: `FAQs`
- Namespace and key: `custom.faqs`
- Type: Metaobject reference
- Reference: `FAQ item`
- Accept a list of entries: enabled
- Storefront access: enabled

For each article, create or select the FAQ entries in the order they should be
displayed. The theme uses this one list for both the visible accordion and
FAQPage JSON-LD, preventing the two versions from drifting apart.

### Compatibility with a JSON FAQ field

The theme also supports Claude's proposed `custom.faq_schema` blog-post
metafield when its type is **JSON** and its value is a complete `FAQPage`
object with a `mainEntity` array. The visible FAQ accordion is generated from
that same object.

Do not populate both `custom.faqs` and `custom.faq_schema`; the metaobject list
takes precedence. Do not leave an embedded FAQ script in the article body,
because that would duplicate the theme-generated schema.

## Curated internal collection links

Create another blog-post metafield definition:

- Name: `Related collections`
- Namespace and key: `custom.related_collections`
- Type: Collection reference
- Accept a list of entries: enabled
- Storefront access: enabled

Assign up to four genuinely relevant collections to an article. The theme
renders branded collection cards after the article and before related posts.
Keep contextual links inside the article body as well; use descriptive anchor
text such as `houten Montessori speelgoed` rather than `klik hier`.

## Author setup

Shopify article authors come from staff accounts. For every publishing author,
complete the public name, biography, image, and optional homepage in the staff
account profile. The article displays the name by default and adds a biography
card only when real profile information exists. The same name and homepage are
used in BlogPosting structured data.

## Article body rules

Use this hierarchy:

1. Optional visible “In het kort” summary inside the body
2. `h2` for every main section
3. `h3` only for a subsection of the preceding `h2`
4. Paragraphs, lists, figures, quotes, and tables as needed

Do not add another `h1`. Do not manually paste a contents navigation. The
automatic table of contents appears when the configured minimum number of
headings is present (three by default).

Use normal links for trustworthy editorial sources. Reserve `rel="sponsored"`
for paid placements, `rel="ugc"` for user-generated links, and `nofollow` for a
destination Loemies deliberately does not want to endorse or associate with.

## Publishing the Montessori guide

Recommended Shopify fields:

- Article title / `h1`: `Wat is Montessori speelgoed en wat zijn de voordelen?`
- SEO page title: `Wat is Montessori speelgoed? Voordelen & complete gids`
- URL handle: `wat-is-montessori-speelgoed`
- Excerpt: the concise “In het kort” answer
- Tags: `Montessori`, `Houten speelgoed`, and one additional genuinely useful
  topic at most

The theme appends the Loemies name to an SEO title that does not already contain
it. Keep the entered page title concise enough for the combined result.

Upload a relevant high-resolution featured image, set accurate alt text, and
use a descriptive filename before upload. The featured image powers the article
hero, social preview, and structured-data image variants.

## Release validation

After publishing and removing the storefront password:

1. Confirm the canonical URL and final title in page source.
2. Confirm that there is exactly one visible `h1`.
3. Follow every table-of-contents anchor on desktop and mobile.
4. Validate the URL in Google's Rich Results Test.
5. Inspect the URL in Google Search Console and request indexing.
6. Submit Shopify's generated `/sitemap.xml` once in Search Console.

FAQPage markup is kept accurate and machine-readable, but Google generally
limits visible FAQ rich results to authoritative government and health sites.
Do not treat an FAQ dropdown or any AI-search inclusion as guaranteed.
