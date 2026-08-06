"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { NavItem } from "@/lib/storefront/types";

interface MobileMenuProps {
  primary: readonly NavItem[];
  utility: readonly NavItem[];
}

/**
 * Canonical mobile menu surface. Source `app.js:156` (`.menu-button`) and
 * `app.js:193–200` (`.mobile-menu`).
 *
 * The canonical prototype toggles a persistently mounted panel with a global
 * click delegate. Forward keeps its own behavior — conditional mount, focus
 * trap, Escape, focus restore, and scroll lock — because the static POC was
 * only illustrative there.
 */
export function MobileMenu({ primary, utility }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
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
    document.body.classList.add("locked");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("locked");
    };
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="icon-button menu-button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((current) => !current)}
      >
        Menu
      </button>
      {open ? (
        <aside
          ref={panelRef}
          className="mobile-menu"
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="mobile-menu-head">
            <span className="brand">FORWARD</span>
            <button
              type="button"
              className="icon-button"
              onClick={close}
              aria-label="Close menu"
            >
              Close
            </button>
          </div>
          <nav className="mobile-menu-nav" aria-label="Mobile navigation">
            {destinations.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="mobile-menu-meta">
            Designed for weather, miles, and repeat use.
            <br />
            Static demonstration storefront · FORWARD
          </p>
        </aside>
      ) : null}
    </>
  );
}
