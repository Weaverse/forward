import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";

/** Lede paragraph beneath a section heading. */
export const LEDE_CLASS =
  "mb-prose-paragraph max-w-lede text-lede leading-lede text-text-muted";

/** Page-width section shell: centered, guttered, vertically blocked. */
export const SHELL_SECTION_CLASS =
  "mx-auto w-full max-w-page px-page-gutter py-section-block";

/** Opt a section into the viewport-height media sizing used on Home. */
export const VIEWPORT_SECTION_CLASS =
  "md-up:[--home-viewport-pad:clamp(48px,5vw,96px)] md-up:[--home-viewport-media:calc(100svh_-_2_*_var(--home-viewport-pad))] md-up:py-(--home-viewport-pad) short-desktop:[--home-viewport-pad:clamp(8px,2svh,16px)]";

/**
 * The transition every button-like control animates with. It has no scalar
 * theme namespace, so one exported constant keeps it authored once instead of
 * repeated per intent and per owner.
 */
export const CONTROL_TRANSITION =
  "[transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)]";

export const eyebrow = cva(
  "mb-3.5 font-field-meta text-ui leading-meta font-medium",
  {
    variants: {
      tone: {
        strong: "text-signal-strong tracking-field-meta uppercase",
        signal: "text-signal tracking-field-meta uppercase",
        warm: "text-accent-warm tracking-field-meta uppercase",
      },
    },
    defaultVariants: { tone: "strong" },
  },
);

export const sectionHeading = cva("", {
  variants: {
    size: {
      display:
        "m-0 text-balance font-heading text-display leading-display font-medium tracking-heading",
      section:
        "m-0 text-balance font-heading text-heading-2 leading-heading font-medium tracking-heading",
      subsection:
        "m-0 text-balance font-heading text-heading-3 leading-subheading font-medium tracking-heading",
      subsectionSpaced:
        "mb-4.5 text-balance font-heading text-heading-3 leading-subheading font-medium tracking-heading",
      /* The display scales the page mastheads use. Each one existed only as a
       * class string inside its section, which is why the shared `heading`
       * element could not express a hero and those sections stayed flat. */
      hero: "m-0 text-balance font-heading text-home-hero leading-home-hero font-medium tracking-home-hero max-md:text-home-hero-mobile",
      heroWide:
        "m-0 text-balance font-heading text-display-wide leading-display-tightest tracking-display-tight max-md:text-display-mobile",
      page: "m-0 text-balance font-heading text-page-display leading-heading font-medium tracking-heading max-md:text-page-display-mobile",
      collection:
        "m-0 text-balance font-heading text-collection-display leading-heading font-medium tracking-heading max-md:text-page-display-mobile",
      article:
        "m-0 text-balance font-heading text-article-display leading-heading font-medium tracking-heading",
      statement:
        "m-0 text-balance font-heading text-about-statement leading-display-relaxed",
      feature:
        "m-0 text-balance font-heading text-home-display leading-display-relaxed",
    },
  },
  defaultVariants: { size: "section" },
});

export const cta = cva(
  cn(
    "inline-flex min-h-12 items-center justify-center gap-2.5 border",
    CONTROL_TRANSITION,
  ),
  {
    variants: {
      intent: {
        primary:
          "border-ink bg-ink px-5.5 py-3 font-body text-ui font-bold text-text-inverse tracking-button uppercase shadow-button-signal hover:translate-0.5 hover:shadow-button-signal-hover active:translate-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-signal focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0",
        signal:
          "border-signal bg-signal px-5.5 py-3 font-body text-ui font-bold text-ink tracking-button uppercase shadow-button hover:translate-0.5 hover:border-ink hover:bg-ink hover:text-signal hover:shadow-button-hover active:translate-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-ink focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0",
        light:
          "border-text-inverse bg-transparent px-5.5 py-3 font-body text-ui font-bold text-text-inverse tracking-button uppercase shadow-button-inverse hover:translate-0.5 hover:bg-text-inverse hover:text-ink hover:shadow-button-inverse-hover active:translate-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-text-inverse focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0",
        outline:
          "border-ink bg-transparent px-5.5 py-3 font-body text-ui font-bold text-ink tracking-button uppercase shadow-button hover:translate-0.5 hover:bg-ink hover:text-text-inverse hover:shadow-button-hover active:translate-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-ink focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0",
      },
    },
    defaultVariants: { intent: "primary" },
  },
);

export const textLink = cva(
  "inline-flex min-h-touch items-center gap-3.5 border-ink border-b font-body text-ui font-medium tracking-link uppercase after:text-control-lg after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-1.25",
  {
    variants: { kind: { link: "", control: "bg-transparent" } },
    defaultVariants: { kind: "link" },
  },
);

export const emptyState = cva("grid", {
  variants: {
    size: {
      page: "min-h-state-min place-items-center bg-surface-subtle px-page-gutter py-[clamp(60px,10vw,140px)] text-center",
      panel:
        "min-h-85 place-items-center border border-ink bg-surface-subtle px-5 py-15 text-center",
    },
  },
  defaultVariants: { size: "panel" },
});
