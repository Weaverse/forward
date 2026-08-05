import type { Metadata } from "next";

import { SurfaceShell } from "@/components/surface-shell";

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { orderId } = await params;
  return { title: `Order #${decodeURIComponent(orderId)}` };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await params;
  return (
    <SurfaceShell
      eyebrow="Account"
      title={`Order #${decodeURIComponent(orderId)}`}
      description="Line items, fulfillment status, and totals arrive with live order data."
      dataDependency={`This surface will resolve order “${orderId}” from the Shopify Customer Account API after authentication is implemented.`}
    />
  );
}
