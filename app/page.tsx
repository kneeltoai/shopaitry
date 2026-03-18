'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface BookmarkCard {
  id: string
  url: string
  title: string
  image_url: string | null
  created_at?: string
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function FaviconFallback({ hostname }: { hostname: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="flex flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
          alt=""
          className="w-10 h-10 opacity-60"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <span className="text-xs text-slate-400 font-medium truncate max-w-[120px]">
          {hostname}
        </span>
      </div>
    </div>
  )
}

function BookmarkCardItem({
  card,
  onDelete,
}: {
  card: BookmarkCard
  onDelete: (id: string) => void
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="break-inside-avoid mb-4 group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
        {/* 썸네일 */}
        <a
          href={card.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="relative w-full aspect-video bg-slate-50 overflow-hidden">
            {card.image_url && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.image_url}
                alt={card.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImgError(true)}
              />
            ) : (
              <FaviconFallback hostname={getHostname(card.url)} />
            )}
          </div>
        </a>

        {/* 카드 본문 */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {/* 파비콘 + 도메인 */}
              <div className="flex items-center gap-1.5 mb-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://www.google.com/s2/favicons?domain=${getHostname(card.url)}&sz=16`}
                  alt=""
                  className="w-3.5 h-3.5 flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <span className="text-xs text-slate-400 truncate">{getHostname(card.url)}</span>
              </div>

              {/* 제목 */}
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-semibold text-slate-800 leading-snug hover:text-slate-600 transition-colors line-clamp-2"
              >
                {card.title}
              </a>
            </div>

            {/* 삭제 버튼 */}
            <button
              onClick={() => onDelete(card.id)}
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="삭제"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [cards, setCards] = useState<BookmarkCard[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 초기 로드: Supabase에서 아이템 불러오기
  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('id, url, title, image_url, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load items:', error.message)
        return
      }
      setCards(data ?? [])
    }

    fetchItems()
  }, [])

  const handleSave = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/metadata?url=${encodeURIComponent(trimmed)}`)
      const data = await res.json()

      const newItem = {
        url: data.url || trimmed,
        title: data.title || trimmed,
        image_url: data.image || null,
      }

      const { data: inserted, error: insertError } = await supabase
        .from('items')
        .insert(newItem)
        .select()
        .single()

      if (insertError) {
        console.error('[Supabase insert error]', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        })
        throw new Error(insertError.message)
      }

      setCards((prev) => [inserted, ...prev])
      setInput('')
      inputRef.current?.focus()
    } catch (err) {
      console.error('[handleSave error]', err)
      const msg = err instanceof Error ? err.message : String(err)
      setError(`저장 실패: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave()
  }

  const handleDelete = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Failed to delete item:', deleteError.message)
      return
    }
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">
            🔖 Shopaitry
          </h1>

          {/* URL 입력 */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="url"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white transition-colors"
              disabled={loading}
            />
            <button
              onClick={handleSave}
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  불러오는 중
                </>
              ) : (
                '저장'
              )}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}
        </div>
      </header>

      {/* 카드 그리드 */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
                <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" strokeLinecap="round"/>
                <path d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">저장된 링크가 없어요</p>
            <p className="text-xs text-slate-400 mt-1">URL을 입력하고 저장해 보세요</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-6">{cards.length}개의 링크</p>
            {/* Pinterest 스타일 masonry columns */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {cards.map((card) => (
                <BookmarkCardItem
                  key={card.id}
                  card={card}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
