/** Storefront API document for the canonical Forward menu and collections. */

import { gql } from "@shopify/hydrogen";

export const NAVIGATION_COLLECTION_LIMIT = 10;
export const NAVIGATION_COLLECTION_PRODUCT_LIMIT = 10;
/** Accepted store-owned Footer menu; this slice intentionally has no env override. */
export const FOOTER_MENU_HANDLE = "footer";

export const NAVIGATION_QUERY = gql(`
  query ForwardNavigation(
    $menuHandle: String!
    $footerMenuHandle: String!
    $collectionFirst: Int!
    $collectionProductFirst: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    menu(handle: $menuHandle) {
      handle
      items {
        id
        title
        url
        items {
          id
          title
          url
          items {
            id
          }
        }
      }
    }
    footerMenu: menu(handle: $footerMenuHandle) {
      handle
      items {
        id
        title
        url
        items {
          id
          title
          url
          items {
            id
          }
        }
      }
    }
    collections(first: $collectionFirst) {
      pageInfo {
        hasNextPage
      }
      nodes {
        handle
        title
        products(first: $collectionProductFirst) {
          pageInfo {
            hasNextPage
          }
          nodes {
            handle
          }
        }
      }
    }
  }
`);
