import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCustomerAccountRuntime } from "@/lib/account/customer-account";
import { getStorefront } from "@/lib/storefront/data-source";
import { IndexHeader } from "@/sections/index-header";
import { PolicyDocument } from "@/sections/policy-document";

interface PolicyPageProps {
  params: Promise<{ policyHandle: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const policies = await getStorefront().listPolicies();
  return policies.map((policy) => ({ policyHandle: policy.handle }));
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { policyHandle } = await params;
  const policy = await getStorefront().getPolicy(policyHandle);
  if (policy === null) {
    return { title: "Policy not found" };
  }
  return {
    title: policy.title,
    ...(policy.summary === "" ? {} : { description: policy.summary }),
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { policyHandle } = await params;
  const [policy, allPolicies] = await Promise.all([
    getStorefront().getPolicy(policyHandle),
    getStorefront().listPolicies(),
  ]);
  if (policy === null) {
    notFound();
  }
  const accountEnabled = getCustomerAccountRuntime() !== null;

  return (
    <>
      <IndexHeader
        eyebrowLabel="Support / Policy"
        heading={policy.title}
        lede={policy.summary}
      />

      <PolicyDocument
        policy={policy}
        allPolicies={allPolicies}
        accountEnabled={accountEnabled}
      />
    </>
  );
}
