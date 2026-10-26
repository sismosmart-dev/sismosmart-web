import { serializeJsonLd } from "@/lib/json-ld-serialize.mjs";

type StructuredDataProps = {
  data: object | object[];
  id: string;
};

export function StructuredData({ data, id }: StructuredDataProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      id={id}
      suppressHydrationWarning
      type="application/ld+json"
    />
  );
}
