import type { Metadata } from "next";
import Link from "next/link";

import { AccountAccessPanel } from "@/components/account-access";
import { AccountShell } from "@/components/account-shell";
import {
  hasRefreshMarker,
  readAccountProfile,
  readAccountSession,
} from "@/lib/account/account-view";
import { ACCOUNT_ORDER_LIMIT } from "@/lib/account/queries";
import { formatDate } from "@/lib/storefront/format";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Order history · Account",
  description: "Your Forward order history.",
  robots: { index: false, follow: false },
};

const ORDERS_PATH = "/account/orders";

interface OrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const ORDER_ROW_CLASS =
  "max-sm:block max-sm:border-border-subtle max-sm:border-b max-sm:py-[15px]";
const ORDER_CELL_CLASS =
  "border-border-subtle border-b px-3 py-[18px] text-left max-sm:block max-sm:border-0 max-sm:px-0 max-sm:py-[3px] max-sm:before:text-[10px] max-sm:before:text-text-muted max-sm:before:uppercase max-sm:before:content-[attr(data-label)_':_']";
const ORDER_HEADING_CLASS =
  "border-border-subtle border-b px-3 pt-0 pb-[18px] text-left text-[10px] text-text-muted tracking-[0.1em] uppercase";

/** Order history on its own private route. */
export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const session = await readAccountSession({
    path: ORDERS_PATH,
    refreshed: hasRefreshMarker(params),
  });

  if (session.status !== "authenticated") {
    return (
      <AccountShell
        activePath={ORDERS_PATH}
        eyebrow="Field account / Order history"
        title="Your recent field orders."
      >
        <AccountAccessPanel path={ORDERS_PATH} session={session} />
      </AccountShell>
    );
  }

  const profile = await readAccountProfile(session, ACCOUNT_ORDER_LIMIT);

  return (
    <AccountShell
      activePath={ORDERS_PATH}
      eyebrow="Field account / Order history"
      title="Your recent field orders."
      lede={`Your ${ACCOUNT_ORDER_LIMIT} most recent orders, newest first.`}
      signedIn
    >
      <div className="mb-[52px]">
        <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
          Recent log
        </p>
        <h2 className="m-0 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading">
          Orders
        </h2>
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
    </AccountShell>
  );
}
