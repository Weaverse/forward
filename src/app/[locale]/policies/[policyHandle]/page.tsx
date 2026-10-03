import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCustomerAccountRuntime } from "@/lib/account/customer-account";
import { marketAlternates } from "@/lib/i18n/alternates";
import { DEFAULT_LOCALE, parseLocale } from "@/lib/i18n/locales";
import { getTranslator } from "@/lib/i18n/translator";
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
    const t = await getTranslator(locale);
    return { title: t("meta.policyNotFound") };
  }
  return {
    title: policy.title,
    ...(policy.summary === "" ? {} : { description: policy.summary }),
    alternates: marketAlternates(`/policies/${policyHandle}`, locale),
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { locale: segment, policyHandle } = await params;
  const locale = parseLocale(segment) ?? DEFAULT_LOCALE;
  const [policy, allPolicies, t] = await Promise.all([
    getStorefront(locale).getPolicy(policyHandle),
    getStorefront(locale).listPolicies(),
    getTranslator(locale),
  ]);
  if (policy === null) {
    notFound();
  }
  const accountEnabled = getCustomerAccountRuntime() !== null;

  return (
    <>
      <IndexHeader
        eyebrowLabel={t("policy.eyebrow")}
        heading={policy.title}
        lede={policy.summary}
      />

      <PolicyDocument
        policy={policy}
        allPolicies={allPolicies}
        accountEnabled={accountEnabled}
        locale={locale}
        t={t}
      />
    </>
  );
}
