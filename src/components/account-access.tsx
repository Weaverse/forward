import type { AccountSession } from "@/lib/account/account-view";
import { loginHref } from "@/lib/account/customer-account";

interface AccountAccessPanelProps {
  /** Same-origin path to return to after authentication. */
  path: string;
  session: Exclude<AccountSession, { status: "authenticated" }>;
  /** True for the fixed `/account?login=failed` target. */
  loginFailed?: boolean;
}

const PRIMARY_BUTTON_CLASS =
  "inline-flex min-h-12 items-center justify-center gap-2.5 border border-ink bg-ink px-[22px] py-3 font-body text-[11px] font-bold text-text-inverse tracking-[0.09em] uppercase shadow-[4px_4px_0_var(--color-signal)] [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:shadow-[2px_2px_0_var(--color-signal)] active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-signal focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0";

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
    <div className="min-h-[280px] border border-ink bg-transparent p-7">
      <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
        Field account
      </p>
      <h2 className="m-0 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading">
        {needsRefresh ? "Continue your session." : "Sign in to continue."}
      </h2>
      <p className="text-text-muted">
        {needsRefresh
          ? "Your session needs to be renewed before this page can show your orders."
          : "Orders, addresses, and repair records are only shown to a signed-in customer."}
      </p>
      {loginFailed ? (
        <p className="text-[12px] text-text-dark-muted">
          Sign-in did not complete. Please try again.
        </p>
      ) : null}
      {needsRefresh ? (
        <a
          className={PRIMARY_BUTTON_CLASS}
          href={session.href}
          rel="nofollow"
          data-prefetch="false"
        >
          Continue
        </a>
      ) : (
        <a
          className={PRIMARY_BUTTON_CLASS}
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
