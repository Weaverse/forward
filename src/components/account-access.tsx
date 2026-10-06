import type { AccountSession } from "@/lib/account/account-view";
import { loginHref } from "@/lib/account/customer-account";
import type { ThemeTranslate } from "@/lib/i18n/static-content";
import { cta, eyebrow, sectionHeading } from "@/lib/presentation/variants";

interface AccountAccessPanelProps {
  /** The page's translator, so this frame renders in the page's market. */
  t: ThemeTranslate;
  /** Same-origin path to return to after authentication. */
  path: string;
  session: Exclude<AccountSession, { status: "authenticated" }>;
  /** True for the fixed `/account?login=failed` target. */
  loginFailed?: boolean;
}

/**
 * The only auth affordance Forward renders. Both links are raw full-page
 * anchors: the login and refresh handlers answer with raw HTTP redirects that
 * client-side navigation cannot follow, and prefetching them would start an
 * OAuth flow nobody asked for.
 *
 * Provider failures are never described here — a failed login is one fixed,
 * generic message.
 */
export function AccountAccessPanel({
  t,
  path,
  session,
  loginFailed = false,
}: AccountAccessPanelProps) {
  const needsRefresh = session.status === "needs-refresh";

  return (
    <div className="min-h-70 border border-ink bg-transparent p-7">
      <p className={eyebrow()}>{t("account.eyebrow")}</p>
      <h2 className={sectionHeading()}>
        {t(
          needsRefresh
            ? "account.access.continueHeading"
            : "account.access.signInHeading",
        )}
      </h2>
      <p className="text-text-muted">
        {t(
          needsRefresh
            ? "account.access.refreshBody"
            : "account.access.signInBody",
        )}
      </p>
      {loginFailed ? (
        <p className="text-caption text-text-dark-muted">
          {t("account.access.loginFailed")}
        </p>
      ) : null}
      {needsRefresh ? (
        <a
          className={cta()}
          href={session.href}
          rel="nofollow"
          data-prefetch="false"
        >
          {t("account.access.continue")}
        </a>
      ) : (
        <a
          className={cta()}
          href={loginHref(path)}
          rel="nofollow"
          data-prefetch="false"
        >
          {t("account.access.signIn")}
        </a>
      )}
    </div>
  );
}
