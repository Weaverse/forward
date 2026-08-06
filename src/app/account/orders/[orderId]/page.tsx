import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountShell } from "@/components/account-shell";
import { storefront } from "@/lib/storefront/data-source";
import { formatDate, formatMoney } from "@/lib/storefront/format";
import { productColorwayHref } from "@/lib/storefront/product-state";
import type { DemoOrderLine } from "@/lib/storefront/types";

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const orders = await storefront.listDemoOrders();
  return orders.map((order) => ({ orderId: order.id }));
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

/** Deep link back to the exact ordered colorway of a line's product. */
async function orderLineHref(line: DemoOrderLine): Promise<string> {
  const product = await storefront.getProduct(line.productHandle);
  if (product === null) {
    return `/products/${line.productHandle}`;
  }
  return productColorwayHref(product, line.colorwayId);
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await params;
  const [order, addresses] = await Promise.all([
    storefront.getDemoOrder(orderId),
    storefront.listDemoAddresses(),
  ]);
  if (order === null) {
    notFound();
  }
  const lines = await Promise.all(
    order.lines.map(async (line) => ({
      line,
      href: await orderLineHref(line),
    })),
  );
  const deliveryAddress =
    addresses.find((entry) => entry.isDefault) ?? addresses[0];

  return (
    <AccountShell
      activePath="/account/orders"
      eyebrow="Field account / Order"
      title={order.number}
      lede={`Placed ${formatDate(order.placedAt)}. Repair coverage remains available for the useful life of each product.`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="field-label text-pine">{order.statusDetail}</p>
        <Link
          href="/account/orders"
          className="field-label inline-flex min-h-11 items-center gap-2 text-carbon hover:text-pine"
        >
          Back to orders →
        </Link>
      </div>

      <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
        {lines.map(({ line, href }) => (
          <li
            key={`${line.productHandle}-${line.colorwayId}-${line.size ?? ""}`}
            className="flex items-start gap-6 py-6"
          >
            <Link href={href} className="shrink-0">
              <Image
                src={line.image.src}
                alt={line.image.alt}
                width={line.image.width}
                height={line.image.height}
                sizes="112px"
                className="aspect-4/5 w-24 border border-hairline object-cover sm:w-28"
              />
            </Link>
            <div className="flex-1">
              <h2 className="font-display text-2xl text-carbon">
                <Link href={href} className="hover:text-pine">
                  {line.title}
                </Link>
              </h2>
              <p className="field-label mt-2 text-slate">
                {line.colorwayName}
                {line.size !== undefined ? ` · ${line.size}` : ""} · Qty{" "}
                {line.quantity}
              </p>
            </div>
            <p className="text-sm text-carbon">
              {formatMoney({
                amount: line.unitPrice.amount * line.quantity,
                currencyCode: "USD",
              })}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-carbon/30 px-6 py-6">
          <h2 className="field-label text-pine">Delivery address</h2>
          {deliveryAddress !== undefined ? (
            <address className="mt-3 not-italic">
              <p className="font-display text-2xl text-carbon">
                {deliveryAddress.name}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                {deliveryAddress.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </address>
          ) : (
            <p className="mt-3 text-sm text-slate">No address on record.</p>
          )}
        </section>

        <section className="border border-carbon/30 px-6 py-6">
          <h2 className="field-label text-pine">Order total</h2>
          <dl className="mt-4 space-y-3 text-sm text-slate">
            <div className="flex justify-between border-b border-hairline pb-3">
              <dt>Subtotal</dt>
              <dd className="text-carbon">{formatMoney(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between border-b border-hairline pb-3">
              <dt>Delivery</dt>
              <dd className="text-carbon">
                {order.shipping.amount === 0
                  ? "Complimentary"
                  : formatMoney(order.shipping)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between pt-1 font-display text-2xl text-carbon">
              <dt>Total</dt>
              <dd>{formatMoney(order.total)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </AccountShell>
  );
}
