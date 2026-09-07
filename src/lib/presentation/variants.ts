import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";

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
