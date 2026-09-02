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
import { cta, eyebrow, sectionHeading } from "@/lib/presentation/variants";
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

const ACCOUNT_BLOCK_CLASS =
  "min-h-[280px] border border-ink bg-transparent p-7";
const ORDER_ROW_CLASS =
  "max-sm:block max-sm:border-border-subtle max-sm:border-b max-sm:py-[15px]";
const ORDER_CELL_CLASS =
  "border-border-subtle border-b px-3 py-[18px] text-left max-sm:block max-sm:border-0 max-sm:px-0 max-sm:py-[3px] max-sm:before:text-[10px] max-sm:before:text-text-muted max-sm:before:uppercase max-sm:before:content-[attr(data-label)_':_']";
const ORDER_HEADING_CLASS =
  "border-border-subtle border-b px-3 pt-0 pb-[18px] text-left text-[10px] text-text-muted tracking-[0.1em] uppercase";

/**
 * Account overview — the accepted order history and bordered account blocks,
 * filled from the Customer Account API.
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
      <div className="mb-[52px]">
        <p className={eyebrow()}>{profile.displayName}</p>
        <h2 className={sectionHeading()}>Recent orders</h2>
      </div>
      {profile.orders.length > 0 ? (
        <table className="w-full border-collapse">
          <thead className="max-sm:hidden">
            <tr>
              <th className={ORDER_HEADING_CLASS}>Order</th>
              <th className={ORDER_HEADING_CLASS}>Date</th>
              <th className={ORDER_HEADING_CLASS}>Status</th>
              <th className={ORDER_HEADING_CLASS}>Total</th>
            </tr>
          </thead>
          <tbody>
            {profile.orders.map((order) => (
              <tr className={ORDER_ROW_CLASS} key={order.number}>
                <td className={ORDER_CELL_CLASS} data-label="Order">
                  <strong>
                    <Link href={order.href}>{order.name}</Link>
                  </strong>
                </td>
                <td className={ORDER_CELL_CLASS} data-label="Date">
                  {formatDate(order.processedAt.slice(0, 10))}
                </td>
                <td className={ORDER_CELL_CLASS} data-label="Status">
                  <span className="font-bold text-signal-strong">
                    {order.status}
                  </span>
                </td>
                <td className={ORDER_CELL_CLASS} data-label="Total">
                  {order.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-text-muted">No orders on record yet.</p>
      )}

      <div className="mt-[50px] grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <article className={ACCOUNT_BLOCK_CLASS}>
          <p className={eyebrow()}>Repair desk</p>
          <h3 className="text-balance font-heading text-[26px] font-medium">
            Keep good gear moving.
          </h3>
          <p className="text-text-muted">
            Anything bought from Forward can come back for repair — defects
            free, everything else at an honest quoted cost.
          </p>
          <Link
            className={cta({ intent: "outline" })}
            href="/pages/field-repair"
          >
            The repairs programme
          </Link>
        </article>
        <article className={ACCOUNT_BLOCK_CLASS}>
          <p className={eyebrow()}>Default trailhead</p>
          {defaultAddress !== undefined ? (
            <>
              <h3 className="text-balance font-heading text-[26px] font-medium">
                {profile.displayName}
              </h3>
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
            <p className="text-text-muted">No addresses saved.</p>
          )}
        </article>
      </div>
    </AccountShell>
  );
}
