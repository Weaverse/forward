import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountShell } from "@/components/account-shell";
import { storefront } from "@/lib/storefront/data-source";
import { formatDate, formatMoney } from "@/lib/storefront/format";

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { orderId } = await params;
  const order = await storefront.getDemoOrder(orderId);
  if (order === null) {
    return { title: "Order not found" };
  }
  return { title: `Order ${order.number} · Account` };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await params;
  const order = await storefront.getDemoOrder(orderId);
  if (order === null) {
    notFound();
  }

  return (
    <AccountShell
      activePath="/account/orders"
      title={`Order ${order.number}`}
      lede={`Placed ${formatDate(order.placedAt)} · ${order.statusDetail}.`}
    >
      <ul className="divide-y divide-mist border-y border-mist">
        {order.lines.map((line) => (
          <li
            key={`${line.productHandle}-${line.colorwayName}-${line.size ?? ""}`}
            className="flex items-start gap-5 py-5"
          >
            <Link href={`/products/${line.productHandle}`} className="shrink-0">
              <Image
                src={line.image.src}
                alt={line.image.alt}
                width={line.image.width}
                height={line.image.height}
                sizes="96px"
                className="aspect-4/5 w-20 border border-mist object-cover"
              />
            </Link>
            <div className="flex-1">
              <h2 className="font-display text-lg text-pine">
                <Link
                  href={`/products/${line.productHandle}`}
                  className="hover:text-clay"
                >
                  {line.title}
                </Link>
              </h2>
              <p className="field-label mt-1 text-slate">
                {line.colorwayName}
                {line.size !== undefined ? ` · ${line.size}` : ""} · qty{" "}
                {line.quantity}
              </p>
            </div>
            <p className="field-label text-ink">
              {formatMoney({
                amount: line.unitPrice.amount * line.quantity,
                currencyCode: "USD",
              })}
            </p>
          </li>
        ))}
      </ul>

      <dl className="ml-auto mt-6 max-w-xs space-y-2 text-sm text-slate">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="text-ink">{formatMoney(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd className="text-ink">
            {order.shipping.amount === 0 ? "Free" : formatMoney(order.shipping)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-mist pt-3 font-display text-lg text-ink">
          <dt>Total</dt>
          <dd>{formatMoney(order.total)}</dd>
        </div>
      </dl>

      <Link
        href="/account/orders"
        className="field-label mt-8 inline-flex min-h-11 items-center text-clay hover:text-clay-deep"
      >
        ← All orders
      </Link>
    </AccountShell>
  );
}
