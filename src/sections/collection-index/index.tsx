"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n/t";
import type { Collection } from "@/lib/storefront/types";
import { CollectionCard } from "../collection-card";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface CollectionIndexProps extends WeaverseElementProps {
  children?: ReactNode;
  /** Resolved by `./loader` from the merchant's collection selection. */
  loaderData?: { collections: readonly Collection[] };
}

/** Full-height collection cards, one per movement system. */
function CollectionIndex({
  children,
  loaderData,
  ...rest
}: CollectionIndexProps) {
  const t = useT();
  const collections = loaderData?.collections ?? [];
  return (
    <section
      {...elementAttributes(rest)}
      className="bg-ink pt-20 text-text-inverse"
    >
      <header className="mx-auto w-full max-w-page px-page-gutter pb-11">
        {children}
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard
            collection={collection}
            key={collection.handle}
            linkLabel={t("sections.shopSystem")}
          />
        ))}
      </div>
    </section>
  );
}

export default CollectionIndex;

export { schema } from "./schema";
