function hexByte(value: number): string {
  return Math.round(value).toString(16).padStart(2, "0");
}

function canonicalColor(body: string): string | null {
  const commaParts = body.includes(",")
    ? body.split(",").map((part) => part.trim())
    : null;
  const [channelsPart, slashAlpha] = body.split("/").map((part) => part.trim());
  const parts = commaParts ?? channelsPart?.split(/\s+/);
  if (parts === undefined || parts.length < 3 || parts.length > 4) return null;
  const channels = parts.slice(0, 3).map(Number);
  if (channels.some((value) => !Number.isFinite(value))) return null;
  const rawAlpha = commaParts?.[3] ?? slashAlpha;
  const alpha =
    rawAlpha === undefined
      ? 1
      : rawAlpha.endsWith("%")
        ? Number(rawAlpha.slice(0, -1)) / 100
        : Number(rawAlpha);
  if (!Number.isFinite(alpha)) return null;
  const colour = `#${channels.map(hexByte).join("")}`;
  return alpha >= 1 ? colour : `${colour}${hexByte(alpha * 255)}`;
}

/** Semantic comparison form for source and minified compiled CSS values. */
export function canonicalCssValue(input: string): string {
  return input
    .replace(
      /rgba?\(([^)]+)\)/gi,
      (match, body: string) => canonicalColor(body) ?? match,
    )
    .replace(/#([\da-f]{3,8})\b/gi, (_, body: string) => {
      const expanded =
        body.length === 3 || body.length === 4
          ? [...body].map((digit) => `${digit}${digit}`).join("")
          : body;
      const normalized = expanded.toLowerCase();
      return `#${
        normalized.length === 8 && normalized.endsWith("ff")
          ? normalized.slice(0, -2)
          : normalized
      }`;
    })
    .replace(
      /(?<![\w.])(-?(?:\d*\.)?\d+)s\b/g,
      (_, seconds: string) => `${Number(seconds) * 1000}ms`,
    )
    .replace(/(^|[^\d])(-?)\.(\d+)/g, "$1$20.$3")
    .replace(/\s+/g, "");
}

/**
 * The canonical Forward theme contract: every `@theme` token and its exact
 * value. `tests/architecture-contracts.test.ts` proves `globals.css` declares
 * exactly these, and `scripts/check-tailwind-theme.mts` proves the production
 * build emits them, so a value-only edit cannot slip past a name-only guard.
 */

