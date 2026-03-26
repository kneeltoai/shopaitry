'use client'

import { useState } from 'react'

interface ItemThumbnailProps {
  imageUrl: string | null
  hostname: string
  title: string
}

const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-violet-600',
  'from-lime-500 to-emerald-600',
]

function pickGradient(hostname: string): string {
  let hash = 0
  for (let i = 0; i < hostname.length; i++) {
    hash = hostname.charCodeAt(i) + ((hash << 5) - hash)
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
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

  const gradient = pickGradient(hostname)
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${gradient} px-4 py-6 gap-2`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=48`}
        alt=""
        className="w-12 h-12"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <span className="text-xs text-white/70">{hostname}</span>
      <p className="text-base font-bold text-white text-center line-clamp-3 leading-snug">
        {title}
      </p>
    </div>
  )
}
