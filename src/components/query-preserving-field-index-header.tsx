"use client";

import { useSearchParams } from "next/navigation";

import {
  FieldIndexHeader,
  type FieldIndexHeaderProps,
} from "@/components/field-index-header";

/** Reads route query state inside the SiteHeader Suspense boundary. */
export function QueryPreservingFieldIndexHeader(props: FieldIndexHeaderProps) {
  return (
    <FieldIndexHeader {...props} queryString={useSearchParams().toString()} />
  );
}
