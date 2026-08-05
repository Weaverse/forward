import type { Metadata } from "next";

import { SurfaceShell } from "@/components/surface-shell";
import { formatHandle } from "@/lib/shell-fixtures";

interface StorePageProps {
  params: Promise<{ pageHandle: string }>;
}

export async function generateMetadata({
  params,
}: StorePageProps): Promise<Metadata> {
  const { pageHandle } = await params;
  return { title: formatHandle(pageHandle) };
}

export default async function StorePage({ params }: StorePageProps) {
  const { pageHandle } = await params;
  return (
    <SurfaceShell
      eyebrow="Store page"
      title={formatHandle(pageHandle)}
      description="Rich store-page content arrives with live Shopify page data and Weaverse section composition."
      dataDependency={`This surface will resolve the “${pageHandle}” page from the Shopify Online Store pages API and render Weaverse-composed sections in a later slice.`}
    />
  );
}
