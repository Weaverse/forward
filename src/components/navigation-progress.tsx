"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import { usePathname } from "@/lib/i18n/locale-context";

/* App Router has no global "navigating" state, so the theme `Link` reports a
 * start and a changed pathname or query reports the end. */
let navigating = false;
const LISTENERS = new Set<() => void>();

function setNavigating(next: boolean) {
  if (navigating !== next) {
    navigating = next;
    for (const listener of LISTENERS) {
      listener();
    }
  }
}

function subscribe(listener: () => void) {
  LISTENERS.add(listener);
  return () => {
    LISTENERS.delete(listener);
  };
}

/**
 * Called by the theme `Link` as a client navigation starts. A link to the page
 * already shown (or only to a `#hash` on it) changes no URL that could end
 * the bar, so it never starts one.
 */
export function startNavigationProgress(href: string) {
  const target = new URL(href, window.location.href);
  if (
    target.pathname === window.location.pathname &&
    target.search === window.location.search
  ) {
    return;
  }
  setNavigating(true);
}

/* A navigation that never lands (an error page, an aborted request) must not
 * leave the bar running. */
const SAFETY_STOP_MS = 10_000;
const FINISH_MS = 300;

type Phase = "idle" | "loading" | "finishing";

function ProgressBar() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const active = useSyncExternalStore(
    subscribe,
    () => navigating,
    () => false,
  );
  const [phase, setPhase] = useState<Phase>("idle");

  /* The new route rendered: the navigation is over. */
  useEffect(() => {
    setNavigating(false);
  }, [pathname, search]);

  useEffect(() => {
    if (active) {
      setPhase("loading");
      const id = setTimeout(() => setNavigating(false), SAFETY_STOP_MS);
      return () => clearTimeout(id);
    }
    setPhase((current) => (current === "loading" ? "finishing" : current));
  }, [active]);

  useEffect(() => {
    if (phase === "finishing") {
      const id = setTimeout(() => setPhase("idle"), FINISH_MS);
      return () => clearTimeout(id);
    }
  }, [phase]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-1000 h-0.75"
    >
      <div
        className={cn(
          "h-full bg-signal-strong",
          phase === "idle" && "w-0 opacity-0",
          /* Creeps toward 85% and waits there for the page. */
          phase === "loading" &&
            "w-[85%] opacity-100 transition-[width] duration-[8s] ease-out",
          phase === "finishing" &&
            "w-full opacity-0 transition-[width,opacity] duration-300 ease-out",
        )}
      />
    </div>
  );
}

/** A thin bar along the top of the page while a client navigation is loading. */
export function NavigationProgress() {
  /* `useSearchParams` needs a Suspense boundary to keep pages static. */
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
