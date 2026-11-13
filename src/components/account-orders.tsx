import Image from "next/image";

import { Link } from "@/components/link";
import type {
  AccountImage,
  AccountOrderSummary,
  AccountStatus,
} from "@/lib/account/account-view";
import { cn } from "@/lib/cn";
import type { LocaleId } from "@/lib/i18n/locales";
import type { ThemeTranslate } from "@/lib/i18n/static-content";
import { formatDate } from "@/lib/storefront/format";

/** Statuses that mean the order needs nothing more from anyone. */
const SETTLED_STATUSES = new Set([
  "account.status.fulfilled",
  "account.payment.paid",
]);

/** One status as a small bordered tag; settled statuses read in signal green. */
export function StatusBadge({
  status,
  t,
}: {
  status: AccountStatus;
  t: ThemeTranslate;
}) {
  const settled = status.key !== null && SETTLED_STATUSES.has(status.key);
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center border px-2 font-body text-micro font-bold tracking-control uppercase",
        settled
          ? "border-signal-strong text-signal-strong"
          : "border-border-subtle text-text-muted",
      )}
    >
      {status.key === null ? status.label : t(status.key)}
    </span>
  );
}

/** A square product thumbnail, or an empty tile when Shopify has no image. */
export function OrderThumbnail({
  image,
  className,
}: {
  image: AccountImage | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative block size-16 shrink-0 overflow-hidden border border-border-subtle bg-media-card",
        className,
      )}
    >
      {image === null ? null : (
        <Image
          className="size-full object-cover"
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="64px"
        />
      )}
    </span>
  );
}

interface AccountOrderListProps {
  orders: readonly AccountOrderSummary[];
  locale: LocaleId;
  t: ThemeTranslate;
}

/**
 * Order history as rows a shopper can scan: what was bought (first item and a
 * count of the rest),
 * when, whether it is paid and shipped, and the total. The whole row opens the
 * order.
 */
export function AccountOrderList({ orders, locale, t }: AccountOrderListProps) {
  if (orders.length === 0) {
    return <p className="text-text-muted">{t("account.noOrders")}</p>;
  }
  return (
    <ul className="m-0 list-none border-border-subtle border-t p-0">
      {orders.map((order) => (
        <li key={order.number} className="border-border-subtle border-b">
          <Link
            href={order.href}
            aria-label={t("account.viewOrder", { name: order.name })}
            className="group grid grid-cols-[4rem_1fr] items-center gap-x-5 gap-y-3 py-5 sm:grid-cols-[4rem_1fr_auto_8rem] sm:gap-x-7"
          >
            {/* One fixed-width thumbnail per row keeps every column aligned. */}
            <span className="relative row-span-2 sm:row-span-1">
              <OrderThumbnail image={order.images[0] ?? null} />
              {order.itemCount > 1 ? (
                <span className="absolute -top-2 -right-2 grid min-w-6 place-items-center bg-ink px-1.5 py-0.5 font-body text-micro font-bold text-text-inverse">
                  +{order.itemCount - 1}
                </span>
              ) : null}
            </span>
            <span className="grid gap-1">
              <span className="font-heading text-card-title font-semibold group-hover:underline">
                {order.name}
              </span>
              <span className="text-caption text-text-muted">
                {formatDate(order.processedAt.slice(0, 10), locale)} ·{" "}
                {t("account.itemCount", { count: order.itemCount })}
              </span>
            </span>
            <span className="col-start-2 flex flex-wrap gap-1.5 sm:col-start-auto sm:justify-end">
              <StatusBadge status={order.payment} t={t} />
              <StatusBadge status={order.status} t={t} />
            </span>
            <span className="col-start-2 font-bold whitespace-nowrap after:ml-3 after:inline-block after:transition-transform after:duration-200 after:content-['→'] group-hover:after:translate-x-1 sm:col-start-auto sm:text-right">
              {order.total}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
