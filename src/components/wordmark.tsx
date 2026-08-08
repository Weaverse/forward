import Image from "next/image";
import Link from "next/link";

interface WordmarkProps {
  variant?: "header" | "footer" | "mobile";
}

const WORDMARKS = {
  header: {
    className: "brand",
    imageClassName: "brand-image",
    src: "/images/brand/forward-wordmark-horizontal-moss.svg",
  },
  footer: {
    className: "footer-brand",
    imageClassName: "footer-brand-image",
    src: "/images/brand/forward-wordmark-horizontal-reversed.svg",
  },
  mobile: {
    className: "mobile-brand",
    imageClassName: "mobile-brand-image",
    src: "/images/brand/forward-wordmark-horizontal-reversed.svg",
  },
} as const;

/** Approved FOR / WARD horizontal lockup for light and dark site surfaces. */
export function Wordmark({ variant = "header" }: WordmarkProps) {
  const wordmark = WORDMARKS[variant];

  return (
    <Link className={wordmark.className} href="/" aria-label="Forward — home">
      <Image
        className={wordmark.imageClassName}
        src={wordmark.src}
        alt=""
        width={480}
        height={96}
      />
    </Link>
  );
}
