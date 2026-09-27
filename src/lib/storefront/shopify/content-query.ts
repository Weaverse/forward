import { gql } from "@shopify/hydrogen";

/*
 * ponytail: one bounded read per list. A store past either bound fails the
 * content read (a truncated list would silently hide content); cursor paging
 * is the upgrade when a store outgrows it.
 */
export const CONTENT_PAGE_LIMIT = 100;
export const CONTENT_ARTICLE_LIMIT = 100;

/**
 * Every page and article the store publishes, plus its policies.
 *
 * The theme has one journal, so articles are read across all blogs, newest
 * first. Location and coordinates are optional `forward.*` article
 * metafields; a store that sets neither renders articles without them.
 */
export const CONTENT_QUERY = gql(`
  query ForwardContent(
    $pageFirst: Int!
    $articleFirst: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    pages(first: $pageFirst) {
      pageInfo {
        hasNextPage
      }
      nodes {
        handle
        title
        bodySummary
        body
      }
    }
    articles(first: $articleFirst, sortKey: PUBLISHED_AT, reverse: true) {
      pageInfo {
        hasNextPage
      }
      nodes {
        handle
        title
        excerpt
        contentHtml
        publishedAt
        image {
          url
          width
          height
          altText
        }
        location: metafield(namespace: "forward", key: "location") {
          value
        }
        coordinates: metafield(namespace: "forward", key: "coordinates") {
          value
        }
      }
    }
    shop {
      privacyPolicy {
        handle
        title
        body
      }
      refundPolicy {
        handle
        title
        body
      }
      shippingPolicy {
        handle
        title
        body
      }
      termsOfService {
        handle
        title
        body
      }
    }
  }
`);
