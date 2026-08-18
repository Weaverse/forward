/**
 * Verified third-party integration seams for the Footer.
 *
 * Every entry here must be confirmed against a real account, the real Forward
 * checkout, or a real configured provider before it ships. Nothing may be
 * added speculatively: an empty list renders no section at all, which is the
 * honest state, while a guessed handle or decorative payment mark is a lie the
 * shopper cannot check.
 *
 * Status (2026-08-18):
 * - Social: the four URLs below are the accounts the live Weaverse footer
 *   already publishes. They belong to Weaverse, not to Forward, so the Footer
 *   renders them under `SOCIAL_SECTION_HEADING` and never as store accounts.
 * - Payments: the Forward Store reports `ADMIN_ONBOARDING_REQUIRED` and has no
 *   wallets enabled, so there is no supported method list to display.
 * - Newsletter: Forward has no provider key in any environment, so no form is
 *   rendered rather than one that pretends to succeed.
 */

import type { IconName } from "@/components/icon";

export interface SocialLink {
  label: string;
  /** Absolute URL of a verified, live account. Never `#` or a guess. */
  href: string;
  icon: IconName;
}

export interface NewsletterProvider {
  name: string;
  /** Provider endpoint the form posts to. */
  formAction: string;
}

/** Heading the social row must render under; these are not Forward accounts. */
export const SOCIAL_SECTION_HEADING = "Weaverse community";

export const VERIFIED_SOCIAL_LINKS: readonly SocialLink[] = [
  {
    label: "Weaverse on LinkedIn",
    href: "https://www.linkedin.com/company/weaverseio",
    icon: "linkedin-logo",
  },
  {
    label: "Weaverse on X",
    href: "https://x.com/weaverseio",
    icon: "x-logo",
  },
  {
    label: "Weaverse on YouTube",
    href: "https://www.youtube.com/@weaverse",
    icon: "youtube-logo",
  },
  {
    label: "Weaverse on Facebook",
    href: "https://www.facebook.com/weaverse",
    icon: "facebook-logo",
  },
];

/** Payment methods the Forward checkout actually accepts, once verified. */
export const VERIFIED_CHECKOUT_PAYMENT_MARKS: readonly string[] = [];

export const NEWSLETTER_PROVIDER: NewsletterProvider | null = null;
