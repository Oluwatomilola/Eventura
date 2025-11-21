interface SeoJsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
  id?: string
}

export function SeoJsonLd({ data, id }: SeoJsonLdProps) {
  const payloads = Array.isArray(data) ? data : [data]

  return (
    <>
      {payloads.map((payload, index) => (
        <script
          key={`${id ?? 'jsonld'}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
        />
      ))}
    </>
  )
}

