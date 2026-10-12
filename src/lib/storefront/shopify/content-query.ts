import { gql } from "@shopify/hydrogen";

/*
 * ponytail: one bounded read per list. A store past either bound fails the
 * content read (a truncated list would silently hide content); cursor paging
 * is the upgrade when a store outgrows it.
 */
export const CONTENT_PAGE_LIMIT = 100;
export const CONTENT_ARTICLE_LIMIT = 100;
export const CONTENT_BLOG_LIMIT = 100;

/**
 * Every page and article the store publishes, plus its policies.
 *
 * Blogs are read on their own, so a blog with no articles still exists.
 * Articles are read across all blogs, newest first, each with its blog: the
 * journal lists them all and a blog page is the ones that share a blog. Location and coordinates are optional `forward.*` article
 * metafields; a store that sets neither renders articles without them.
 */
export const CONTENT_QUERY = gql(`
  query ForwardContent(
    $pageFirst: Int!
    $articleFirst: Int!
    $blogFirst: Int!
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
    blogs(first: $blogFirst) {
      pageInfo {
        hasNextPage
      }
      nodes {
        handle
        title
      }
    }
    articles(first: $articleFirst, sortKey: PUBLISHED_AT, reverse: true) {
      pageInfo {
        hasNextPage
      }
      nodes {
        handle
        title
        blog {
          handle
          title
        }
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
