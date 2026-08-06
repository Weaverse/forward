"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { NavItem } from "@/lib/storefront/types";

interface MobileMenuProps {
  primary: readonly NavItem[];
  utility: readonly NavItem[];
}

/**
 * Mobile disclosure menu: full destination list (primary + utility) on a
 * carbon overlay. Focus is trapped while open, Escape closes, and focus
 * returns to the trigger on close so keyboard users never lose their place.
 */
export function MobileMenu({ primary, utility }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const destinations = [...primary, ...utility];

  useEffect(() => {
    if (!open) {
      return;
    }
    const panel = panelRef.current;
    if (panel === null) {
      return;
    }
    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      );
    focusables()[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (first === undefined || last === undefined) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        onClick={() => setOpen((current) => !current)}
        className="field-label inline-flex min-h-11 items-center px-3 text-carbon"
      >
        Menu
      </button>
      {open ? (
        <div
          ref={panelRef}
          id="mobile-menu-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          data-surface="dark"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-carbon text-cream"
        >
          <div className="flex items-center justify-between border-b border-cream/15 px-5 py-4">
            <p className="field-label text-cream/70">Forward</p>
            <button
              type="button"
              onClick={close}
              className="field-label inline-flex min-h-11 items-center px-3 text-cream"
            >
              Close
            </button>
          </div>
          <nav aria-label="Menu" className="flex-1 px-5 py-4">
            <ul>
              {destinations.map((item, index) => (
                <li key={item.href} className="border-b border-cream/15">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-14 items-baseline justify-between gap-4 py-3"
                  >
                    <span className="font-display text-2xl leading-none">
                      {item.label}
                    </span>
                    <span aria-hidden="true" className="field-label text-acid">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="field-label border-t border-cream/15 px-5 py-5 text-cream/50">
            Designed for weather, miles, and repeat use
          </p>
        </div>
      ) : null}
    </div>
  );
}
