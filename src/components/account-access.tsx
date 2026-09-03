import type { AccountSession } from "@/lib/account/account-view";
import { loginHref } from "@/lib/account/customer-account";
import { cta, eyebrow, sectionHeading } from "@/lib/presentation/variants";

interface AccountAccessPanelProps {
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
  path,
  session,
  loginFailed = false,
}: AccountAccessPanelProps) {
  const needsRefresh = session.status === "needs-refresh";

  return (
    <div className="min-h-70 border border-ink bg-transparent p-7">
      <p className={eyebrow()}>Field account</p>
      <h2 className={sectionHeading()}>
        {needsRefresh ? "Continue your session." : "Sign in to continue."}
      </h2>
      <p className="text-text-muted">
        {needsRefresh
          ? "Your session needs to be renewed before this page can show your orders."
          : "Orders, addresses, and repair records are only shown to a signed-in customer."}
      </p>
      {loginFailed ? (
        <p className="text-caption text-text-dark-muted">
          Sign-in did not complete. Please try again.
        </p>
      ) : null}
      {needsRefresh ? (
        <a
          className={cta()}
          href={session.href}
          rel="nofollow"
          data-prefetch="false"
        >
          Continue
        </a>
      ) : (
        <a
          className={cta()}
          href={loginHref(path)}
          rel="nofollow"
          data-prefetch="false"
        >
          Sign in
        </a>
      )}
    </div>
  );
}
