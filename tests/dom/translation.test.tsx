import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import { act, render, screen } from "@testing-library/react";
import { TranslationProvider, TranslationStore } from "@weaverse/next";

import { SortForm } from "@/components/sort-form";
import { STATIC_CONTENT } from "@/lib/i18n/static-content";
import { T } from "@/lib/i18n/t";
import { renderWithCart } from "./harness";

describe("theme copy", () => {
  it("renders the English default, then the market's published override", () => {
    const { unmount } = renderWithCart(
      <p data-testid="copy">
        <T k="footer.tagline" />|<T k="announcement.text" />
      </p>,
    );
    assert.equal(screen.getByTestId("copy").textContent, "|");
    unmount();

    renderWithCart(
      <p data-testid="copy">
        <T k="announcement.text" />
      </p>,
      undefined,
      "de-de",
      { announcement: { text: "Kostenloser Versand" } },
    );
    assert.equal(screen.getByTestId("copy").textContent, "Kostenloser Versand");
  });

  it("follows Studio's live edits and keeps an empty one", () => {
    const store = new TranslationStore();
    render(
      <TranslationProvider
        merchantOverrides={{ announcement: { text: "Published" } }}
        staticContent={STATIC_CONTENT}
        translationStore={store}
      >
        <p data-testid="copy">
          <T k="announcement.text" />
        </p>
      </TranslationProvider>,
    );
    const copy = screen.getByTestId("copy");
    assert.equal(copy.textContent, "Published");

    act(() => store.updateOverrides({ "announcement.text": "Live edit" }));
    assert.equal(copy.textContent, "Live edit");

    act(() => store.updateOverrides({ "announcement.text": "" }));
    assert.equal(copy.textContent, "");
  });

  it("ignores inherited keys in a published payload", () => {
    renderWithCart(
      <p data-testid="copy">
        <T k="announcement.text" />
      </p>,
      undefined,
      "de-de",
      JSON.parse('{"__proto__": {"announcement": {"text": "polluted"}}}'),
    );
    assert.equal(screen.getByTestId("copy").textContent, "");
  });

  it("labels the theme's sort options in the market's language", () => {
    renderWithCart(
      <SortForm
        id="sort"
        params={new URLSearchParams()}
        pathname="/shop"
        sort="name"
      />,
      undefined,
      "de-de",
      {
        catalog: { sort: "Sortieren", sortOptions: { name: "Name A–Z (DE)" } },
      },
    );
    assert.ok(screen.getByLabelText("Sortieren"));
    assert.ok(screen.getByRole("option", { name: "Name A–Z (DE)" }));
    assert.ok(screen.getByRole("option", { name: "Featured" }));
  });
});
