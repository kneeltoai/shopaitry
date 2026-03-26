'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Google login error:', error.message)
      setError('Google 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.')
      setGoogleLoading(false)
    }
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
            {/* Google OAuth 버튼 */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2.5"
            >
              {googleLoading ? (
                <svg className="animate-spin w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <g fill="none" fillRule="evenodd">
                    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </g>
                </svg>
              )}
              Google로 계속하기
            </button>

            {/* 구분선 */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">또는</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Magic Link */}
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
