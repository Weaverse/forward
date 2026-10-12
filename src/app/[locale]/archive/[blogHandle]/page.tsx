import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marketAlternates } from "@/lib/i18n/alternates";
import { DEFAULT_LOCALE, parseLocale } from "@/lib/i18n/locales";
import { routeLocale } from "@/lib/i18n/route-locale";
import { getTranslator } from "@/lib/i18n/translator";
import { getStorefront } from "@/lib/storefront/data-source";
import { WeaversePage } from "@/lib/weaverse/page";
import {
  loadWeaversePage,
  type SearchParams,
  weaverseProjectId,
} from "@/lib/weaverse/server";

interface BlogPageProps {
  params: Promise<{ locale: string; blogHandle: string }>;
  searchParams: Promise<SearchParams>;
}

export const dynamicParams = false;

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const locale = parseLocale(params.locale) ?? DEFAULT_LOCALE;
  const blogs = await getStorefront(locale).listBlogs();
  return blogs.map((blog) => ({ blogHandle: blog.handle }));
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale: segment, blogHandle } = await params;
  const locale = parseLocale(segment) ?? DEFAULT_LOCALE;
  const [blog, t] = await Promise.all([
    getStorefront(locale).getBlog(blogHandle),
    getTranslator(locale),
  ]);
  if (blog === null) {
    return {};
  }
  return {
    title: t("meta.blogTitle", { title: blog.title }),
    alternates: marketAlternates(`/archive/${blogHandle}`, locale),
  };
}

/**
 * One Shopify blog.
 *
 * `BLOG` composes the page around the blog's articles; the blog reaches the
 * sections through the shared data context because the route picks it, not a
 * merchant. Articles keep their own `/journal/<article>` address.
 */
export default async function BlogPage(props: BlogPageProps) {
  const { blogHandle } = await props.params;
  const locale = await routeLocale(props.params);
  const [blog, page, projectId] = await Promise.all([
    getStorefront(locale).getBlog(blogHandle),
    loadWeaversePage({
      locale,
      handle: blogHandle,
      pathname: `/archive/${blogHandle}`,
      searchParams: await props.searchParams,
      type: "BLOG",
    }),
    Promise.resolve(weaverseProjectId()),
  ]);
  if (blog === null || page === null || projectId === null) {
    notFound();
  }

  return (
    <WeaversePage data={page} dataContext={{ blog }} projectId={projectId} />
  );
}
