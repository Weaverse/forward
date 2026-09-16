import { eyebrow } from "@/lib/presentation/variants";

interface IndexHeaderProps {
  eyebrowLabel: string;
  heading: string;
  lede: string;
  /** Optional breadcrumb row rendered above the eyebrow. */
  breadcrumb?: React.ReactNode;
}

/** The dark index masthead shared by Shop, Journal, and the policy routes. */
export function IndexHeader({
  eyebrowLabel,
  heading,
  lede,
  breadcrumb,
}: IndexHeaderProps) {
  return (
    <header className="flex min-h-107.5 items-end border-border-subtle border-b bg-ink px-page-gutter pt-17.5 pb-18.75 text-text-inverse sm:min-h-130 sm:pt-25 md:min-h-140">
      <div className="mx-auto grid w-full grid-cols-1 items-end gap-7 md:grid-cols-page-header md:gap-12.5">
        <div>
          {breadcrumb !== undefined ? (
            <p className="mb-7 font-field-meta text-ui font-medium text-signal tracking-field-meta uppercase">
              {breadcrumb}
            </p>
          ) : null}
          <p className={eyebrow({ tone: "signal" })}>{eyebrowLabel}</p>
          <h1 className="m-0 max-w-feature text-balance font-heading text-index-display-mobile leading-display font-medium tracking-heading sm:text-display">
            {heading}
          </h1>
        </div>
        <p className="m-0 max-w-full justify-self-start text-lede leading-lede text-text-dark-lede md:max-w-lede md:justify-self-end">
          {lede}
        </p>
      </div>
    </header>
  );
}
