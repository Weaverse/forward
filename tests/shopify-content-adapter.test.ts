import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createStorefrontDataSource,
  StaticStorefrontDataSource,
} from "../src/lib/storefront/data-source.ts";
import { ShopifyCatalogDataSource } from "../src/lib/storefront/shopify/data-source.ts";
import { DEFAULT_MAIN_MENU_HANDLE } from "../src/lib/storefront/shopify/env.ts";
import { ShopifyCatalogError } from "../src/lib/storefront/shopify/errors.ts";
import { mapContentResult } from "../src/lib/storefront/shopify/content-mapper.ts";
import { catalogResponse } from "./fixtures/shopify-catalog-response.ts";
import {
  contentResponse,
  contentResponseWith,
  contentResponseWithEventHandler,
  contentResponseWithLiquidPrivacy,
  contentResponseWithScript,
  contentResponseWithUnapprovedAttribute,
} from "./fixtures/shopify-content-response.ts";
import { navigationResponse } from "./fixtures/shopify-navigation-response.ts";

const SYNTHETIC_STORE_DOMAIN = "forward-test-shop.myshopify.com";

function shopifySource(response = contentResponse()): ShopifyCatalogDataSource {
  return new ShopifyCatalogDataSource({
    base: new StaticStorefrontDataSource(),
    execute: async () => catalogResponse(),
    executeContent: async () => mapContentResult(response),
    executeNavigation: async () => navigationResponse(),
    storeDomain: SYNTHETIC_STORE_DOMAIN,
    mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
  });
}

async function assertRejectsContent(
  response = contentResponse(),
  messageIncludes?: string,
): Promise<void> {
  await assert.rejects(
    async () => mapContentResult(response),
    (error: unknown) => {
      assert.ok(error instanceof ShopifyCatalogError);
      if (messageIncludes !== undefined) {
        assert.ok(error.message.includes(messageIncludes), error.message);
      }
      return true;
    },
  );
}

