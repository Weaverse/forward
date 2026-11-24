import { type JsonLd, serializeJsonLd } from "@/lib/seo/structured-data";

/** schema.org structured data for the page, as search engines read it. */
export function JsonLdScript({ data }: { data: JsonLd | readonly JsonLd[] }) {
  return (
    <script
      type="application/ld+json"
      /* Serialized JSON with `<` escaped, never store markup. */
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
