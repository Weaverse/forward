import Link from "next/link";

import { cn } from "@/lib/cn";

interface WordmarkProps {
  size?: "header" | "footer" | "stacked";
}

export function Wordmark({ size = "header" }: WordmarkProps) {
  if (size === "stacked") {
    // Oversized stacked footer wordmark: two hard-broken display lines.
    return (
      <Link
        href="/"
        aria-label="Forward — home"
        className="inline-block font-display font-semibold uppercase leading-[0.86] tracking-[-0.01em] text-[clamp(4.5rem,10vw,9rem)]"
      >
        <span className="block">For</span>
        <span className="block">Ward</span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      aria-label="Forward — home"
      className={cn(
        "inline-flex items-baseline gap-1 font-display font-semibold uppercase leading-none tracking-wordmark",
        size === "header" ? "text-xl" : "text-lg",
      )}
    >
      <span>For</span>
      <span
        aria-hidden="true"
        className={cn(
          "translate-y-[-0.08em]",
          size === "footer" ? "text-acid" : "text-clay",
        )}
      >
        /
      </span>
      <span>Ward</span>
    </Link>
  );
}
