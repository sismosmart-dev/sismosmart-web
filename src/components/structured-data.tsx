type StructuredDataProps = {
  data: object | object[];
  id: string;
};

export function StructuredData({ data, id }: StructuredDataProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      id={id}
      suppressHydrationWarning
      type="application/ld+json"
    />
  );
}
