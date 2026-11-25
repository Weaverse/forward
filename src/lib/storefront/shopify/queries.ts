/**
 * Storefront API documents for the read-only catalog adapter.
 *
 * Server-only: `gql()` calls must never be reachable from browser code, so this
 * module is imported exclusively by `./client.ts`, which is imported only by
 * the server-side data source.
 *
 * The whole-catalog read pages through the store with a cursor, so a catalog
 * of any size is read in full; a product page reads its own product by handle.
 * Variants and media keep a per-product bound, and the mapper fails loudly on
 * `hasNextPage` there rather than serve a truncated product.
 */

import { gql } from "@shopify/hydrogen";

/** Ownership tag every managed Forward product must carry. */
export const CATALOG_OWNERSHIP_TAG = "forward";

/**
 * Fixed Storefront search filter. This is a constant — no user input is ever
 * interpolated into Shopify GraphQL search syntax.
 */
export const CATALOG_PRODUCT_FILTER = `tag:${CATALOG_OWNERSHIP_TAG}`;

/** Products per page of the whole-catalog read. */
export const CATALOG_PRODUCT_LIMIT = 50;
/** Per-product bounds; exceeding either is a hard adapter failure. */
export const CATALOG_VARIANT_LIMIT = 50;
export const CATALOG_MEDIA_LIMIT = 50;

/**
 * Every field the normalized `Product` needs, shared by the whole-catalog read
 * and the per-collection read so the two cannot describe different products.
 */
export const PRODUCT_FIELDS_FRAGMENT = `#graphql
  fragment ForwardProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    productType
    vendor
    tags
    options {
      name
      optionValues {
        name
        swatch {
          color
        }
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
`;

export const CATALOG_QUERY = gql(`
  query ForwardCatalog(
    $first: Int!
    $after: String
    $variantFirst: Int!
    $mediaFirst: Int!
    $query: String!
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...ForwardProductFields
      }
    }
  }
  ${PRODUCT_FIELDS_FRAGMENT}
`);

/**
 * One product by handle, and the handles of the store's other products of its
 * type, which a PDP offers as related. `$relatedQuery` is built by the data
 * source from the product's own `productType`, never from shopper input.
 */
export const PRODUCT_QUERY = gql(`
  query ForwardProduct(
    $handle: String!
    $variantFirst: Int!
    $mediaFirst: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ForwardProductFields
    }
  }
  ${PRODUCT_FIELDS_FRAGMENT}
`);

export const RELATED_PRODUCTS_QUERY = gql(`
  query ForwardRelatedProducts(
    $first: Int!
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query) {
      nodes {
        handle
        productType
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
