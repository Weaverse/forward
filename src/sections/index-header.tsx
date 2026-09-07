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
    <header className="flex min-h-140 items-end border-border-subtle border-b bg-ink px-page-gutter pt-25 pb-18.75 text-text-inverse max-md:min-h-130 max-sm:min-h-107.5 max-sm:pt-17.5">
      <div className="mx-auto grid w-full grid-cols-page-header items-end gap-12.5 max-md:grid-cols-1 max-md:gap-7">
        <div>
          {breadcrumb !== undefined ? (
            <p className="mb-7 font-field-meta text-ui font-medium text-signal tracking-field-meta uppercase">
              {breadcrumb}
            </p>
          ) : null}
          <p className={eyebrow({ tone: "signal" })}>{eyebrowLabel}</p>
          <h1 className="m-0 max-w-feature text-balance font-heading text-display leading-display font-medium tracking-heading max-sm:text-index-display-mobile">
            {heading}
          </h1>
        </div>
        <p className="m-0 max-w-lede justify-self-end text-lede leading-lede text-text-dark-lede max-md:max-w-full max-md:justify-self-start">
          {lede}
        </p>
      </div>
    </header>
  );
}
