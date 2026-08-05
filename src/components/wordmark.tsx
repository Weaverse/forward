import Link from "next/link";

import { cn } from "@/lib/cn";

interface WordmarkProps {
  size?: "header" | "footer";
}

export function Wordmark({ size = "header" }: WordmarkProps) {
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
      <span aria-hidden="true" className="translate-y-[-0.08em] text-clay">
        /
      </span>
      <span>Ward</span>
    </Link>
  );
}
