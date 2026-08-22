import assert from "node:assert/strict";
import { describe, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ErrorPage from "@/app/error";
import Loading from "@/app/loading";

describe("system states", () => {
  it("announces the loading boundary", () => {
    render(<Loading />);

    assert.equal(
      screen.getByRole("status").textContent?.trim(),
      "Forward field report / Loading…",
    );
  });

  it("announces an error and retries through the supplied boundary reset", async () => {
    let resets = 0;
    const reset = () => {
      resets += 1;
    };
    const user = userEvent.setup();
    render(
      <ErrorPage
        error={Object.assign(new Error(), { digest: "ref-2f" })}
        reset={reset}
      />,
    );

    assert.ok(screen.getByRole("alert"));
    assert.ok(
      screen.getByRole("heading", { level: 1, name: "Weather moved in." }),
    );
    assert.match(screen.getByRole("alert").textContent ?? "", /ref-2f/);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    assert.equal(resets, 1);
  });
});
