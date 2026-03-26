'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ApiKeyModal from '@/components/ApiKeyModal'

interface ApiKey {
  id: number
  key_prefix: string
  name: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchKeys = async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, key_prefix, name, created_at, last_used_at, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch API keys:', error.message)
      } else {
        setKeys(data ?? [])
      }
      setLoading(false)
    }

    fetchKeys()
  }, [])

  const handleCreate = async () => {
    const name = newKeyName.trim() || 'Default'
    setCreating(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인 세션이 없습니다. 다시 로그인해 주세요.')

      // 랜덤 키 생성: sk_live_ + 32자 hex
      const randomBytes = new Uint8Array(16)
      crypto.getRandomValues(randomBytes)
      const hex = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      const key = `sk_live_${hex}`
      const keyPrefix = key.slice(0, 16) // "sk_live_XXXXXXXX"

      const keyHash = await sha256Hex(key)

      const { data, error: insertError } = await supabase
        .from('api_keys')
        .insert({ key_hash: keyHash, key_prefix: keyPrefix, name, user_id: user.id })
        .select('id, key_prefix, name, created_at, last_used_at, is_active')
        .single()

      if (insertError) throw new Error(insertError.message)

      setKeys((prev) => [data, ...prev])
      setGeneratedKey(key)
      setNewKeyName('')
      setShowNameInput(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`키 생성 실패: ${msg}`)
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (id: number) => {
    if (!confirm('이 API 키를 비활성화할까요? 이 작업은 되돌릴 수 없습니다.')) return

    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Failed to revoke API key:', error.message)
      return
    }

    setKeys((prev) => prev.filter((k) => k.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">API 키</h2>
          <p className="text-xs text-slate-400 mt-0.5">외부 프로그램이 위시보드를 제어할 수 있는 키입니다</p>
        </div>
        {!showNameInput && (
          <button
            onClick={() => setShowNameInput(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 transition-colors"
          >
            새 키 생성
          </button>
        )}
      </div>

      {/* 키 이름 입력 */}
      {showNameInput && (
        <div className="flex gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="키 이름 (선택)"
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? '생성 중...' : '생성'}
          </button>
          <button
            onClick={() => { setShowNameInput(false); setNewKeyName('') }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-white transition-colors"
          >
            취소
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* 키 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
        </div>
      ) : keys.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-400">발급된 API 키가 없어요</p>
          <p className="text-xs text-slate-300 mt-1">새 키를 생성해 외부 앱에서 연결하세요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">{key.name}</span>
                  <code className="text-xs text-slate-400 font-mono">{key.key_prefix}…</code>
                </div>
                <p className="text-xs text-slate-400">
                  생성: {formatDate(key.created_at)}
                  {key.last_used_at
                    ? ` · 마지막 사용: ${formatDate(key.last_used_at)}`
                    : ' · 미사용'}
                </p>
              </div>
              <button
                onClick={() => handleRevoke(key.id)}
                className="flex-shrink-0 ml-3 text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      {/* API 사용 예시 */}
      {keys.length > 0 && (
        <div className="mt-2 p-4 bg-slate-900 rounded-xl">
          <p className="text-xs text-slate-400 mb-2">사용 예시</p>
          <code className="text-xs text-slate-300 font-mono block leading-relaxed">
            curl -H &quot;Authorization: Bearer sk_live_…&quot; \<br />
            &nbsp;&nbsp;{typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/boards
          </code>
        </div>
      )}

      {/* 생성된 키 모달 */}
      {generatedKey && (
        <ApiKeyModal apiKey={generatedKey} onClose={() => setGeneratedKey(null)} />
      )}
    </div>
  )
}
