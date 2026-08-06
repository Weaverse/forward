import Link from "next/link";

interface WordmarkProps {
  /** `header` renders the canonical `.brand` cell; `footer` the stacked mark. */
  variant?: "header" | "footer";
}

/**
 * Canonical FOR/WARD mark. Source `app.js:145` (header `.brand`) and
 * `app.js:167` (`.footer-brand`).
 */
export function Wordmark({ variant = "header" }: WordmarkProps) {
  if (variant === "footer") {
    return (
      <Link className="footer-brand" href="/" aria-label="Forward — home">
        FOR
        <br />
        WARD
      </Link>
    );
  }

  return (
    <Link className="brand" href="/" aria-label="Forward — home">
      <span>FOR</span>
      <span>WARD</span>
      <small>OUTDOOR / 01</small>
    </Link>
  );
}
