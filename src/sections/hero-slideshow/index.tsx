"use client";

import {
  Children,
  isValidElement,
  type ReactNode,
  useEffect,
  useState,
} from "react";

import { parseRows } from "../parse";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";
import { SlideshowContext } from "./context";

const SLIDE_INTERVAL_MS = 6000;
/** How long the outgoing copy fades before the next slide's copy mounts. */
const TEXT_OUT_MS = 300;

interface HeroSlideshowProps extends WeaverseElementProps {
  children?: ReactNode;
  /** One `value | label` pair per line. Parsed by `../parse`. */
  stats?: string;
}

/**
 * Full-bleed hero slideshow.
 *
 * Each `hero-slide` child paints its own image, copy, field tag and featured
 * badge; this shell owns the timing. Images crossfade as soon as `active`
 * moves, while the copy waits `TEXT_OUT_MS` for the old slide to fade out
 * before `shown` follows, so the two layers never swap on the same frame.
 *
 * The active progress fill is the autoplay timer: it grows through a
 * `@starting-style` transition and its `transitionend` advances the slide, so
 * bar and slide cannot drift. Under reduced motion the fill has no transition,
 * so nothing advances on its own.
 */
function HeroSlideshow({ children, stats, ...rest }: HeroSlideshowProps) {
  const slides = Children.toArray(children).filter(isValidElement);
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const rows = parseRows(stats, 2);

  useEffect(() => {
    if (active === shown) return;
    const id = setTimeout(() => setShown(active), TEXT_OUT_MS);
    return () => clearTimeout(id);
  }, [active, shown]);

  return (
    <section
      {...elementAttributes(rest)}
      className="relative isolate grid min-h-[calc(100svh_-_var(--spacing-header-compact)_-_var(--spacing-announcement))] grid-rows-[1fr_auto] overflow-hidden bg-ink text-text-inverse md:min-h-[calc(100svh_-_var(--spacing-header)_-_var(--spacing-announcement))]"
    >
      <div
        aria-hidden
        className="-z-5 absolute inset-0 bg-[linear-gradient(0deg,rgb(17_19_15/0.95)_0%,rgb(17_19_15/0.7)_55%,rgb(17_19_15/0.15)_100%)] md:bg-[linear-gradient(90deg,rgb(17_19_15/0.9)_0%,rgb(17_19_15/0.55)_42%,rgb(17_19_15/0)_72%),linear-gradient(0deg,rgb(17_19_15/0.85)_0%,rgb(17_19_15/0)_45%)]"
      />
      {/* Every slide sits in the same cell, so the hero keeps the tallest
       * slide's height and never jumps between slides. */}
      <div className="grid">
        {slides.map((slide, index) => (
          <SlideshowContext.Provider
            key={slide.key}
            value={{ index, active, shown }}
          >
            {slide}
          </SlideshowContext.Provider>
        ))}
      </div>
      {/* The right edge is reserved for the active slide's featured badge,
       * which the slide positions over this bar. */}
      <div className="grid grid-cols-1 border-text-inverse/15 border-t bg-ink/45 pb-22 backdrop-blur-md md:min-h-28 md:grid-cols-[minmax(0,1fr)_auto] md:pr-80 md:pb-0">
        <dl className="grid max-w-3xl grid-cols-3 content-center gap-6 px-page-gutter py-5">
          {rows.map(([value, label]) => (
            <div className="grid gap-1.5" key={label}>
              <dt className="m-0 font-field-meta text-micro text-text-dark-meta uppercase">
                {label}
              </dt>
              <dd className="m-0 font-heading text-heading-4">{value}</dd>
            </div>
          ))}
        </dl>
        {slides.length > 1 ? (
          <fieldset className="m-0 flex min-w-0 items-center gap-5 border-0 px-page-gutter pt-0 pb-6 md:pt-6">
            <legend className="sr-only">Hero slides</legend>
            {slides.map((slide, index) => (
              <button
                key={slide.key}
                type="button"
                aria-label={`Show slide ${index + 1} of ${slides.length}`}
                aria-current={index === active}
                onClick={() => setActive(index)}
                className="grid min-h-touch cursor-pointer content-center gap-2 font-field-meta text-micro text-text-dark-meta uppercase transition-colors hover:text-text-inverse aria-current:text-text-inverse"
              >
                {String(index + 1).padStart(2, "0")}
                <span className="relative block h-0.5 w-14 overflow-hidden bg-text-inverse/25">
                  {index === active ? (
                    <span
                      onTransitionEnd={() =>
                        setActive((active + 1) % slides.length)
                      }
                      style={{ transitionDuration: `${SLIDE_INTERVAL_MS}ms` }}
                      className="absolute inset-0 origin-left scale-x-100 bg-signal transition-[scale] ease-linear starting:scale-x-0 motion-reduce:transition-none"
                    />
                  ) : null}
                </span>
              </button>
            ))}
          </fieldset>
        ) : null}
      </div>
    </section>
  );
}

export default HeroSlideshow;

export { schema } from "./schema";
