import Image from "next/image";
import Link from "next/link";

interface WordmarkProps {
  href?: string;
  variant?: "header" | "footer" | "mobile";
}

const WORDMARKS = {
  header: {
    className: "block w-[155px] leading-none max-sm:w-[117px]",
    src: "/images/brand/forward-wordmark-horizontal-moss.svg",
  },
  footer: {
    className: "block w-[clamp(280px,31vw,480px)] leading-none",
    src: "/images/brand/forward-wordmark-horizontal-reversed.svg",
  },
  mobile: {
    className: "block w-[122px] leading-none max-xs:w-[104px]",
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
      />
    </Link>
  );
}
