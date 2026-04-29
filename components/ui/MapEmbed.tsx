interface MapEmbedProps {
  address: string
}

export default function MapEmbed({ address }: MapEmbedProps) {
  if (!address) return null
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-sm aspect-video">
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`${address}の地図`}
      />
    </div>
  )
}
