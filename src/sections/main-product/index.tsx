"use client";

import { cva } from "class-variance-authority";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, Suspense, useEffect } from "react";
import { usePathname } from "@/lib/i18n/locale-context";

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
import { type GalleryPosition, MainProductContext } from "./context";

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
            {children}
          </MainProductContext>
        }
      >
        <UrlSelection product={product} galleryPosition={position}>
          {children}
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

export default MainProduct;

export { schema } from "./schema";
