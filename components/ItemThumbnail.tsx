'use client'

import { useState } from 'react'

interface ItemThumbnailProps {
  imageUrl: string | null
  hostname: string
  title: string
}

export default function ItemThumbnail({ imageUrl, hostname, title }: ItemThumbnailProps) {
  // false: og:image 표시 중  true: FallbackCard 표시
  const [useFallback, setUseFallback] = useState(!imageUrl)

  if (!useFallback) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl!}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={() => setUseFallback(true)}
      />
    )
  }

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center px-4 py-6 gap-2"
      style={{ backgroundColor: '#F0F0F0' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=48`}
        alt=""
        className="w-12 h-12"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <span className="text-xs" style={{ color: '#888' }}>{hostname}</span>
      <p className="text-base font-bold text-center line-clamp-3 leading-snug" style={{ color: '#333' }}>
        {title}
      </p>
    </div>
  )
}
