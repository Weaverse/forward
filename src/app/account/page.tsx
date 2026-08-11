import type { Metadata } from "next";
import Link from "next/link";

import { AccountAccessPanel } from "@/components/account-access";
import { AccountShell } from "@/components/account-shell";
import {
  hasRefreshMarker,
  readAccountProfile,
  readAccountSession,
} from "@/lib/account/account-view";
import { ACCOUNT_RECENT_ORDER_LIMIT } from "@/lib/account/queries";
import { formatDate } from "@/lib/storefront/format";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Account",
  description: "Your Forward account overview.",
  robots: { index: false, follow: false },
};

const ACCOUNT_PATH = "/account";

interface AccountPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Account overview — the canonical account header, `.order-table` history, and
 * bordered `.account-grid` blocks, filled from the Customer Account API.
 */
export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const session = await readAccountSession({
    path: ACCOUNT_PATH,
    refreshed: hasRefreshMarker(params),
  });

  if (session.status !== "authenticated") {
    return (
      <AccountShell
        activePath={ACCOUNT_PATH}
        title="The state of your kit."
        lede="Recent orders, where they ship, and the standing repairs offer — in one quiet place."
      >
        <AccountAccessPanel
          path={ACCOUNT_PATH}
          session={session}
          loginFailed={params.login === "failed"}
        />
      </AccountShell>
    );
  }

  const profile = await readAccountProfile(session, ACCOUNT_RECENT_ORDER_LIMIT);
  const defaultAddress = profile.addresses.find((address) => address.isDefault);

  return (
    <AccountShell
      activePath={ACCOUNT_PATH}
      title="The state of your kit."
      lede="Recent orders, where they ship, and the standing repairs offer — in one quiet place."
      signedIn
    >
      <div className="account-header">
        <p className="eyebrow">{profile.displayName}</p>
        <h2 className="h2">Recent orders</h2>
      </div>
      {profile.orders.length > 0 ? (
        <table className="order-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {profile.orders.map((order) => (
              <tr key={order.number}>
                <td data-label="Order">
                  <strong>
                    <Link href={order.href}>{order.name}</Link>
                  </strong>
                </td>
                <td data-label="Date">
                  {formatDate(order.processedAt.slice(0, 10))}
                </td>
                <td data-label="Status">
                  <span className="order-status">{order.status}</span>
                </td>
                <td data-label="Total">{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="muted">No orders on record yet.</p>
      )}

      <div className="account-grid">
        <article className="account-block">
          <p className="eyebrow">Repair desk</p>
          <h3>Keep good gear moving.</h3>
          <p className="muted">
            Anything bought from Forward can come back for repair — defects
            free, everything else at an honest quoted cost.
          </p>
          <Link className="button" href="/pages/repairs">
            The repairs programme
          </Link>
        </article>
        <article className="account-block">
          <p className="eyebrow">Default trailhead</p>
          {defaultAddress !== undefined ? (
            <>
              <h3>{profile.displayName}</h3>
              <address>
                {defaultAddress.lines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </address>
            </>
          ) : (
            <p className="muted">No addresses saved.</p>
          )}
        </article>
      </div>
    </AccountShell>
  );
}
