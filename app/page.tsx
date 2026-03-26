'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import StatusBadge from '@/components/StatusBadge'
import BoardSelector from '@/components/BoardSelector'
import ItemThumbnail from '@/components/ItemThumbnail'
import PinCard from '@/components/PinCard'
import MasonryGrid from '@/components/MasonryGrid'
import EditModal from '@/components/EditModal'
import LoginScreen from '@/components/LoginScreen'

interface BookmarkCard {
  id: number
  url: string
  title: string
  image_url: string | null
  status: string
  board_id: number | null
  price: number | null
  currency: string
  price_raw: string | null
  created_at?: string
}

interface Board {
  id: number
  name: string
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}


function BookmarkCardItem({
  card,
  onDelete,
  onStatusChange,
}: {
  card: BookmarkCard
  onDelete: (id: number) => void
  onStatusChange: (id: number, newStatus: string) => void
}) {
  return (
    <div className="break-inside-avoid mb-4 group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
        <a href={card.url} target="_blank" rel="noopener noreferrer" className="block">
          <div className="relative w-full aspect-video bg-slate-50 overflow-hidden">
            <ItemThumbnail
              imageUrl={card.image_url}
              hostname={getHostname(card.url)}
              title={card.title}
            />
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
              <div className="mt-2">
                <StatusBadge
                  itemId={card.id}
                  status={card.status}
                  onStatusChange={(newStatus) => onStatusChange(card.id, newStatus)}
                />
              </div>
            </div>
            <button
              onClick={() => onDelete(card.id)}
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-0 max-sm:opacity-100"
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
  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null)
  const [editingCard, setEditingCard] = useState<BookmarkCard | null>(null)
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

  // 보드 로드
  useEffect(() => {
    if (!user) {
      setBoards([])
      return
    }

    const fetchBoards = async () => {
      const { data, error } = await supabase
        .from('boards')
        .select('id, name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Failed to load boards:', error.message)
        return
      }
      if (data?.[0]) {
        console.log('[fetchBoards] first board id:', data[0].id, '| typeof:', typeof data[0].id)
      }
      setBoards(data ?? [])
    }

    fetchBoards()
  }, [user])

  // 아이템 로드 (보드 필터 포함)
  useEffect(() => {
    if (!user) {
      setCards([])
      return
    }

    const fetchItems = async () => {
      console.log('[fetchItems] selectedBoardId:', selectedBoardId)

      let query = supabase
        .from('items')
        .select('id, url, title, image_url, status, board_id, price, currency, price_raw, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (typeof selectedBoardId === 'number') {
        console.log('[fetchItems] applying board filter:', selectedBoardId)
        query = query.eq('board_id', selectedBoardId)
      }

      const { data, error } = await query

      console.log('[fetchItems] result count:', data?.length ?? 0, error ? `error: ${error.message}` : '')

      if (error) {
        console.error('Failed to load items:', error.message)
        setCards([])
        return
      }
      setCards(data ?? [])
    }

    fetchItems()
  }, [user, selectedBoardId])

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
        board_id: selectedBoardId,
        status: 'wish',
        price: data.price ?? null,
        currency: data.currency ?? 'KRW',
        price_raw: data.priceRaw ?? null,
      }

      const { data: inserted, error: insertError } = await supabase
        .from('items')
        .insert(newItem)
        .select()
        .single()

      if (insertError) throw new Error(insertError.message)

      // price_history 첫 기록 삽입
      if (inserted.price !== null && inserted.price !== undefined) {
        await supabase.from('price_history').insert({
          item_id: inserted.id,
          price: inserted.price,
          currency: inserted.currency ?? 'KRW',
        })
        // price_history 실패는 아이템 저장에 영향 안 줌
      }

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

  const handleDelete = async (id: number) => {
    if (!confirm('이 아이템을 삭제할까요?')) return

    const deletedCard = cards.find((c) => c.id === id)
    setCards((prev) => prev.filter((c) => c.id !== id)) // 낙관적 업데이트

    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Failed to delete item:', deleteError.message)
      if (deletedCard) {
        setCards((prev) =>
          [deletedCard, ...prev].sort(
            (a, b) =>
              new Date(b.created_at ?? '').getTime() -
              new Date(a.created_at ?? '').getTime()
          )
        )
      }
    }
  }

  const handleStatusChange = (id: number, newStatus: string) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)))
  }

  const handleEdit = (id: number) => {
    const card = cards.find((c) => c.id === id)
    if (card) setEditingCard(card)
  }

  const handleEditSave = async (
    id: number,
    updates: { title: string; price: number | null; image_url: string | null }
  ) => {
    const { error: updateError } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update item:', updateError.message)
      return
    }

    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
    setEditingCard(null)
  }

  const handleCreateBoard = async (name: string) => {
    if (!user) return

    const { data, error } = await supabase
      .from('boards')
      .insert({ name, user_id: user.id })
      .select()
      .single()

    if (error) {
      console.error('Failed to create board:', error.message)
      return
    }

    setBoards((prev) => [...prev, data])
    setSelectedBoardId(data.id)
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
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">🔖 Shopaitry</h1>
            <div className="flex items-center gap-3">
              {user.user_metadata?.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="w-7 h-7 rounded-full"
                />
              )}
              <span className="text-xs text-slate-500 hidden sm:block">
                {user.user_metadata?.full_name ?? user.email}
              </span>
              <Link
                href="/settings"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                설정
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>

          <BoardSelector
            boards={boards}
            selectedBoardId={selectedBoardId}
            onSelectBoard={setSelectedBoardId}
            onCreateBoard={handleCreateBoard}
          />

          <div className="flex gap-2 mt-3">
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

      {editingCard && (
        <EditModal
          card={editingCard}
          onSave={handleEditSave}
          onClose={() => setEditingCard(null)}
        />
      )}

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
            <p className="text-xs text-slate-400 mb-4">{cards.length}개의 링크</p>
            <MasonryGrid>
              {cards.map((card) => (
                <PinCard
                  key={card.id}
                  card={card}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                />
              ))}
            </MasonryGrid>
          </>
        )}
      </div>
    </main>
  )
}
