"use client";

import { cva } from "class-variance-authority";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Children, type ReactNode, Suspense, useEffect } from "react";

import {
  COLORWAY_PARAM,
  optionParamKey,
  productSelectionHref,
  resolveProductSelection,
} from "@/lib/storefront/product-state";
import type { Product } from "@/lib/storefront/types";
import { useStorefrontContext } from "@/lib/weaverse/data-context";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";
import ProductBreadcrumb from "./breadcrumb";
import ProductBuyButtons from "./buy-buttons";
import ProductCollapsibleDetails from "./collapsible-details";
import { type GalleryPosition, MainProductContext } from "./context";
import ProductInfo from "./info";
import ProductMedia from "./media";
import ProductMeta from "./meta";
import ProductPrices from "./prices";
import ProductSummary from "./summary";
import ProductTitle from "./title";
import ProductVariantSelector from "./variant-selector";

type PanelWidth = "standard" | "wide";

const grid = cva("grid min-h-[80vh] grid-cols-1 bg-ink", {
  variants: {
    position: { left: "", right: "" },
    panelWidth: { standard: "", wide: "" },
  },
  compoundVariants: [
    {
      position: "right",
      className: "md:grid-cols-[minmax(360px,0.88fr)_minmax(0,1.12fr)]",
    },
    {
      position: "right",
      panelWidth: "standard",
      className: "lg:grid-cols-[minmax(420px,0.72fr)_minmax(0,1.28fr)]",
    },
    {
      position: "left",
      className: "md:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]",
    },
    {
      position: "left",
      panelWidth: "standard",
      className: "lg:grid-cols-[minmax(0,1.28fr)_minmax(420px,0.72fr)]",
    },
  ],
  defaultVariants: { position: "right", panelWidth: "standard" },
});

interface MainProductProps extends WeaverseElementProps {
  children?: ReactNode;
  galleryPosition?: GalleryPosition;
  panelWidth?: PanelWidth;
}

/**
 * The product buy block, composed from `mp--media` and `mp--info`.
 *
 * The shell owns what its children share: the `colorway`/option query state,
 * resolved into one selection every child reads through `MainProductContext`,
 * and the two-column grid they sit in. Cart logic stays in `AddToCartForm`.
 *
 * A product URL must never lose its gallery, selection and add to cart, so a
 * section with no children — the route's own fallback, or a template seeded
 * before the block was split — renders the default composition.
 */
function MainProduct({
  children,
  galleryPosition,
  panelWidth,
  ...rest
}: MainProductProps) {
  const { product } = useStorefrontContext();
  if (product === undefined) return null;
  const position = galleryPosition ?? "right";
  const content =
    Children.count(children) > 0 ? children : <DefaultComposition />;

  return (
    <div
      {...elementAttributes(rest)}
      className={grid({ position, panelWidth })}
    >
      <Suspense
        fallback={
          <MainProductContext
            value={{
              product,
              selection: resolveProductSelection(product, undefined),
              currentParams: new URLSearchParams(),
              galleryPosition: position,
            }}
          >
            {content}
          </MainProductContext>
        }
      >
        <UrlSelection product={product} galleryPosition={position}>
          {content}
        </UrlSelection>
      </Suspense>
    </div>
  );
}

function requestedOptions(
  product: Product,
  params: URLSearchParams,
): Readonly<Record<string, string | undefined>> {
  return Object.fromEntries(
    product.options.map((option) => [
      option.name,
      params.get(optionParamKey(option.name)) ?? undefined,
    ]),
  );
}

/**
 * Resolves the selection from the URL and rewrites an incomplete or invalid
 * one to its canonical form, keeping unrelated query params.
 */
function UrlSelection({
  product,
  galleryPosition,
  children,
}: {
  product: Product;
  galleryPosition: GalleryPosition;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selection = resolveProductSelection(
    product,
    searchParams.get(COLORWAY_PARAM) ?? undefined,
    requestedOptions(product, searchParams),
  );
  const canonicalHref = productSelectionHref(
    product,
    selection.colorway.id,
    selection.selectedOptions,
    searchParams,
  );

  useEffect(() => {
    const query = searchParams.toString();
    const current = `${pathname}${query === "" ? "" : `?${query}`}`;
    if (current !== canonicalHref)
      router.replace(canonicalHref, { scroll: false });
  }, [canonicalHref, pathname, router, searchParams]);

  return (
    <MainProductContext
      value={{
        product,
        selection,
        currentParams: searchParams,
        galleryPosition,
      }}
    >
      {children}
    </MainProductContext>
  );
}

/** What the section renders when it has no children of its own. */
function DefaultComposition() {
  return (
    <>
      <ProductMedia />
      <ProductInfo>
        <ProductBreadcrumb />
        <ProductMeta />
        <ProductTitle />
        <ProductPrices />
        <ProductSummary />
        <ProductVariantSelector />
        <ProductBuyButtons />
        <ProductCollapsibleDetails />
      </ProductInfo>
    </>
  );
}

export default MainProduct;

export { schema } from "./schema";
