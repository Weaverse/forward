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
 * Canonical numbered navigation cells. Source `app.js:146–151`
 * (`.desktop-nav a` with an `<i>` index and the `active` dark cell). Client
 * component because active detection needs the live pathname.
 */
export function HeaderNav({ items }: HeaderNavProps) {
  const pathname = usePathname();

  return (
    <nav className="desktop-nav" aria-label="Primary navigation">
      {items.map((item, index) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(active && "active")}
          >
            <i>{String(index + 1).padStart(2, "0")}</i> {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
