import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCustomerAccountRuntime } from "@/lib/account/customer-account";
import { DEFAULT_LOCALE, parseLocale } from "@/lib/i18n/locales";
import { getStorefront } from "@/lib/storefront/data-source";
import { IndexHeader } from "@/sections/index-header";
import { PolicyDocument } from "@/sections/policy-document";

interface PolicyPageProps {
  params: Promise<{ locale: string; policyHandle: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const locale = parseLocale(params.locale) ?? DEFAULT_LOCALE;
  const policies = await getStorefront(locale).listPolicies();
  return policies.map((policy) => ({ policyHandle: policy.handle }));
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { locale: segment, policyHandle } = await params;
  const locale = parseLocale(segment) ?? DEFAULT_LOCALE;
  const policy = await getStorefront(locale).getPolicy(policyHandle);
  if (policy === null) {
    return { title: "Policy not found" };
  }
  return {
    title: policy.title,
    ...(policy.summary === "" ? {} : { description: policy.summary }),
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { locale: segment, policyHandle } = await params;
  const locale = parseLocale(segment) ?? DEFAULT_LOCALE;
  const [policy, allPolicies] = await Promise.all([
    getStorefront(locale).getPolicy(policyHandle),
    getStorefront(locale).listPolicies(),
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
