import Image from "next/image";
import Link from "next/link";

interface WordmarkProps {
  href?: string;
  variant?: "header" | "header-overlay" | "footer" | "mobile";
}

const HEADER_WORDMARK_CLASS = "block w-29.25 leading-none sm:w-38.75";

const WORDMARKS = {
  header: {
    className: HEADER_WORDMARK_CLASS,
    src: "/images/brand/forward-wordmark-horizontal-moss.svg",
  },
  /** Same lockup reversed, for the header floating over a dark hero. */
  "header-overlay": {
    className: HEADER_WORDMARK_CLASS,
    src: "/images/brand/forward-wordmark-horizontal-reversed.svg",
  },
  footer: {
    className: "block w-[clamp(280px,31vw,480px)] leading-none",
    src: "/images/brand/forward-wordmark-horizontal-reversed.svg",
  },
  mobile: {
    className: "block w-26 leading-none xs:w-30.5",
    src: "/images/brand/forward-wordmark-horizontal-reversed.svg",
  },
} as const;

/** Approved FOR / WARD horizontal lockup for light and dark site surfaces. */
export function Wordmark({ href = "/", variant = "header" }: WordmarkProps) {
  const wordmark = WORDMARKS[variant];

  return (
    <Link
      className={wordmark.className}
      href={href}
      aria-label="Forward — home"
    >
      <Image
        className="block h-auto w-full bg-transparent"
        src={wordmark.src}
        alt=""
        width={480}
        height={96}
        /* The header lockup is above the fold and is the LCP element. */
        loading={variant.startsWith("header") ? "eager" : undefined}
      />
    </Link>
  );
}
