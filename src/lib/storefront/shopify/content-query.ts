import { gql } from "@shopify/hydrogen";

export const CONTENT_PAGE_HANDLES = [
  "about-forward",
  "field-repair",
  "shipping-returns",
  "contact",
] as const;

export const CONTENT_BLOG_HANDLE = "field-notes" as const;

export const CONTENT_ARTICLE_HANDLES = [
  "layering-for-moving-weather",
  "packing-thirty-liters-for-a-long-day",
  "reading-the-trail-underfoot",
] as const;

export const CONTENT_POLICY_HANDLES = [
  "privacy-policy",
  "refund-policy",
  "shipping-policy",
  "terms-of-service",
] as const;

export const CONTENT_ARTICLE_LIMIT = 10;

const PAGE_FIELDS = `
  handle
  title
  bodySummary
  body
`;

export const CONTENT_QUERY = gql(`
  query ForwardContent(
    $articleFirst: Int!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    aboutForward: page(handle: "about-forward") {
      ${PAGE_FIELDS}
    }
    fieldRepair: page(handle: "field-repair") {
      ${PAGE_FIELDS}
    }
    shippingReturns: page(handle: "shipping-returns") {
      ${PAGE_FIELDS}
    }
    contact: page(handle: "contact") {
      ${PAGE_FIELDS}
    }
    blog(handle: $blogHandle) {
      handle
      articles(first: $articleFirst) {
        pageInfo {
          hasNextPage
        }
        nodes {
          handle
          title
          excerpt
          contentHtml
          publishedAt
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
