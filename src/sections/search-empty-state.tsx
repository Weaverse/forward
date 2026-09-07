import Link from "next/link";

import {
  cta,
  emptyState,
  eyebrow,
  sectionHeading,
} from "@/lib/presentation/variants";

interface SearchEmptyStateProps {
  eyebrowLabel: string;
  heading: React.ReactNode;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  /** Announce the body copy when it reports a result count. */
  announce?: boolean;
}

/** The search page with no results to show: prompt or no-match. */
export function SearchEmptyState({
  eyebrowLabel,
  heading,
  body,
  ctaLabel,
  ctaHref,
  announce = false,
}: SearchEmptyStateProps) {
  return (
    <section className={emptyState()}>
      <div className="max-w-form">
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h2 className={sectionHeading({ size: "subsectionSpaced" })}>
          {heading}
        </h2>
        <p
          className="text-text-muted"
          aria-live={announce ? "polite" : undefined}
        >
          {body}
        </p>
        <Link className={cta()} href={ctaHref}>
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
