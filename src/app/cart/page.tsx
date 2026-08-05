import type { Metadata } from "next";
import Link from "next/link";

import { SurfaceShell } from "@/components/surface-shell";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your Forward cart.",
};

export default function CartPage() {
  return (
    <SurfaceShell
      eyebrow="Cart"
      title="Your cart"
      description="Line items, totals, and checkout arrive with live cart mutations."
      dataDependency="This surface will read and mutate a Shopify cart. No cart state exists in the foundation slice, so the empty state below is the only state."
    >
      <div className="max-w-xl border border-mist bg-parchment px-6 py-10 text-center">
        <p className="font-display text-lg font-semibold uppercase tracking-[0.06em] text-pine">
          Nothing packed yet
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          When live commerce lands, items you add will show up here with
          quantities, totals, and a path to checkout.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block bg-clay px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-bone transition-colors hover:bg-clay-deep"
        >
          Browse the shop
        </Link>
      </div>
    </SurfaceShell>
  );
}
