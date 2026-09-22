import Link from "next/link";

import { cn } from "@/lib/cn";
import type { FilterGroup } from "@/lib/storefront/catalog-facets";

/** Each filter row links to validated query state without requiring JavaScript. */
export function FilterSidebar({
  groups,
  idPrefix,
  showCounts = false,
}: {
  groups: readonly FilterGroup[];
  idPrefix: string;
  showCounts?: boolean;
}) {
  return (
    <div
      className={cn(
        "border-border-subtle border-t",
        idPrefix === "desktop" && "hidden md:block",
      )}
    >
      {groups.map((group) => (
        <details
          key={`${idPrefix}-${group.heading}`}
          className="group/filter border-border-subtle border-b"
          open
        >
          <summary className="flex min-h-13 list-none items-center justify-between font-body text-micro font-medium tracking-label uppercase after:text-lg after:font-normal after:content-['+'] group-open/filter:after:content-['−'] [&::-webkit-details-marker]:hidden">
            {group.heading}
          </summary>
          <div className="pb-4.5">
            {group.links.map((link) => (
              <Link
                key={link.key}
                className="group/check flex min-h-10 items-center gap-2.5 font-body text-micro text-text-muted tracking-control uppercase hover:text-ink aria-[current=page]:text-ink"
                href={link.href}
                aria-current={link.selected ? "page" : undefined}
              >
                <span
                  className="size-3.25 flex-none rounded-full border border-border-subtle group-aria-[current=page]/check:border-ink group-aria-[current=page]/check:bg-signal"
                  aria-hidden="true"
                />
                <span className="flex-1">{link.label}</span>
                {showCounts ? (
                  <span className="tabular-nums">{link.count}</span>
                ) : null}
              </Link>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
