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

// This static route derives product colorway links from the live catalog.
// Next requires a literal route-segment value; the contract test pins it to the
// shared catalog window.
export const revalidate = 3600;

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

/**
 * Order detail — port of the canonical `orderDetailPage()` (source
 * `app.js:320`): status in the page hero, the `.cart-list` line manifest, and
 * the delivery/total `.account-grid` blocks.
 */
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
      heroAside={
        <div>
          <span className="order-status">{order.statusDetail}</span>
          <p className="lede">Placed {formatDate(order.placedAt)}</p>
        </div>
      }
    >
      <Link className="text-link" href="/account/orders">
        Back to orders
      </Link>
      <div className="account-header section-tight">
        <p className="eyebrow">{order.statusDetail}</p>
        <h2 className="h2">Ready for the next route.</h2>
        <p className="lede">
          Repair coverage remains available for the useful life of each product.
        </p>
      </div>

      <div className="cart-list">
        {lines.map(({ line, href }) => (
          <article
            key={`${line.productHandle}-${line.colorwayId}-${line.size ?? ""}`}
            className="cart-line"
          >
            <Link href={href}>
              <Image
                src={line.image.src}
                alt={line.image.alt}
                width={line.image.width}
                height={line.image.height}
                sizes="190px"
              />
            </Link>
            <div>
              <h2>
                <Link href={href}>{line.title}</Link>
              </h2>
              <p className="muted">
                {line.colorwayName}
                {line.size !== undefined ? ` · ${line.size}` : ""} · Qty{" "}
                {line.quantity}
              </p>
            </div>
            <div className="line-price">
              {formatMoney({
                amount: line.unitPrice.amount * line.quantity,
                currencyCode: "USD",
              })}
            </div>
          </article>
        ))}
      </div>

      <div className="account-grid section-tight">
        <article className="account-block">
          <p className="eyebrow">Delivery address</p>
          {deliveryAddress !== undefined ? (
            <>
              <h3>{deliveryAddress.name}</h3>
              <address>
                {deliveryAddress.lines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </address>
            </>
          ) : (
            <p className="muted">No address on record.</p>
          )}
        </article>
        <article className="account-block">
          <p className="eyebrow">Order total</p>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>
              {order.shipping.amount === 0
                ? "Complimentary"
                : formatMoney(order.shipping)}
            </span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <strong>{formatMoney(order.total)}</strong>
          </div>
        </article>
      </div>
    </AccountShell>
  );
}
