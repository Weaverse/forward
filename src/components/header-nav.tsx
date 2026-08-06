"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import type { NavItem } from "@/lib/storefront/types";

interface HeaderNavProps {
  items: readonly NavItem[];
}

function isActive(pathname: string, href: string): boolean {
  if (pathname === href || pathname.startsWith(`${href}/`)) {
    return true;
  }
  // Product pages belong to the shop cell even though they live under /products.
  return href === "/shop" && pathname.startsWith("/products");
}

/**
 * Segmented technical desktop nav: numbered bordered cells, active route as a
 * dark cell. Client-only because active detection needs the live pathname.
 */
export function HeaderNav({ items }: HeaderNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden self-stretch lg:block">
      <ul className="flex h-full items-stretch border-l border-carbon/25">
        {items.map((item, index) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex border-r border-carbon/25">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                data-surface={active ? "dark" : undefined}
                className={cn(
                  "field-label inline-flex min-h-11 items-center gap-2 px-5 transition-colors",
                  active
                    ? "bg-carbon text-cream"
                    : "text-slate hover:bg-carbon/5 hover:text-carbon",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(active ? "text-acid" : "text-slate/70")}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
