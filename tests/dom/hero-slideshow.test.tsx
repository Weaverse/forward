/**
 * Hero slideshow: the pause control the 6 s autoplay needs (WCAG 2.2.2) and
 * slide images that load one slide ahead instead of all at once.
 */

import assert from "node:assert/strict";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it } from "vite-plus/test";

import HeroSlideshow from "@/sections/hero-slideshow";
import HeroSlide from "@/sections/hero-slideshow/slide";
import { renderWithCart } from "./harness";

function image(name: string) {
  return { src: `/${name}.jpg`, alt: name, width: 1600, height: 900 };
}

function renderSlideshow() {
  return renderWithCart(
    <HeroSlideshow>
      {["first", "second", "third", "fourth"].map((name) => (
        <HeroSlide key={name} image={image(name)} />
      ))}
    </HeroSlideshow>,
  );
}

function slideImages(): string[] {
  return screen
    .queryAllByRole("img", { hidden: true })
    .map((element) => element.getAttribute("alt") ?? "")
    .filter((alt) => ["first", "second", "third", "fourth"].includes(alt));
}

function activeFill(): Element {
  const current = screen.getByRole("button", { current: true });
  const fill = current.querySelector("span > span");
  assert.ok(fill, "the active slide has a progress fill");
  return fill;
}

describe("hero slideshow", () => {
  it("mounts each slide image one slide ahead of its turn", async () => {
    renderSlideshow();
    assert.deepEqual(slideImages(), ["first", "second"]);

    await userEvent.click(screen.getByRole("button", { name: /slide 2 of 4/ }));
    assert.deepEqual(slideImages(), ["first", "second", "third"]);
  });

  it("stops advancing while paused and resumes on play", async () => {
    renderSlideshow();
    const pause = screen.getByRole("button", { name: "Pause slideshow" });

    /* The control names what it will do next. */
    await userEvent.click(pause);
    assert.equal(pause.textContent, "Play slideshow");
    fireEvent.transitionEnd(activeFill());
    assert.equal(
      screen.getByRole("button", { current: true }).textContent,
      "01",
    );

    await userEvent.click(pause);
    assert.equal(pause.textContent, "Pause slideshow");
    fireEvent.transitionEnd(activeFill());
    assert.equal(
      screen.getByRole("button", { current: true }).textContent,
      "02",
    );
  });
});
