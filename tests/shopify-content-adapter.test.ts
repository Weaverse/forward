import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  parseArticleHtml,
  parsePageHtml,
  parsePolicyHtml,
} from "../src/lib/storefront/shopify/content-html-parser.ts";
import { mapContentResult } from "../src/lib/storefront/shopify/content-mapper.ts";
import { ShopifyCatalogDataSource } from "../src/lib/storefront/shopify/data-source.ts";
import { DEFAULT_MAIN_MENU_HANDLE } from "../src/lib/storefront/shopify/env.ts";
import { ShopifyCatalogError } from "../src/lib/storefront/shopify/errors.ts";
import {
  catalogResponse,
  UNREAD_EXECUTORS,
} from "./fixtures/shopify-catalog-response.ts";
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
    ...UNREAD_EXECUTORS,
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

  it("keeps unheaded page paragraphs as one untitled section", () => {
    assert.deepEqual(
      parsePageHtml(
        "<p>Intro.</p><p>Alpha.</p><p>Beta.</p>",
        undefined,
        "page",
      ),
      {
        intro: "Intro.",
        sections: [
          {
            heading: "",
            paragraphs: [[{ text: "Alpha." }], [{ text: "Beta." }]],
          },
        ],
      },
    );
    assert.deepEqual(parsePageHtml("  ", "Summary.", "page"), {
      intro: "Summary.",
      sections: [],
    });
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

  it("accepts a recovered character reference but no other recovery", () => {
    /* Merchant prose legitimately contains `&copy` without a semicolon.
     * Browsers and parse5 recover that to `©` as ordinary content, so it is
     * the one tokenizer diagnostic the parser tolerates. */
    assert.deepEqual(parseArticleHtml("<p>A &copy B</p>", "entity content"), [
      {
        type: "paragraph",
        text: "A © B",
        runs: [{ text: "A © B" }],
      },
    ]);

    assertRejectsHtml("<p>A &copy B<strong>unclosed</p>", "malformed HTML");
    assertRejectsHtml("<p>A &copy B<em/>still recovered</em></p>");
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
      "/apps/loyalty",
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
  it("maps every page, article and policy the store publishes", () => {
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
    /* Newest first; the plate counts from the oldest. */
    assert.equal(result.articles[0]?.plate, "No. 06");
    assert.equal(result.articles[5]?.plate, "No. 01");
    assert.equal(result.articles[0]?.body[0]?.type, "paragraph");
    assert.ok((result.articles[5]?.readingMinutes ?? 0) > 0);
    /* Nothing the store did not provide is invented. */
    assert.equal(result.articles[0]?.heroImage, null);
    assert.equal(result.articles[0]?.location, "");
    assert.equal(result.articles[0]?.coordinates, "");
    assert.equal(result.pages[0]?.eyebrow, "");
    assert.equal(result.pages[0]?.sections[0]?.heading, "");
    assert.equal(
      result.pages[4]?.sections[0]?.heading,
      "Face fabrics and membranes",
    );
    assert.equal(result.policies[0]?.summary, "");
    assert.equal(result.policies[0]?.updatedAt, undefined);
    assert.equal(
      result.policies[0]?.sections
        .flatMap((section) => section.paragraphs)
        .flat()
        .find((run) => run.text === "Contact")?.href,
      "/pages/contact",
    );
  });

  it("reads an article's image and forward.* metafields when the store sets them", () => {
    const result = mapContentResult(
      contentResponseWith((response) => {
        Object.assign(response.data.articles.nodes[0], {
          image: {
            url: "https://cdn.shopify.com/s/files/1/0978/4757/4828/articles/ridge.webp",
            width: 1600,
            height: 900,
            altText: null,
          },
          location: { value: "Cairngorms, Scotland" },
          coordinates: { value: "57.0776° N, 3.6710° W" },
        });
        Object.assign(response.data.articles.nodes[1], {
          image: {
            url: "https://images.example.com/foreign.webp",
            width: 1600,
            height: 900,
          },
        });
      }),
    );
    assert.deepEqual(result.articles[0]?.heroImage, {
      src: "https://cdn.shopify.com/s/files/1/0978/4757/4828/articles/ridge.webp",
      alt: "Layering for Moving Weather",
      width: 1600,
      height: 900,
    });
    assert.equal(result.articles[0]?.location, "Cairngorms, Scotland");
    assert.equal(result.articles[0]?.coordinates, "57.0776° N, 3.6710° W");
    assert.equal(result.articles[1]?.heroImage, null);
  });

  it("routes Shopify links in content onto theme routes", async () => {
    const response = contentResponseWith((draft) => {
      draft.data.pages.nodes[0].body = draft.data.pages.nodes[0].body.replace(
        "We revise the products we already make",
        '<a href="/collections/outerwear">Shop outerwear</a>',
      );
      const privacyPolicy = draft.data.shop.privacyPolicy as { body: string };
      privacyPolicy.body +=
        '<p><a href="/collections/outerwear">Shop outerwear</a></p>';
      const firstArticle = draft.data.articles.nodes[0];
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
        new URL("../src/sections/article-body/index.tsx", import.meta.url),
        "utf8",
      ),
      /<RichTextRuns runs=\{block\.runs\} \/>/,
    );

    /* A link the theme has no route for leaves its page out. */
    assert.equal(
      mapContentResult(
        contentResponseWith((draft) => {
          draft.data.pages.nodes[0].body +=
            '<p><a href="/apps/loyalty">Unknown</a></p>';
        }),
      ).pages.some((page) => page.handle === "about-forward"),
      false,
    );
  });

  it("leaves out an entry whose body the theme cannot render safely", () => {
    for (const [response, list, handle] of [
      [contentResponseWithLiquidPrivacy(), "policies", "privacy-policy"],
      [contentResponseWithScript(), "articles", "layering-for-moving-weather"],
      [contentResponseWithEventHandler(), "pages", "about-forward"],
      [contentResponseWithUnapprovedAttribute(), "pages", "about-forward"],
    ] as const) {
      const result = mapContentResult(response);
      assert.equal(
        result[list].some((entry) => entry.handle === handle),
        false,
        handle,
      );
      assert.ok(result[list].length > 0);
    }
  });

  it("rejects a truncated list rather than silently hiding content", async () => {
    await assertRejectsContent(
      contentResponseWith((response) => {
        response.data.articles.pageInfo.hasNextPage = true;
      }),
      "hasNextPage",
    );
    await assertRejectsContent(
      contentResponseWith((response) => {
        response.data.pages.pageInfo.hasNextPage = true;
      }),
      "hasNextPage",
    );
  });

  it("rejects duplicate handles", async () => {
    await assertRejectsContent(
      contentResponseWith((response) => {
        response.data.pages.nodes[1] = { ...response.data.pages.nodes[0] };
      }),
      "duplicate",
    );
  });

  it("rejects empty titles", async () => {
    await assertRejectsContent(
      contentResponseWith((response) => {
        response.data.pages.nodes[0].title = " ";
      }),
      "title",
    );
  });

  it("rejects invalid publication dates", async () => {
    await assertRejectsContent(
      contentResponseWith((response) => {
        response.data.articles.nodes[0].publishedAt = "not-a-date";
      }),
      "publishedAt",
    );
  });

  it("maps any page the store publishes and skips policies it has not written", () => {
    const result = mapContentResult(
      contentResponseWith((response) => {
        response.data.pages.nodes.push({
          handle: "careers",
          title: "Careers",
          bodySummary: "Join us.",
          body: "<p>Join us.</p>",
        });
        response.data.shop.termsOfService = null;
        response.data.articles.nodes = [];
      }),
    );
    assert.equal(result.pages.at(-1)?.handle, "careers");
    assert.equal(result.policies.length, 3);
    assert.deepEqual(result.articles, []);
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

  it("answers null for an entry left out as unrenderable", async () => {
    const source = shopifySource(contentResponseWithLiquidPrivacy());
    assert.equal(await source.getPolicy("privacy-policy"), null);
    assert.equal(
      (await source.getPolicy("shipping-policy"))?.title,
      "Shipping Policy",
    );
  });
});
