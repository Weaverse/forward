import type { Metadata } from "next";

import { SurfaceShell } from "@/components/surface-shell";
import { formatHandle } from "@/lib/shell-fixtures";

interface PolicyPageProps {
  params: Promise<{ policyHandle: string }>;
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { policyHandle } = await params;
  return { title: formatHandle(policyHandle) };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { policyHandle } = await params;
  return (
    <SurfaceShell
      eyebrow="Store policy"
      title={formatHandle(policyHandle)}
      description="Policy text is authored in Shopify and rendered here once live store data is connected."
      dataDependency={`This surface will resolve the “${policyHandle}” policy from the Shopify shop policies API.`}
    />
  );
}
