'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

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

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSendLink = async () => {
    const trimmed = email.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendLink()
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
          🔖
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800">Shopaitry</h1>
          <p className="text-sm text-slate-500 mt-1">마음에 드는 링크를 저장하세요</p>
        </div>

        {sent ? (
          <div className="w-full text-center bg-slate-50 rounded-xl px-5 py-4">
            <p className="text-sm font-medium text-slate-700">메일을 확인해 주세요</p>
            <p className="text-xs text-slate-400 mt-1">{email}으로 로그인 링크를 보냈어요</p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline"
            >
              다른 이메일로 다시 시도
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="이메일 주소 입력"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white transition-colors"
              disabled={loading}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              onClick={handleSendLink}
              disabled={loading || !email.trim()}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '전송 중...' : '로그인 링크 받기'}
            </button>
          </div>
        )}
      </div>
    </main>
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
        <a href={card.url} target="_blank" rel="noopener noreferrer" className="block">
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

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
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
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-semibold text-slate-800 leading-snug hover:text-slate-600 transition-colors line-clamp-2"
              >
                {card.title}
              </a>
            </div>
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
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [cards, setCards] = useState<BookmarkCard[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 인증 상태 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 로그인된 유저의 아이템 로드
  useEffect(() => {
    if (!user) {
      setCards([])
      return
    }

    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('id, url, title, image_url, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load items:', error.message)
        return
      }
      setCards(data ?? [])
    }

    fetchItems()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    const trimmed = input.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/metadata?url=${encodeURIComponent(trimmed)}`)
      const data = await res.json()

      const newItem = {
        user_id: user.id,
        url: data.url || trimmed,
        title: data.title || trimmed,
        image_url: data.image || null,
      }

      const { data: inserted, error: insertError } = await supabase
        .from('items')
        .insert(newItem)
        .select()
        .single()

      if (insertError) throw new Error(insertError.message)

      setCards((prev) => [inserted, ...prev])
      setInput('')
      inputRef.current?.focus()
    } catch (err) {
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </main>
    )
  }

  if (!user) return <LoginScreen />

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">🔖 Shopaitry</h1>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="w-7 h-7 rounded-full"
                />
              )}
              <span className="text-xs text-slate-500 hidden sm:block">
                {user.user_metadata?.full_name ?? user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>

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
              ) : '저장'}
            </button>
          </div>

          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
      </header>

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
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {cards.map((card) => (
                <BookmarkCardItem key={card.id} card={card} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
