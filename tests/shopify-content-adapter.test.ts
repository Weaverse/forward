import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createStorefrontDataSource,
  StaticStorefrontDataSource,
} from "../src/lib/storefront/data-source.ts";
import { ShopifyCatalogDataSource } from "../src/lib/storefront/shopify/data-source.ts";
import { DEFAULT_MAIN_MENU_HANDLE } from "../src/lib/storefront/shopify/env.ts";
import { ShopifyCatalogError } from "../src/lib/storefront/shopify/errors.ts";
import {
  parseArticleHtml,
  parsePageHtml,
  parsePolicyHtml,
} from "../src/lib/storefront/shopify/content-html-parser.ts";
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

function assertRejectsHtml(html: string, messageIncludes?: string): void {
  assert.throws(
    () => parseArticleHtml(html, "adversarial content"),
    (error: unknown) => {
      assert.ok(error instanceof ShopifyCatalogError);
      if (messageIncludes !== undefined) {
        assert.ok(error.message.includes(messageIncludes), error.message);
      }
      return true;
    },
  );
}

describe("Shopify content structural HTML parser", () => {
  it("extracts exact nested heading, paragraph, pullquote, list, entity, and link runs", () => {
    assert.deepEqual(
      parseArticleHtml(
        [
          "<h2>Trail &amp; weather</h2>",
          '<p>Move <strong>light&nbsp;and <em>fast</em></strong> to <a href="/collections/outerwear">outer &amp; <u>shells</u></a>.</p>',
          '<blockquote><p>Stay <a href="https://example.com/guide">ready</a>.</p></blockquote>',
          "<ul><li>One &lt; two</li><li>Three<br>four</li></ul>",
        ].join(""),
        "nested content",
      ),
      [
        {
          type: "heading",
          text: "Trail & weather",
          runs: [{ text: "Trail & weather" }],
        },
        {
          type: "paragraph",
          text: "Move light and fast to outer & shells.",
          runs: [
            { text: "Move light and fast to " },
            { text: "outer & shells", href: "/shop/outerwear" },
            { text: "." },
          ],
        },
        {
          type: "pullquote",
          text: "Stay ready.",
          runs: [
            { text: "Stay " },
            { text: "ready", href: "https://example.com/guide" },
            { text: "." },
          ],
        },
        {
          type: "paragraph",
          text: "One < two",
          runs: [{ text: "One < two" }],
        },
        {
          type: "paragraph",
          text: "Three four",
          runs: [{ text: "Three four" }],
        },
      ],
    );
  });

  it("preserves exact page and policy section extraction", () => {
    assert.deepEqual(
      parsePageHtml(
        "<p>Intro.</p><h2>First</h2><p>Alpha.</p><h3>Second</h3><p>Beta.</p>",
        undefined,
        "page content",
        [],
      ),
      {
        intro: "Intro.",
        sections: [
          { heading: "First", paragraphs: [[{ text: "Alpha." }]] },
          { heading: "Second", paragraphs: [[{ text: "Beta." }]] },
        ],
      },
    );
    assert.deepEqual(
      parsePolicyHtml(
        "<p>Before.</p><h2>Terms</h2><p>After.</p>",
        "Fallback",
        "policy content",
      ),
      [
        { heading: "Fallback", paragraphs: [[{ text: "Before." }]] },
        { heading: "Terms", paragraphs: [[{ text: "After." }]] },
      ],
    );
  });

  it("allows every canonical internal route and quoted href style", () => {
    const hrefs = [
      "/",
      "/shop/outerwear",
      "/products/alpine-shell",
      "/journal/field-note",
      "/pages/contact",
      "/policies/privacy-policy",
      "/account/orders",
    ];
    const blocks = parseArticleHtml(
      `<p>${hrefs
        .map((href, index) =>
          index === 0
            ? `<a href='${href}'>${index}</a>`
            : `<a href="${href}">${index}</a>`,
        )
        .join(" ")}</p>`,
      "internal links",
    );
    const paragraph = blocks[0];
    assert.ok(paragraph?.type === "paragraph");
    assert.deepEqual(
      paragraph.runs.filter((run) => run.href).map((run) => run.href),
      hrefs,
    );
  });

  it("ignores comments without letting them disguise markup", () => {
    assert.deepEqual(
      parseArticleHtml(
        "<p>Safe<!-- <script>ignored()</script> --> text.</p>",
        "comment content",
      ),
      [
        {
          type: "paragraph",
          text: "Safe text.",
          runs: [{ text: "Safe text." }],
        },
      ],
    );
    assertRejectsHtml("<scr<!--hidden-->ipt>alert(1)</scr<!--hidden-->ipt>");
    assertRejectsHtml('<a hr<!--hidden-->ef="/shop">Shop</a>');
  });

  it("rejects browser-recovered malformed structures even without parse errors", () => {
    for (const html of [
      "<p><strong>unclosed</p>",
      "<p><div>implicitly closed</div></p>",
      "<p><b>wrong close</i></p>",
      "<p>orphan close</p></unknown>",
      "<br></br>",
    ]) {
      assertRejectsHtml(html, "malformed HTML");
    }
  });

  it("rejects empty, unreadable, malformed, and Liquid content", () => {
    for (const html of [
      "",
      "   ",
      "<!-- only a comment -->",
      "<",
      "<p>{% render 'x' %}</p>",
    ]) {
      assertRejectsHtml(html);
    }
  });

  it("rejects every embedded or unknown tag regardless of case", () => {
    for (const tag of [
      "ScRiPt",
      "STYLE",
      "Form",
      "IFRAME",
      "embed",
      "OBJECT",
      "SvG",
      "custom-element",
    ]) {
      assertRejectsHtml(`<p>before</p><${tag}>payload</${tag}>`);
    }
  });

  it("rejects event, duplicate, unquoted, missing, and unsupported attributes", () => {
    for (const html of [
      '<p oNcLiCk="run()">text</p>',
      '<a o&#x6e;click="run()" href="/shop">text</a>',
      '<a href="/shop" href="/pages/contact">text</a>',
      "<a href=/shop>text</a>",
      "<a>text</a>",
      '<a href="/shop" title="shop">text</a>',
      '<p class="copy">text</p>',
    ]) {
      assertRejectsHtml(html);
    }
  });

  it("rejects unsafe, encoded, credentialed, and non-canonical link targets", () => {
    for (const href of [
      "//example.com/path",
      "\\\\example.com\\path",
      "javascript:alert(1)",
      "jav&#x61;script:alert(1)",
      "data:text/html,payload",
      "http://example.com/path",
      "https://user:secret@example.com/path",
      "/collections/not-forward",
    ]) {
      assertRejectsHtml(`<p><a href="${href}">target</a></p>`);
    }
  });

  it("never includes raw merchant HTML or credentials in parser errors", () => {
    const secret = "merchant-secret-password";
    assert.throws(
      () =>
        parseArticleHtml(
          `<iframe src="https://user:${secret}@example.com">${secret}</iframe>`,
          "article content",
        ),
      (error: unknown) => {
        assert.ok(error instanceof ShopifyCatalogError);
        assert.equal(error.message.includes(secret), false);
        assert.equal(error.message.includes("iframe src"), false);
        return true;
      },
    );
  });
});

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

  it("normalizes only canonical Shopify collection links to theme routes", async () => {
    const response = contentResponseWith((draft) => {
      draft.data.aboutForward.body = draft.data.aboutForward.body.replace(
        "We revise the products we already make",
        '<a href="/collections/outerwear">Shop outerwear</a>',
      );
      const privacyPolicy = draft.data.shop.privacyPolicy as { body: string };
      privacyPolicy.body +=
        '<p><a href="/collections/outerwear">Shop outerwear</a></p>';
      const firstArticle = draft.data.blog?.articles.nodes[0];
      firstArticle.contentHtml = firstArticle.contentHtml.replace(
        "Begin the climb slightly cool",
        '<a href="/collections/outerwear">Layer outerwear</a>',
      );
    });
    const result = mapContentResult(response);
    assert.equal(
      result.pages
        .find((page) => page.handle === "about-forward")
        ?.sections.flatMap((section) => section.paragraphs)
        .flat()
        .find((run) => run.text === "Shop outerwear")?.href,
      "/shop/outerwear",
    );
    assert.equal(
      result.policies[0]?.sections
        .flatMap((section) => section.paragraphs)
        .flat()
        .find((run) => run.text === "Shop outerwear")?.href,
      "/shop/outerwear",
    );
    const articleRun = result.articles[0]?.body
      .flatMap((block) =>
        block.type === "paragraph" ||
        block.type === "heading" ||
        block.type === "pullquote"
          ? block.runs
          : [],
      )
      .find((run) => run.text === "Layer outerwear");
    assert.equal(articleRun?.href, "/shop/outerwear");
    assert.match(
      readFileSync(
        new URL("../src/app/journal/[articleHandle]/page.tsx", import.meta.url),
        "utf8",
      ),
      /<RichTextRuns runs=\{block\.runs\} \/>/,
    );

    await assertRejectsContent(
      contentResponseWith((draft) => {
        draft.data.aboutForward.body +=
          '<p><a href="/collections/not-forward">Unknown</a></p>';
      }),
      "non-canonical link target",
    );
  });

  it("rejects Liquid in the privacy policy body", async () => {
    await assertRejectsContent(contentResponseWithLiquidPrivacy(), "Liquid");
  });

  it("rejects script tags", async () => {
    await assertRejectsContent(
      contentResponseWithScript(),
      "unsupported markup",
    );
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