describe("Shopify content mapper", () => {
  it("maps the approved content payload into normalized live content", () => {
    const result = mapContentResult(contentResponse());

    assert.deepEqual(
      result.articles.map((article) => article.handle),
      [
        "layering-for-moving-weather",
        "packing-thirty-liters-for-a-long-day",
        "reading-the-trail-underfoot",
        "how-we-test-a-shell-before-calling-it-weatherproof",
        "a-two-day-kit-built-around-nine-kilograms",
        "repair-notes-what-five-years-of-use-should-look-like",
      ],
    );
    assert.deepEqual(
      result.pages.map((page) => page.handle),
      [
        "about-forward",
        "field-repair",
        "shipping-returns",
        "contact",
        "materials-and-care",
        "fit-and-sizing",
        "field-testing",
      ],
    );
    assert.deepEqual(
      result.policies.map((policy) => policy.handle),
      [
        "privacy-policy",
        "refund-policy",
        "shipping-policy",
        "terms-of-service",
      ],
    );
    assert.equal(result.articles[0]?.plate, "No. 01");
    assert.equal(result.articles[0]?.body[0]?.type, "paragraph");
    assert.equal(result.articles[0]?.body[1]?.type, "paragraph");
    assert.equal(result.pages[0]?.eyebrow, "About Forward");
    assert.equal(result.pages[0]?.sections[0]?.heading, "The standard");
    assert.equal(result.pages[3]?.sections.length, 0);
    assert.equal(result.pages[4]?.eyebrow, "Materials & Care");
    assert.equal(
      result.pages[4]?.sections[0]?.heading,
      "Face fabrics and membranes",
    );
    assert.equal(result.articles[3]?.plate, "No. 04");
    assert.ok((result.articles[5]?.readingMinutes ?? 0) > 0);
    assert.ok(result.articles[5]?.heroImage.src.startsWith("/images/"));
    assert.equal(result.policies[0]?.updatedAt, undefined);
    assert.equal(
      result.policies[0]?.sections
        .flatMap((section) => section.paragraphs)
        .flat()
        .find((run) => run.text === "Contact")?.href,
      "/pages/contact",
    );
  });

  it("rejects Liquid in the privacy policy body", async () => {
    await assertRejectsContent(contentResponseWithLiquidPrivacy(), "Liquid");
  });

  it("rejects script tags", async () => {
    await assertRejectsContent(contentResponseWithScript(), "<script");
  });

  it("rejects event handler attributes", async () => {
    await assertRejectsContent(
      contentResponseWithEventHandler(),
      "event handler",
    );
  });

  it("rejects every unapproved HTML attribute", async () => {
    await assertRejectsContent(
      contentResponseWithUnapprovedAttribute(),
      "attribute",
    );
  });

  it("rejects a wrong aliased page identity", async () => {
    await assertRejectsContent(
      contentResponseWith((response) => {
        response.data.contact = {
          handle: "data-sharing-opt-out",
          title: "Data sharing opt out",
          bodySummary: "Excluded.",
          body: "<p>Excluded.</p>",
        };
      }),
      "data-sharing-opt-out",
    );
  });

  it("rejects article pagination beyond configured bounds", async () => {
    await assertRejectsContent(
      contentResponseWith((response) => {
        if (response.data.blog !== null) {
          response.data.blog.articles.pageInfo.hasNextPage = true;
        }
      }),
      "hasNextPage",
    );
  });

  it("rejects duplicate handles", async () => {
    await assertRejectsContent(
      contentResponseWith((response) => {
        response.data.fieldRepair = { ...response.data.aboutForward };
      }),
      "duplicate",
    );
  });

  it("rejects a missing required article handle", async () => {
    await assertRejectsContent(
      contentResponseWith((response) => {
        response.data.blog?.articles.nodes.pop();
      }),
      "repair-notes-what-five-years-of-use-should-look-like",
    );
  });

  it("rejects a missing blog", async () => {
    await assertRejectsContent(
      contentResponseWith((response) => {
        response.data.blog = null;
      }),
      "blog",
    );
  });

  it("rejects empty titles", async () => {
    await assertRejectsContent(
      contentResponseWith((response) => {
        response.data.aboutForward.title = " ";
      }),
      "title",
    );
  });

  it("rejects invalid publication dates", async () => {
    await assertRejectsContent(
      contentResponseWith((response) => {
        if (response.data.blog !== null) {
          response.data.blog.articles.nodes[0].publishedAt = "not-a-date";
        }
      }),
      "publishedAt",
    );
  });

  it("rejects unknown approved-domain page handles", async () => {
    await assertRejectsContent(
      contentResponseWith((response) => {
        response.data.contact = {
          handle: "careers",
          title: "Careers",
          bodySummary: "Unknown.",
          body: "<p>Unknown.</p>",
        };
      }),
      "careers",
    );
  });
});

describe("Shopify content data source", () => {
  it("serves live articles, pages, and policies in Shopify mode", async () => {
    const source = shopifySource();

    const [articles, article, pages, page, policies, policy] =
      await Promise.all([
        source.listArticles(),
        source.getArticle("layering-for-moving-weather"),
        source.listPages(),
        source.getPage("about-forward"),
        source.listPolicies(),
        source.getPolicy("shipping-policy"),
      ]);

    assert.equal(articles.length, 6);
    assert.equal(article?.title, "Layering for Moving Weather");
    assert.equal(pages.length, 7);
    assert.equal(page?.title, "About Forward");
    assert.equal(policies.length, 4);
    assert.equal(policy?.title, "Shipping Policy");
  });

  it("returns null for unknown content handles", async () => {
    const source = shopifySource();

    assert.equal(await source.getArticle("does-not-exist"), null);
    assert.equal(await source.getPage("does-not-exist"), null);
    assert.equal(await source.getPolicy("does-not-exist"), null);
  });

  it("rejects the whole content bundle before reuse when any policy is invalid", async () => {
    const source = shopifySource(contentResponseWithLiquidPrivacy());
    await assert.rejects(
      () => source.getPage("about-forward"),
      ShopifyCatalogError,
    );
    await assert.rejects(
      () => source.getPolicy("shipping-policy"),
      ShopifyCatalogError,
    );
  });

  it("leaves static mode unaffected", async () => {
    const source = createStorefrontDataSource({});

    assert.ok(source instanceof StaticStorefrontDataSource);
    assert.equal(
      (await source.getArticle("layering-for-moving-weather"))?.title,
      "Layering for Moving Weather",
    );
    assert.equal((await source.getPage("field-repair"))?.title, "Field Repair");
    assert.equal(
      (await source.getPolicy("shipping-policy"))?.updatedAt,
      "2026-07-01",
    );
  });
});
