import type { Metadata } from "next";
import Link from "next/link";

import { SurfaceShell } from "@/components/surface-shell";
import { SMOKE_FIXTURES } from "@/lib/routes/route-contract";

export const metadata: Metadata = {
  title: "Order history",
  description: "Your Forward order history.",
};

export default function OrdersPage() {
  return (
    <SurfaceShell
      eyebrow="Account"
      title="Order history"
      description="Past orders appear here once Customer Account authentication and order data are connected."
      dataDependency="This surface will list orders from the Shopify Customer Account API. The sample row below is a route-smoke fixture."
    >
      <div className="max-w-2xl border border-mist bg-parchment">
        <Link
          href={`/account/orders/${SMOKE_FIXTURES.orderId}`}
          className="flex items-center justify-between px-5 py-4 text-sm text-pine transition-colors hover:text-clay"
        >
          <span className="font-semibold uppercase tracking-[0.08em]">
            Order #{SMOKE_FIXTURES.orderId}
          </span>
          <span className="text-xs uppercase tracking-[0.12em] text-moss">
            Fixture — view shell
          </span>
        </Link>
      </div>
    </SurfaceShell>
  );
}
