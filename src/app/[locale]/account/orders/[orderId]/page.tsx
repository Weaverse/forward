import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountAccessPanel } from "@/components/account-access";
import { OrderThumbnail, StatusBadge } from "@/components/account-orders";
import { AccountShell } from "@/components/account-shell";
import { Link } from "@/components/link";
import {
  hasRefreshMarker,
  readAccountOrder,
  readAccountSession,
} from "@/lib/account/account-view";
import { cn } from "@/lib/cn";
import { localizePath } from "@/lib/i18n/locales";
import { routeLocale } from "@/lib/i18n/route-locale";
import { getTranslator, translatedMetadata } from "@/lib/i18n/translator";
import { eyebrow, textLink } from "@/lib/presentation/variants";
import { formatDate } from "@/lib/storefront/format";

/**
 * An order is an authenticated per-customer resource: never prerendered, never
 * cached, and never enumerated into build-time route parameters.
 */
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export function generateMetadata({
  params,
}: Pick<OrderPageProps, "params">): Promise<Metadata> {
  return translatedMetadata(params, {
    title: "account.meta.orderTitle",
    description: "account.meta.orderDescription",
    robots: { index: false, follow: false },
  });
}

interface OrderPageProps {
  params: Promise<{ locale: string; orderId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const ACCOUNT_BLOCK_CLASS = "border border-ink bg-transparent p-7";
const SUMMARY_ROW_CLASS =
  "flex justify-between gap-5 border-border-subtle border-b py-2.5";
const BACK_LINK_CLASS =
  "mb-8 inline-flex min-h-touch items-center gap-2 font-body text-micro font-bold tracking-control text-text-muted uppercase before:text-copy before:transition-transform before:duration-200 before:content-['←'] hover:text-ink hover:before:-translate-x-1";

function AddressLines({ lines }: { lines: readonly string[] }) {
  return (
    <address className="not-italic">
      {lines.map((line) => (
        <span key={line}>
          {line}
          <br />
        </span>
      ))}
    </address>
  );
}

/**
 * Order detail. A malformed order number, an order belonging to another
 * customer, and an order the API declines all resolve to the same generic 404.
 */
export default async function OrderPage({
  params,
  searchParams,
}: OrderPageProps) {
  const [{ orderId }, search] = await Promise.all([params, searchParams]);
  const locale = await routeLocale(params);
  const t = await getTranslator(locale);
  const path = `/account/orders/${orderId}`;
  const session = await readAccountSession({
    locale,
    path,
    refreshed: hasRefreshMarker(search),
  });

  if (session.status !== "authenticated") {
    return (
      <AccountShell
        activePath="/account/orders"
        t={t}
        eyebrow={t("account.orderEyebrow")}
        title={t("account.orderTitle")}
      >
        <AccountAccessPanel
          t={t}
          path={localizePath(path, locale)}
          session={session}
        />
      </AccountShell>
    );
  }

  const order = await readAccountOrder(session, orderId);
  if (order === null) {
    notFound();
  }

  const placed = formatDate(order.processedAt.slice(0, 10), locale);

  return (
    <AccountShell
      activePath="/account/orders"
      t={t}
      eyebrow={t("account.orderEyebrow")}
      title={order.name}
      signedIn
      heroAside={
        <div className="grid gap-3 md:justify-items-end">
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge status={order.payment} t={t} />
            <StatusBadge status={order.status} t={t} />
          </div>
          <p className="m-0 text-lede leading-lede text-text-dark-lede">
            {t("account.placed", { date: placed })}
          </p>
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link className={BACK_LINK_CLASS} href="/account/orders">
          {t("account.backToOrders")}
        </Link>
        {order.statusPageUrl === null ? null : (
          <a
            className={cn(textLink({ showBorder: false }), "mb-8")}
            href={order.statusPageUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("account.statusPage")}
          </a>
        )}
      </div>

      <section className={ACCOUNT_BLOCK_CLASS} aria-labelledby="order-items">
        <p id="order-items" className={eyebrow()}>
          {t("account.items")}
        </p>
        <ul className="m-0 list-none p-0">
          {order.lines.map((line) => (
            <li
              key={line.id}
              className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2 border-border-subtle border-b py-5 last:border-b-0 last:pb-0 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-x-7"
            >
              <OrderThumbnail image={line.image} />
              <div className="grid gap-1.5">
                <h2 className="m-0 font-heading text-card-title font-semibold">
                  {line.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-caption text-text-muted">
                  {line.variantTitle === null ? null : (
                    <span className="bg-surface-subtle px-2 py-0.5 text-ink">
                      {line.variantTitle}
                    </span>
                  )}
                  {line.sku === null ? null : (
                    <span>{t("account.sku", { sku: line.sku })}</span>
                  )}
                </div>
              </div>
              <div className="col-start-2 text-caption text-text-muted whitespace-nowrap sm:col-start-auto sm:text-copy-sm">
                {line.unitPrice === null
                  ? t("account.quantity", { quantity: line.quantity })
                  : t("account.unitPrice", {
                      price: line.unitPrice,
                      quantity: line.quantity,
                    })}
              </div>
              <div className="col-start-2 font-bold whitespace-nowrap sm:col-start-auto sm:text-right">
                {line.total}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {order.shipments.length === 0 ? null : (
        <section
          className={cn(ACCOUNT_BLOCK_CLASS, "mt-6")}
          aria-labelledby="order-shipments"
        >
          <p id="order-shipments" className={eyebrow()}>
            {t("account.shipments")}
          </p>
          <ul className="m-0 grid list-none gap-4 p-0">
            {order.shipments.map((shipment) => (
              <li
                key={shipment.id}
                className="flex flex-wrap items-center justify-between gap-3 border-border-subtle border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="grid gap-1">
                  <strong>
                    {t("account.shippedOn", {
                      date: formatDate(shipment.shippedAt.slice(0, 10), locale),
                    })}
                  </strong>
                  {shipment.estimatedDeliveryAt === null ? null : (
                    <span className="text-caption text-text-muted">
                      {t("account.estimatedDelivery", {
                        date: formatDate(
                          shipment.estimatedDeliveryAt.slice(0, 10),
                          locale,
                        ),
                      })}
                    </span>
                  )}
                  {shipment.trackingNumber === null ? null : (
                    <span className="text-caption text-text-muted">
                      {[shipment.carrier, shipment.trackingNumber]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  )}
                </div>
                {shipment.trackingUrl === null ? null : (
                  <a
                    className={textLink({ showBorder: false })}
                    href={shipment.trackingUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t("account.trackShipment")}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <article className={ACCOUNT_BLOCK_CLASS}>
          <p className={eyebrow()}>{t("account.deliveryAddress")}</p>
          {order.shippingAddress === null ? (
            <p className="text-text-muted">{t("account.noDeliveryAddress")}</p>
          ) : (
            <AddressLines lines={order.shippingAddress} />
          )}
          {order.billingAddress === null ? null : (
            <>
              <p className={cn(eyebrow(), "mt-7")}>
                {t("account.billingAddress")}
              </p>
              <AddressLines lines={order.billingAddress} />
            </>
          )}
        </article>
        <article className={ACCOUNT_BLOCK_CLASS}>
          <p className={eyebrow()}>{t("account.orderTotal")}</p>
          {order.subtotal === null ? null : (
            <div className={SUMMARY_ROW_CLASS}>
              <span>{t("account.subtotal")}</span>
              <span>{order.subtotal}</span>
            </div>
          )}
          {order.shipping === null ? null : (
            <div className={SUMMARY_ROW_CLASS}>
              <span>{t("account.delivery")}</span>
              <span>{order.shipping}</span>
            </div>
          )}
          {order.tax === null ? null : (
            <div className={SUMMARY_ROW_CLASS}>
              <span>{t("account.tax")}</span>
              <span>{order.tax}</span>
            </div>
          )}
          <div
            className={cn(
              SUMMARY_ROW_CLASS,
              "border-b-0 pt-5 pb-0 font-heading text-heading-4",
            )}
          >
            <span>{t("account.columns.total")}</span>
            <strong>{order.total}</strong>
          </div>
        </article>
      </div>
    </AccountShell>
  );
}
