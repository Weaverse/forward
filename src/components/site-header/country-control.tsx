"use client";

import { useEffect, useId, useRef, useState } from "react";
import ReactCountryFlag from "react-country-flag";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import {
  ACTIVE_STOREFRONT_COUNTRY,
  AVAILABLE_STOREFRONT_COUNTRIES,
  countryControlLabel,
  type StorefrontCountry,
} from "@/lib/storefront/localization";

const CONTROL_CLASS =
  "inline-flex items-center gap-1.5 font-body text-ui font-ui tracking-control uppercase";

/* The library always writes width/height inline, so utilities cannot size it. */
const FLAG_DIMENSIONS = { width: "18px", height: "12px" } as const;

/** Decorative: the label beside every flag already names the market. */
function CountryFlag({ country }: { country: StorefrontCountry }) {
  return (
    <ReactCountryFlag
      svg
      countryCode={country.isoCode}
      className="shrink-0 rounded-xs object-cover"
      style={FLAG_DIMENSIONS}
      alt=""
      aria-hidden="true"
    />
  );
}

/**
 * Topbar market indicator for a store with a single published market. It
 * states that market truthfully instead of dressing one option as a choice.
 */
function MarketStatement() {
  return (
    <span className={CONTROL_CLASS}>
      <Icon name="globe-hemisphere-west" size={14} />
      {countryControlLabel(ACTIVE_STOREFRONT_COUNTRY)}
      <span className="sr-only">
        . Forward currently ships to this market only.
      </span>
    </span>
  );
}

/**
 * Topbar market selector.
 *
 * Selection is presentational: it moves the marker, and nothing else. The
 * shopper is still priced and checked out against
 * `ACTIVE_STOREFRONT_COUNTRY` until a Storefront `@inContext` localization
 * read replaces the preview market list.
 */
function CountrySelector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(ACTIVE_STOREFRONT_COUNTRY);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function choose(country: StorefrontCountry) {
    setSelected(country);
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          CONTROL_CLASS,
          /* The topbar is a 30px strip, so the control keeps its text-height
           * box and hangs the touch target off a pseudo-element instead. */
          "relative bg-transparent hover:underline after:absolute after:inset-x-0 after:top-1/2 after:h-touch after:-translate-y-1/2 after:content-['']",
        )}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <CountryFlag country={selected} />
        {countryControlLabel(selected)}
        <span className="sr-only">. Change shipping market</span>
        <Icon name={open ? "caret-up" : "caret-down"} size={12} />
      </button>
      {open ? (
        <div
          className="absolute end-0 top-full z-90 mt-1.5 min-w-60 animate-shell-panel border border-ink bg-canvas text-start shadow-panel motion-reduce:animate-none"
          id={panelId}
        >
          <p className="m-0 border-border-subtle border-b px-4 py-2.5 font-body text-micro text-text-muted tracking-field-meta uppercase">
            Shipping market
          </p>
          <ul className="m-0 list-none p-0">
            {AVAILABLE_STOREFRONT_COUNTRIES.map((country) => (
              <li key={country.isoCode}>
                <button
                  type="button"
                  className="flex min-h-touch w-full items-center justify-between gap-4 border-border-subtle border-b bg-transparent px-4 py-2.5 text-start font-body text-ui font-ui tracking-control uppercase last:border-b-0 hover:bg-ink hover:text-text-inverse focus-visible:bg-ink focus-visible:text-text-inverse aria-[current=true]:font-ui-strong"
                  aria-current={
                    country.isoCode === selected.isoCode ? "true" : undefined
                  }
                  onClick={() => choose(country)}
                >
                  <span className="inline-flex items-center gap-2">
                    <CountryFlag country={country} />
                    {countryControlLabel(country)}
                  </span>
                  {country.isoCode === selected.isoCode ? (
                    <Icon name="check-circle" size={14} />
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function CountryControl() {
  return AVAILABLE_STOREFRONT_COUNTRIES.length > 1 ? (
    <CountrySelector />
  ) : (
    <MarketStatement />
  );
}
