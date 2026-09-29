"use client";

import { useEffect, useId, useRef, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { Icon } from "@/components/icon";
import { Link } from "@/components/link";
import { cn } from "@/lib/cn";
import { useLocale, usePathname } from "@/lib/i18n/locale-context";
import {
  LOCALE_IDS,
  LOCALES,
  type LocaleId,
  splitLocale,
} from "@/lib/i18n/locales";

const CONTROL_CLASS =
  "inline-flex items-center gap-1.5 font-body text-ui font-ui tracking-control uppercase";

/* The library always writes width/height inline, so utilities cannot size it. */
const FLAG_DIMENSIONS = { width: "18px", height: "12px" } as const;

/** Decorative: the label beside every flag already names the market. */
function LocaleFlag({ locale }: { locale: LocaleId }) {
  return (
    <ReactCountryFlag
      svg
      countryCode={LOCALES[locale].country}
      className="shrink-0 rounded-xs object-cover"
      style={FLAG_DIMENSIONS}
      alt=""
      aria-hidden="true"
    />
  );
}

/** Topbar market indicator when the theme serves a single locale. */
function MarketStatement({ locale }: { locale: LocaleId }) {
  return (
    <span className={CONTROL_CLASS}>
      <Icon name="globe-hemisphere-west" size={14} />
      {LOCALES[locale].label}
      <span className="sr-only">
        . Forward currently ships to this market only.
      </span>
    </span>
  );
}

/**
 * Topbar market selector.
 *
 * Each market is a link to the page the shopper is on, in that market: the
 * locale lives in the URL, so choosing one is navigation, and the prices on the
 * next page are the ones the store quotes that market.
 */
function MarketSelector({ locale }: { locale: LocaleId }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const path = splitLocale(usePathname()).path;

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
        <LocaleFlag locale={locale} />
        {LOCALES[locale].label}
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
            {LOCALE_IDS.map((option) => (
              <li key={option}>
                <Link
                  className="flex min-h-touch w-full items-center justify-between gap-4 border-border-subtle border-b bg-transparent px-4 py-2.5 text-start font-body text-ui font-ui tracking-control uppercase last:border-b-0 hover:bg-ink hover:text-text-inverse focus-visible:bg-ink focus-visible:text-text-inverse aria-[current=true]:font-ui-strong"
                  href={path}
                  locale={option}
                  aria-current={option === locale ? "true" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className="inline-flex items-center gap-2">
                    <LocaleFlag locale={option} />
                    {LOCALES[option].label}
                  </span>
                  {option === locale ? (
                    <Icon name="check-circle" size={14} />
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function CountryControl() {
  const locale = useLocale();
  return LOCALE_IDS.length > 1 ? (
    <MarketSelector locale={locale} />
  ) : (
    <MarketStatement locale={locale} />
  );
}
