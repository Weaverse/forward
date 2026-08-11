import type { AccountSession } from "@/lib/account/account-view";
import { loginHref } from "@/lib/account/customer-account";

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
    <div className="account-block">
      <p className="eyebrow">Field account</p>
      <h2 className="h2">
        {needsRefresh ? "Continue your session." : "Sign in to continue."}
      </h2>
      <p className="muted">
        {needsRefresh
          ? "Your session needs to be renewed before this page can show your orders."
          : "Orders, addresses, and repair records are only shown to a signed-in customer."}
      </p>
      {loginFailed ? (
        <p className="form-note">Sign-in did not complete. Please try again.</p>
      ) : null}
      {needsRefresh ? (
        <a
          className="button button-primary"
          href={session.href}
          rel="nofollow"
          data-prefetch="false"
        >
          Continue
        </a>
      ) : (
        <a
          className="button button-primary"
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
