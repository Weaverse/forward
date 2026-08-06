import type { Metadata } from "next";
import Image from "next/image";

import { storefront } from "@/lib/storefront/data-source";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Forward account.",
};

/**
 * Sign-in — port of the canonical `signInPage()` (source `app.js:312`): the
 * 1.2fr/.8fr image and dark-panel split with the inset bordered auth panel.
 *
 * The canonical prototype prefills credentials and fakes a successful sign-in.
 * Forward keeps its honest static behavior: no form element, no submission,
 * no credential handling. Authentication waits on the Customer Account slice.
 */
export default async function LoginPage() {
  const themeContent = await storefront.getThemeContent();
  const panelImage = themeContent.standardBandImage;

  return (
    <div className="auth-layout">
      <div className="auth-image">
        <Image
          src={panelImage.src}
          alt={panelImage.alt}
          width={panelImage.width}
          height={panelImage.height}
          sizes="(min-width: 820px) 60vw, 100vw"
          priority
        />
      </div>
      <section className="auth-panel" aria-label="Sign in">
        <div className="auth-inner">
          <p className="eyebrow">Field account</p>
          <h1 className="h2">Welcome back.</h1>
          <p className="muted">
            Track orders, start a repair, and keep a record of the gear you use
            most.
          </p>
          <fieldset disabled>
            <legend className="sr-only">Sign-in preview (disabled)</legend>
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <p className="button button-primary button-block" aria-disabled>
              Sign in — not connected
            </p>
          </fieldset>
          <p className="form-note">
            Prototype only: sign-in is intentionally disabled. Customer accounts
            are not connected, nothing is submitted, and no credential is sent
            or stored anywhere.
          </p>
        </div>
      </section>
    </div>
  );
}
