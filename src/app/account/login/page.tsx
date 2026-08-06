import type { Metadata } from "next";
import Image from "next/image";

import { storefront } from "@/lib/storefront/data-source";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Forward account.",
};

export default async function LoginPage() {
  const themeContent = await storefront.getThemeContent();
  const panelImage = themeContent.standardBandImage;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-stretch">
      <Image
        src={panelImage.src}
        alt={panelImage.alt}
        width={panelImage.width}
        height={panelImage.height}
        priority
        sizes="(min-width: 1024px) 55vw, 100vw"
        className="max-h-[26rem] w-full border border-carbon object-cover lg:max-h-none lg:h-full"
      />
      <div className="flex flex-col justify-center border border-carbon/30 px-6 py-10 sm:px-10">
        <p className="field-label text-pine">Field account</p>
        <h1 className="display-large mt-4 text-carbon">Welcome back.</h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-slate">
          Track orders, start a repair, and keep a record of the gear you use
          most.
        </p>

        {/*
         * Visual prototype of the sign-in surface only. There is no form
         * element, no submission, and no credential handling: authentication
         * waits on the Customer Account OAuth slice via /account/authorize.
         */}
        <fieldset disabled className="mt-8 space-y-5">
          <legend className="sr-only">Sign-in preview (disabled)</legend>
          <div>
            <label htmlFor="login-email" className="field-label text-carbon">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              disabled
              placeholder="you@example.com"
              className="mt-2 min-h-11 w-full border border-carbon/40 bg-cream px-4 text-base text-slate placeholder:text-slate/60 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="field-label text-carbon">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              disabled
              placeholder="••••••••"
              className="mt-2 min-h-11 w-full border border-carbon/40 bg-cream px-4 text-base text-slate placeholder:text-slate/60 disabled:cursor-not-allowed"
            />
          </div>
          <p
            aria-disabled="true"
            className="field-label flex min-h-11 cursor-not-allowed items-center justify-center bg-hairline text-slate"
          >
            Sign in — not connected
          </p>
        </fieldset>

        <p className="mt-6 max-w-sm text-xs leading-relaxed text-slate">
          Prototype only: sign-in is intentionally disabled. Customer accounts
          are not connected, nothing is submitted, and no credential is sent or
          stored anywhere.
        </p>
      </div>
    </div>
  );
}
