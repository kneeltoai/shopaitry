'use client'

import { useState } from 'react'
import StatusBadge from '@/components/StatusBadge'

interface PinCardData {
  id: number
  url: string
  title: string
  image_url: string | null
  status: string
  board_id: number | null
  price: number | null
  currency: string
}

interface PinCardProps {
  card: PinCardData
  onDelete: (id: number) => void
  onStatusChange: (id: number, newStatus: string) => void
  onEdit: (id: number) => void
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

const DARK_COLORS = ['#dde3f5', '#d5e8dd', '#f5dde3', '#e8d5f5', '#ddf0f5']

function pickColor(): string {
  return DARK_COLORS[Math.floor(Math.random() * DARK_COLORS.length)]
}

const SCRAPE_FAILURE_PATTERNS = ['access denied', 'robot check', '403', 'forbidden', 'just a moment', 'attention required']

function isScrapingFailure(title: string): boolean {
  const lower = title.toLowerCase()
  return SCRAPE_FAILURE_PATTERNS.some((p) => lower.includes(p))
}

function FallbackCard({
  hostname,
  title,
  onClick,
}: {
  hostname: string
  title: string
  onClick: () => void
}) {
  return (
    <div
      className="w-full min-h-[200px] flex flex-col items-center justify-center px-4 py-6 gap-2 cursor-pointer brightness-100 group-hover:brightness-75 transition-all duration-200"
      style={{ backgroundColor: pickColor() }}
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=48`}
        alt=""
        className="w-12 h-12"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <span className="text-xs" style={{ color: '#666' }}>{hostname}</span>
      <p className="text-base font-bold text-center line-clamp-3 leading-snug" style={{ color: '#333' }}>
        {title}
      </p>
    </div>
  )
}

export default function PinCard({ card, onDelete, onStatusChange, onEdit }: PinCardProps) {
  const hostname = getHostname(card.url)
  const openUrl = () => window.open(card.url, '_blank', 'noopener,noreferrer')

  return (
    <div className="break-inside-avoid mb-2 group">
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="relative overflow-hidden">
          <ImageOrFallback
            key={card.image_url ?? 'no-image'}
            imageUrl={card.image_url}
            hostname={hostname}
            title={card.title}
            openUrl={openUrl}
          />


          {/* 편집 버튼 — 삭제 버튼 왼쪽, hover 시 표시 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(card.id)
            }}
            className="absolute top-2 right-9 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100 max-sm:opacity-100"
            aria-label="편집"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5a1.414 1.414 0 012 2L3.5 10.5l-3 .5.5-3 7.5-6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 삭제 버튼 — 우측 상단 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(card.id)
            }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-white transition-all opacity-0 group-hover:opacity-100 max-sm:opacity-100"
            aria-label="삭제"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* 가격 오버레이 — 좌측 하단 */}
          {card.price !== null && (
            <div className="absolute bottom-2 left-2 pointer-events-none">
              <span
                className="text-lg font-bold text-white"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)' }}
              >
                {card.price.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ImageOrFallback({
  imageUrl,
  hostname,
  title,
  openUrl,
}: {
  imageUrl: string | null
  hostname: string
  title: string
  openUrl: () => void
}) {
  const [useFallback, setUseFallback] = useState(!imageUrl)

  if (!useFallback && imageUrl) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="w-full block cursor-pointer brightness-100 group-hover:brightness-75 transition-all duration-200"
          onClick={openUrl}
          onError={() => setUseFallback(true)}
        />
      </>
    )
  }

  return <FallbackCard hostname={hostname} title={title} onClick={openUrl} />
}
