/**
 * Storefront API documents for the read-only catalog adapter.
 *
 * Server-only: `gql()` calls must never be reachable from browser code, so this
 * module is imported exclusively by `./client.ts`, which is imported only by
 * the server-side data source.
 *
 * Bounds are explicit and small because this catalog is small. The mapper fails
 * loudly on `hasNextPage` rather than silently serving a truncated catalog.
 */

import { gql } from "@shopify/hydrogen";

/** Ownership tag every managed Forward product must carry. */
export const CATALOG_OWNERSHIP_TAG = "forward";

/**
 * Fixed Storefront search filter. This is a constant — no user input is ever
 * interpolated into Shopify GraphQL search syntax.
 */
export const CATALOG_PRODUCT_FILTER = `tag:${CATALOG_OWNERSHIP_TAG}`;

/** Bounded page sizes; exceeding any of these is a hard adapter failure. */
export const CATALOG_PRODUCT_LIMIT = 10;
export const CATALOG_VARIANT_LIMIT = 50;
export const CATALOG_MEDIA_LIMIT = 50;

export const CATALOG_QUERY = gql(`
  query ForwardCatalog(
    $first: Int!
    $variantFirst: Int!
    $mediaFirst: Int!
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query) {
      pageInfo {
        hasNextPage
      }
      nodes {
        id
        handle
        title
        description
        descriptionHtml
        productType
        tags
        options {
          name
          optionValues {
            name
          }
        }
        variants(first: $variantFirst) {
          pageInfo {
            hasNextPage
          }
          nodes {
            id
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
        media(first: $mediaFirst) {
          pageInfo {
            hasNextPage
          }
          nodes {
            __typename
            ... on MediaImage {
              id
              alt
              image {
                url
                width
                height
                altText
              }
            }
          }
        }
        highlights: metafield(namespace: "forward", key: "highlights") {
          type
          value
        }
        materials: metafield(namespace: "forward", key: "materials") {
          type
          value
        }
        fieldSpecs: metafield(namespace: "forward", key: "field_specs") {
          type
          value
        }
        care: metafield(namespace: "forward", key: "care") {
          type
          value
        }
        colorwayMediaMap: metafield(
          namespace: "forward"
          key: "colorway_media_map"
        ) {
          type
          value
        }
      }
    }
  }
`);

/** Credential-validity probe used only by the opt-in live verification script. */
export const SHOP_IDENTITY_QUERY = gql(`
  query ForwardShopIdentity {
    shop {
      name
    }
  }
`);
