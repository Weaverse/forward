"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { textLink } from "@/lib/presentation/variants";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";
import { useMainProduct } from "../context";

const SUMMARY_CLASS =
  "flex min-h-13.5 list-none items-center justify-between font-body text-micro font-medium tracking-control uppercase after:text-copy-lg after:content-['+'] group-open:after:content-['−'] [&::-webkit-details-marker]:hidden";

interface ProductCollapsibleDetailsProps extends WeaverseElementProps {
  openFirst?: boolean;
  showDetails?: boolean;
  detailsTitle?: string;
  showSpecs?: boolean;
  specsTitle?: string;
  showCare?: boolean;
  careTitle?: string;
  showRepair?: boolean;
  repairTitle?: string;
  repairLinkText?: string;
  repairLinkHref?: string;
}

/**
 * The disclosure stack under the buy block, read from the product record.
 *
 * Each panel can be hidden or renamed; a panel whose product data is empty is
 * dropped rather than opening onto nothing.
 */
function ProductCollapsibleDetails({
  openFirst,
  showDetails,
  detailsTitle,
  showSpecs,
  specsTitle,
  showCare,
  careTitle,
  showRepair,
  repairTitle,
  repairLinkText,
  repairLinkHref,
  ...rest
}: ProductCollapsibleDetailsProps) {
  const state = useMainProduct();
  if (state === null) return null;
  const { product } = state;
  const linkText = repairLinkText ?? "The repairs programme";

  const panels: { key: string; title: string; body: ReactNode }[] = [];
  if (showDetails !== false && product.detailParagraphs.length > 0) {
    panels.push({
      key: "details",
      title: detailsTitle || "Why it works",
      body: product.detailParagraphs.map((paragraph) => (
        <p
          className="text-label text-text-dark-muted"
          key={paragraph.slice(0, 32)}
        >
          {paragraph}
        </p>
      )),
    });
  }
  if (showSpecs !== false && product.specs.length > 0) {
    panels.push({
      key: "specs",
      title: specsTitle || "Specifications",
      body: (
        <dl>
          {product.specs.map((row) => (
            <div
              key={row.label}
              className="flex justify-between gap-5 border-border-dark border-b py-2.25 text-caption last:border-b-0"
            >
              <dt className="font-body text-micro text-text-dark-muted tracking-label uppercase">
                {row.label}
              </dt>
              <dd className="m-0 text-right text-text-inverse">{row.value}</dd>
            </div>
          ))}
        </dl>
      ),
    });
  }
  if (showCare !== false && product.care.length > 0) {
    panels.push({
      key: "care",
      title: careTitle || "Materials + care",
      body: (
        <ul className="mt-0 mb-prose-block pl-[1.2em]">
          {product.care.map((entry) => (
            <li className="text-label text-text-muted" key={entry.slice(0, 32)}>
              {entry}
            </li>
          ))}
        </ul>
      ),
    });
  }
  if (showRepair !== false && product.repair !== "") {
    panels.push({
      key: "repair",
      title: repairTitle || "Repair",
      body: (
        <>
          <p className="text-label text-text-dark-muted">{product.repair}</p>
          {linkText === "" ? null : (
            <p>
              <Link
                className={textLink({ tone: "light" })}
                href={repairLinkHref || "/pages/field-repair"}
              >
                {linkText}
              </Link>
            </p>
          )}
        </>
      ),
    });
  }

  return (
    <div
      {...elementAttributes(rest)}
      className="mt-7.5 border-border-dark border-t"
    >
      {panels.map((panel, index) => (
        <details
          className="group border-border-dark border-b"
          key={panel.key}
          open={index === 0 && openFirst !== false}
        >
          <summary className={SUMMARY_CLASS}>{panel.title}</summary>
          {panel.body}
        </details>
      ))}
    </div>
  );
}

export default ProductCollapsibleDetails;

export { schema } from "./schema";
