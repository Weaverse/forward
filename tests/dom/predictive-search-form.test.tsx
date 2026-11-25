/**
 * Search combobox behavior against Hydrogen's predictive search store, with
 * the endpoint answered by a stubbed `fetch` the test settles by hand.
 */

import assert from "node:assert/strict";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, it, vi } from "vite-plus/test";

import { PredictiveSearchForm } from "@/components/predictive-search-form";
import { shell } from "./harness";

const UNAVAILABLE = "Suggestions are unavailable. Press Enter to search.";

function suggestions(term: string) {
  return {
    term,
    total: 1,
    items: {
      products: [],
      collections: [],
      pages: [],
      articles: [],
      queries: [
        {
          __typename: "SearchQuerySuggestion",
          text: `${term} jacket`,
          styledText: "",
          trackingParameters: null,
        },
      ],
    },
  };
}

/** Each request waits until the test answers it, in order. */
let pending: ((response: Response) => void)[] = [];

function respond(response: Response) {
  const next = pending.shift();
  assert.ok(next, "no pending predictive search request");
  next(response);
}

async function waitForRequest() {
  await waitFor(() => assert.ok(pending.length > 0));
}

function setup() {
  const submits: string[] = [];
  render(shell(<PredictiveSearchForm defaultQuery="" />));
  const input = screen.getByRole("combobox");
  input.closest("form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    submits.push(
      String(new FormData(event.target as HTMLFormElement).get("q")),
    );
  });
  return { input, submits, user: userEvent.setup() };
}

describe("predictive search form", () => {
  beforeEach(() => {
    pending = [];
    vi.stubGlobal(
      "fetch",
      () => new Promise<Response>((resolve) => pending.push(resolve)),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("drops the active option when results arrive, so Enter submits the search", async () => {
    const { input, submits, user } = setup();
    await user.type(input, "shel");
    await user.keyboard("{ArrowDown}");
    assert.match(
      document.getElementById(input.getAttribute("aria-activedescendant") ?? "")
        ?.textContent ?? "",
      /View all results/,
    );

    await waitForRequest();
    respond(Response.json(suggestions("shel")));
    await screen.findByRole("option", { name: "shel jacket" });
    assert.equal(input.getAttribute("aria-activedescendant"), null);

    await user.keyboard("{Enter}");
    assert.deepEqual(submits, ["shel"]);

    await user.keyboard("{ArrowDown}");
    assert.equal(
      document.getElementById(input.getAttribute("aria-activedescendant") ?? "")
        ?.textContent,
      "shel jacket",
    );
  });

  it("leaves arrow keys and Enter to the IME while it composes", async () => {
    const { input, user } = setup();
    await user.type(input, "shel");
    await waitForRequest();
    respond(Response.json(suggestions("shel")));
    await screen.findByRole("option", { name: "shel jacket" });

    assert.equal(
      fireEvent.keyDown(input, { key: "ArrowDown", isComposing: true }),
      true,
    );
    assert.equal(
      fireEvent.keyDown(input, { key: "ArrowDown", keyCode: 229 }),
      true,
    );
    assert.equal(input.getAttribute("aria-activedescendant"), null);

    await user.keyboard("{ArrowDown}");
    assert.notEqual(input.getAttribute("aria-activedescendant"), null);
    assert.equal(
      fireEvent.keyDown(input, { key: "Enter", isComposing: true }),
      true,
    );
  });

  it("says suggestions are unavailable on a failed first request", async () => {
    const { input, submits, user } = setup();
    await user.type(input, "shel");
    await waitForRequest();
    respond(new Response(null, { status: 500 }));

    await screen.findAllByText(UNAVAILABLE);
    assert.equal(screen.queryByText(/No quick matches/), null);
    assert.equal(screen.getAllByRole("option").length, 1);

    await user.keyboard("{Enter}");
    assert.deepEqual(submits, ["shel"]);
  });

  it("hides results from an older term while loading and after a failure", async () => {
    const { input, user } = setup();
    await user.type(input, "shel");
    await waitForRequest();
    respond(Response.json(suggestions("shel")));
    await screen.findByRole("option", { name: "shel jacket" });

    await user.type(input, "l");
    assert.equal(screen.queryByRole("option", { name: "shel jacket" }), null);

    await waitForRequest();
    respond(new Response(null, { status: 503 }));
    await screen.findAllByText(UNAVAILABLE);
    assert.deepEqual(
      screen.getAllByRole("option").map((option) => option.textContent),
      ["View all results for “shell”"],
    );
  });
});
