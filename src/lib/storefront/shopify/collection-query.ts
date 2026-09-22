/**
 * Storefront API document for one page of a collection.
 *
 * Unlike the whole-catalog read, this query is parameterized by the shopper's
 * own state: the facets they applied, the order they chose, and the cursor
 * they paged to. Shopify does the narrowing and the ordering, and returns the
 * facet list for the result alongside it — so a merchant enabling a filter in
 * Search & Discovery gets it with no theme change.
 */

import { gql } from "@shopify/hydrogen";

import { PRODUCT_FIELDS_FRAGMENT } from "./queries";

/** Products per page; a page is one network read. */
export const COLLECTION_PAGE_SIZE = 12;

export const COLLECTION_PRODUCTS_QUERY = gql(`
  query ForwardCollectionProducts(
    $handle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $variantFirst: Int!
    $mediaFirst: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      handle
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        nodes {
          ...ForwardProductFields
        }
      }
    }
  }
  ${PRODUCT_FIELDS_FRAGMENT}
`);