export const THEME_TOKENS: Record<string, string> = {
  "--color-canvas": "#f2eee4",
  "--color-surface-subtle": "#e8e2d4",
  "--color-media-placeholder": "#c8c0b0",
  "--color-media-card": "#d4cdbf",
  "--color-surface-dark": "#2f3a2f",
  "--color-ink": "#11130f",
  "--color-text-muted": "#66695f",
  "--color-text-dark-muted": "#aeb1a7",
  "--color-text-dark-subtle": "#c5c8be",
  "--color-text-dark-lede": "#b5b8ae",
  "--color-text-dark-meta": "#9ea298",
  "--color-text-inverse": "#f5f1e8",
  "--color-text-inverse-subtle": "#aab7ae",
  "--color-text-disabled": "#b9bcb4",
  "--color-border-subtle": "rgb(17 19 15 / 22%)",
  "--color-border-dark": "#4a4d45",
  "--color-border-dark-subtle": "#474b43",
  "--color-border-dark-divider": "#52554e",
  "--color-border-dark-strong": "#65685f",
  "--color-border-field": "#686b63",
  "--color-control-disabled": "#53564f",
  "--color-signal": "#d9ff57",
  "--color-signal-strong": "#485c00",
  "--color-accent-warm": "#ff9b77",
  "--color-focus": "#b8dc38",
  "--color-focus-field": "rgba(23, 61, 45, 0.18)",
  "--background-image-field-index-overlay":
    "linear-gradient( 180deg, transparent 48%, rgba(5, 16, 11, 0.74) )",
  "--background-image-field-testing-overlay":
    "linear-gradient( 90deg, rgba(10, 12, 9, 0.9), rgba(10, 12, 9, 0.08) )",
  "--background-image-diagonal-strike":
    "linear-gradient( to top right, transparent calc(50% - 1px), currentColor calc(50% - 1px), currentColor calc(50% + 1px), transparent calc(50% + 1px) )",
  "--background-image-system-card-overlay":
    "linear-gradient( transparent, rgba(5, 8, 6, 0.94) )",
  "--font-heading": "var(--font-archivo), sans-serif",
  "--font-body": 'var(--font-manrope), "Helvetica Neue", sans-serif',
  "--font-field-meta": "var(--font-plex-mono), monospace",
  "--text-nano": "0.5rem",
  "--text-micro": "0.5625rem",
  "--text-field-meta": "0.625rem",
  "--text-ui": "0.6875rem",
  "--text-caption": "0.75rem",
  "--text-label": "0.8125rem",
  "--text-copy-sm": "0.875rem",
  "--text-copy": "0.9375rem",
  "--text-copy-lg": "1.125rem",
  "--text-card-title": "1.1875rem",
  "--text-control-lg": "1.25rem",
  "--text-heading-4": "1.6875rem",
  "--text-heading-3-fixed": "1.9375rem",
  "--text-article-subheading": "clamp(21px, 2vw, 27px)",
  "--text-article-heading": "clamp(34px, 4vw, 52px)",
  "--text-display-wide": "clamp(58px, 7vw, 112px)",
  "--text-display-mobile": "clamp(50px, 15vw, 76px)",
  "--text-page-display-mobile": "clamp(54px, 12vw, 82px)",
  "--text-index-display-mobile": "clamp(53px, 17vw, 80px)",
  "--text-home-display": "clamp(44px, 5vw, 78px)",
  "--text-display-fixed": "4.5rem",
  "--text-feature-stat": "1.875rem",
  "--text-account-title": "1.625rem",
  "--text-product-price": "1.5rem",
  "--text-lede": "clamp(17px, 1.45vw, 22px)",
  "--text-home-hero": "clamp(58px, 6.7vw, 112px)",
  "--text-home-hero-mobile": "clamp(52px, 16vw, 78px)",
  "--text-home-feature-title": "25px",
  "--text-system-title": "clamp(42px, 4vw, 68px)",
  "--text-spotlight-title": "clamp(40px, min(5.6vw, 8svh), 72px)",
  "--text-spotlight-title-short": "clamp(26px, 7svh, 40px)",
  "--text-spotlight-copy": "clamp(16px, 2.5svh, 19px)",
  "--text-spotlight-copy-short": "clamp(12px, 3.2svh, 15px)",
  "--text-about-statement": "clamp(48px, 7vw, 100px)",
  "--text-material-title": "38px",
  "--text-field-case-title": "clamp(50px, 6vw, 94px)",
  "--text-article-pullquote": "clamp(34px, 5vw, 72px)",
  "--text-article-display": "clamp(58px, 6.8vw, 104px)",
  "--text-journal-card": "clamp(31px, 3vw, 47px)",
  "--text-journal-display": "clamp(58px, 7vw, 106px)",
  "--text-page-display": "clamp(60px, 7vw, 112px)",
  "--text-collection-display": "clamp(62px, 6.8vw, 108px)",
  "--text-field-index-title": "clamp(25px, 2.5vw, 40px)",
  "--text-about-index-title": "clamp(22px, 2vw, 32px)",
  "--text-mobile-index-title": "clamp(25px, 8vw, 36px)",
  "--text-product-title": "clamp(44px, 3.7vw, 66px)",
  "--text-search-display": "clamp(45px, 7vw, 100px)",
  "--leading-display-tightest": "0.9",
  "--leading-display": "0.94",
  "--leading-display-relaxed": "0.95",
  "--leading-heading": "0.98",
  "--leading-subheading": "1.02",
  "--leading-copy-tight": "1.05",
  "--leading-copy": "1.2",
  "--leading-meta": "1.3",
  "--leading-lede": "1.55",
  "--leading-rich-copy": "1.7",
  "--leading-home-hero": "0.88",
  "--leading-field-case": "0.92",
  "--leading-product-title": "0.96",
  "--leading-journal-card": "1.08",
  "--leading-spotlight-copy-short": "1.25",
  "--leading-spotlight-copy": "1.45",
  "--leading-mobile-index": "1.5",
  "--leading-body": "1.6",
  "--leading-field-index-copy": "1.65",
  "--leading-mobile-rail": "1.8",
  "--text-display": "clamp(3.5rem, 7.3vw, 7.25rem)",
  "--text-display--line-height": "0.94",
  "--text-heading-2": "clamp(2.875rem, 5.6vw, 5.25rem)",
  "--text-heading-2--line-height": "0.98",
  "--text-heading-3": "clamp(1.9375rem, 3.6vw, 3.25rem)",
  "--text-heading-3--line-height": "1.02",
  "--font-weight-heading": "500",
  "--font-weight-title": "var(--font-weight-heading)",
  "--font-weight-ui": "500",
  "--font-weight-ui-strong": "700",
  "--font-weight-field-meta": "500",
  "--tracking-heading": "-0.035em",
  "--tracking-display-tight": "-0.06em",
  "--tracking-link": "0.06em",
  "--tracking-control": "0.08em",
  "--tracking-button": "0.09em",
  "--tracking-label": "0.1em",
  "--tracking-field-meta": "0.12em",
  "--tracking-mini-cart-title": "-0.02em",
  "--tracking-about-index-title": "-0.03em",
  "--tracking-home-hero": "-0.065em",
  "--tracking-announcement": "0.13em",
  "--container-page": "96.25rem",
  "--container-feature": "1050px",
  "--container-lede": "670px",
  "--container-state": "560px",
  "--container-form": "500px",
  "--container-copy-narrow": "460px",
  "--spacing-page-gutter": "clamp(1.375rem, 4.2vw, 4.5rem)",
  "--spacing-section-block": "clamp(70px, 9vw, 140px)",
  "--spacing-section-block-compact": "clamp(42px, 6vw, 84px)",
  "--spacing-section-block-short": "clamp(70px, 9vw, 130px)",
  "--spacing-section-block-bottom": "clamp(56px, 8vw, 110px)",
  "--spacing-feature-gap": "clamp(40px, 8vw, 110px)",
  "--spacing-article-gap": "clamp(40px, 8vw, 120px)",
  "--spacing-page-gap": "clamp(48px, 10vw, 150px)",
  "--spacing-panel": "clamp(45px, 5vw, 80px)",
  "--spacing-panel-wide": "clamp(45px, 6vw, 95px)",
  "--spacing-prose-block": "1.4em",
  "--spacing-prose-subhead": "0.8em",
  "--spacing-prose-paragraph": "1em",
  "--spacing-prose-section": "2.5em",
  "--spacing-home-copy": "0.83em",
  "--spacing-field-index-indent": "calc(var(--spacing-page-gutter) + 10px)",
  "--spacing-route-media-min": "54svh",
  "--spacing-home-media-mobile": "60svh",
  "--spacing-page-min": "82svh",
  "--spacing-article-min": "86svh",
  "--spacing-state-min": "60svh",
  "--grid-template-columns-page-header": "1.35fr 0.65fr",
  "--grid-template-columns-split-65": "0.65fr 1.35fr",
  "--grid-template-columns-split-70": "0.7fr 1.3fr",
  "--grid-template-columns-split-75": "0.75fr 1.25fr",
  "--grid-template-columns-split-85": "0.85fr 1.15fr",
  "--grid-template-columns-split-90": "0.9fr 1.1fr",
  "--grid-template-columns-lead-trailing": "1fr auto",
  "--grid-template-columns-spec-row": "1fr 0.7fr auto",
  "--grid-template-columns-index-row": "34px 1fr auto",
  "--grid-template-columns-stepper": "36px 1fr 36px",
  "--grid-template-columns-line-item": "190px 1fr auto",
  "--grid-template-columns-line-item-compact": "92px 1fr",
  "--grid-template-columns-media-row": "190px 1fr",
  "--grid-template-columns-article-body": "180px minmax(0, 720px)",
  "--grid-template-columns-cart": "minmax(0, 1.45fr) minmax(320px, 0.55fr)",
  "--grid-template-columns-feature-row":
    "minmax(0, 1fr) minmax(260px, 0.42fr) auto",
  "--spacing-header": "5.25rem",
  "--spacing-header-compact": "4.125rem",
  "--spacing-announcement": "1.875rem",
  "--spacing-touch": "2.75rem",
  "--shadow-button": "4px 4px 0 var(--color-ink)",
  "--shadow-button-hover": "2px 2px 0 var(--color-ink)",
  "--shadow-button-inverse": "4px 4px 0 var(--color-text-inverse)",
  "--shadow-button-inverse-hover": "2px 2px 0 var(--color-text-inverse)",
  "--shadow-button-signal": "4px 4px 0 var(--color-signal)",
  "--shadow-button-signal-hover": "2px 2px 0 var(--color-signal)",
  "--shadow-panel": "0 28px 48px rgb(16 22 18 / 16%)",
  "--shadow-collection-feature": "30px -30px 0 var(--color-signal)",
  "--shadow-collection-feature-mobile": "14px -14px 0 var(--color-signal)",
  "--shadow-mini-cart": "6px 6px 0 var(--color-ink)",
  "--breakpoint-xs": "26.875rem",
  "--breakpoint-sm": "35rem",
  "--breakpoint-md": "51.25rem",
  "--breakpoint-md-up": "51.3125rem",
  "--breakpoint-lg": "68.75rem",
  "--breakpoint-xl": "78.75rem",
  "--duration-fast": "180ms",
  "--duration-panel": "240ms",
  "--duration-media": "320ms",
  "--ease-standard": "ease",
  "--ease-enter": "cubic-bezier(0.22, 1, 0.36, 1)",
  "--ease-media": "cubic-bezier(0.2, 0.7, 0.2, 1)",
  "--animate-shell-panel":
    "shell-panel-enter var(--duration-panel) var(--ease-enter) both",
  "--animate-shell-image":
    "shell-image-enter var(--duration-media) var(--ease-standard) both",
  "--animate-shell-mobile": "shell-mobile-enter 260ms var(--ease-enter) both",
};
