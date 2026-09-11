import { cva } from "class-variance-authority";

/** Lede paragraph beneath a section heading. */
export const LEDE_CLASS =
	"mb-prose-paragraph max-w-lede text-lede leading-lede text-text-muted";

/** Page-width section shell: centered, guttered, vertically blocked. */
export const SHELL_SECTION_CLASS =
	"mx-auto w-full max-w-page px-page-gutter py-section-block";

/** Opt a section into the viewport-height media sizing used on Home. */
export const VIEWPORT_SECTION_CLASS =
	"md-up:[--home-viewport-pad:clamp(48px,5vw,96px)] md-up:[--home-viewport-media:calc(100svh_-_2_*_var(--home-viewport-pad))] md-up:py-(--home-viewport-pad) short-desktop:[--home-viewport-pad:clamp(8px,2svh,16px)]";

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

/**
 * The solid call to action. One fill, one axis.
 *
 * There used to be a second fill — solid ink — and it never worked: on a light
 * ground its only usable shadow colour was ink, which is the fill, so the
 * offset block dissolved into the button. The yellow fill reads on both grounds
 * already, so `tone` is all that is left: it picks the shadow colour that has
 * to contrast with the *surface*, dark on the page ground and light inside a
 * dark band.
 *
 * Anything that needs to be quieter than this is a `textLink`, not a second
 * fill.
 *
 * Hover does nothing — the shadow used to shrink and the colours used to
 * invert, and both are gone. Pressing is the exception: the button travels the
 * exact offset of its own shadow and the shadow drops, so it lands where the
 * shadow was. That is the only motion left, and reduced-motion opts out of it.
 */
export const cta = cva(
	"inline-flex min-h-12 items-center justify-center gap-2.5 border border-neutral-300 hover:border-neutral-400 bg-signal px-5.5 py-3 font-body text-ui font-bold tracking-button text-ink uppercase hover:bg-signal/98 focus-visible:outline-3 focus-visible:outline-ink focus-visible:outline-offset-4 active:translate-1 active:shadow-none motion-reduce:active:translate-none",
	{
		variants: {
			tone: {
				dark: "shadow-button",
				light: "shadow-button-inverse",
			},
		},
		defaultVariants: { tone: "dark" },
	},
);

/**
 * The minimal control: an arrow, and by default an underline.
 *
 * `tone` means the same thing it means on `cta` — the colour that has to read
 * against the surface — except here it colours the text and the rule rather
 * than a shadow. `showBorder` is a setting because the underline is the part
 * merchants most often want gone.
 */
export const textLink = cva(
	"inline-flex min-h-touch items-center gap-3.5 font-body text-ui font-medium tracking-link uppercase after:text-control-lg after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-1.25",
	{
		variants: {
			tone: {
				dark: "border-ink text-ink",
				light: "border-text-inverse text-text-inverse",
			},
			showBorder: { true: "border-b", false: "" },
		},
		defaultVariants: { tone: "dark", showBorder: true },
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

/**
 * Author-controlled space above and below a shared element.
 *
 * Each step is a single `--spacing-block-*` clamp, so one authored choice
 * covers every viewport and Studio never has to expose a value per breakpoint.
 * Both axes default to `undefined` rather than `"none"`: an unset margin has to
 * emit nothing, or it would override the rhythm a recipe like `eyebrow` already
 * carries.
 */
export const blockSpacing = cva("", {
	variants: {
		marginTop: {
			none: "mt-0",
			sm: "mt-block-sm",
			md: "mt-block-md",
			lg: "mt-block-lg",
			xl: "mt-block-xl",
		},
		marginBottom: {
			none: "mb-0",
			sm: "mb-block-sm",
			md: "mb-block-md",
			lg: "mb-block-lg",
			xl: "mb-block-xl",
		},
	},
});
