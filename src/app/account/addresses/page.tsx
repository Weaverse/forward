import type { Metadata } from "next";

import { SurfaceShell } from "@/components/surface-shell";

export const metadata: Metadata = {
  title: "Addresses",
  description: "Your saved Forward shipping addresses.",
};

export default function AddressesPage() {
  return (
    <SurfaceShell
      eyebrow="Account"
      title="Addresses"
      description="Saved shipping addresses appear here once Customer Account authentication is connected."
      dataDependency="This surface will manage addresses through the Shopify Customer Account API. No address data exists in the foundation slice."
    />
  );
}
