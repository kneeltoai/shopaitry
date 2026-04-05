/* eslint-disable react-hooks/refs */
'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import LoginScreen from '@/components/LoginScreen'

interface FadeInResult {
  ref: React.RefObject<HTMLDivElement | null>
  className: string
}

function useFadeIn(): FadeInResult {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return {
    ref,
    className: `transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`,
  }
}

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" strokeLinecap="round"/>
        <path d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" strokeLinecap="round"/>
      </svg>
    ),
    title: 'URL 하나로 자동 정리',
    desc: '상품 URL을 붙여넣으면 제목·이미지·가격을 자동 추출해 카드로 저장합니다.',
    badge: null,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'AI 에이전트 연동',
    desc: '공개 API로 AI 에이전트가 내 위시리스트를 읽고 비교·추천할 수 있습니다.',
    badge: null,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor"/>
      </svg>
    ),
    title: '보드별 분류',
    desc: '의류·전자기기·여행 등 테마별 보드를 만들어 상품을 체계적으로 분류하세요.',
    badge: null,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: '가격 추적',
    desc: '저장한 상품의 가격 변동을 추적하고 최저가를 놓치지 않습니다.',
    badge: 'Coming Soon',
  },
]

interface MockCard {
  title: string
  price: string
  site: string
  gradient: string
  status: 'wish' | 'to_buy' | 'bought'
  tall: boolean
}

const mockCards: MockCard[] = [
  { title: '무신사 스탠다드 후드집업', price: '39,900원', site: 'musinsa.com', gradient: 'from-slate-600 to-slate-800', status: 'wish', tall: false },
  { title: '소니 WH-1000XM5 노이즈캔슬링 헤드폰', price: '398,000원', site: 'sony.com', gradient: 'from-blue-700 to-blue-950', status: 'to_buy', tall: true },
  { title: '나이키 에어포스 1 로우', price: '119,000원', site: 'nike.com', gradient: 'from-gray-600 to-gray-900', status: 'wish', tall: false },
  { title: '애플 에어팟 프로 2세대', price: '359,000원', site: 'apple.com', gradient: 'from-zinc-500 to-zinc-800', status: 'bought', tall: true },
  { title: '아디다스 삼바 OG', price: '139,000원', site: 'adidas.com', gradient: 'from-emerald-700 to-emerald-950', status: 'wish', tall: false },
  { title: '다이슨 에어랩 컴플리트 롱', price: '699,000원', site: 'dyson.com', gradient: 'from-purple-700 to-purple-950', status: 'to_buy', tall: true },
]

const statusStyle: Record<MockCard['status'], { text: string; color: string }> = {
  wish:   { text: '찜',     color: 'bg-blue-100 text-blue-700' },
  to_buy: { text: '살 예정', color: 'bg-orange-100 text-orange-700' },
  bought: { text: '구매완료', color: 'bg-green-100 text-green-700' },
}

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)
  const demoRef = useRef<HTMLDivElement>(null)
  const featuresSection = useFadeIn()
  const demoSection = useFadeIn()
  const ctaSection = useFadeIn()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (showLogin) return <LoginScreen />

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen flex flex-col">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-5 w-full max-w-5xl mx-auto">
          <span className="text-white font-bold text-lg tracking-tight">🔖 Shopaitry</span>
          <button
            onClick={() => setShowLogin(true)}
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            로그인
          </button>
        </nav>

        {/* Hero content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-slate-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI 에이전트 API 지원
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-2xl">
            AI가 채워주는<br />나만의 쇼핑 위시보드
          </h1>

          <p className="mt-6 text-lg text-slate-400 max-w-md leading-relaxed">
            URL 하나로 상품 저장.<br className="sm:hidden" />{' '}
            AI 에이전트가 알아서 비교하고 추천.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors shadow-lg"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google로 시작하기
            </button>
            <button
              onClick={scrollToDemo}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              체험해보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section className="bg-white py-20 px-6">
        <div ref={featuresSection.ref} className={`max-w-5xl mx-auto ${featuresSection.className}`}>
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">필요한 것만, 딱 맞게</h2>
            <p className="mt-3 text-slate-500 text-sm">복잡한 기능 없이 쇼핑 정보를 가장 깔끔하게 정리합니다</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="relative p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white hover:shadow-sm transition-all duration-200"
              >
                {f.badge && (
                  <span className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                    {f.badge}
                  </span>
                )}
                <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo / Mock cards ────────────────────── */}
      <section className="bg-slate-50 py-20 px-6">
        <div ref={demoRef} />
        <div ref={demoSection.ref} className={`max-w-5xl mx-auto ${demoSection.className}`}>
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">이런 모습이에요</h2>
            <p className="mt-3 text-slate-500 text-sm">Pinterest처럼 보기 좋게, Notion처럼 체계적으로</p>
          </div>

          {/* Fake browser chrome */}
          <div className="rounded-2xl border border-slate-200 shadow-xl overflow-hidden bg-white">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-b border-slate-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 px-3 py-1 bg-white rounded-md text-xs text-slate-400 border border-slate-200">
                shopaitry.vercel.app
              </div>
            </div>

            {/* Fake app header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm font-bold text-slate-800">🔖 Shopaitry</span>
                <div className="w-6 h-6 rounded-full bg-slate-200" />
              </div>
              <div className="flex gap-2 mb-2.5 overflow-x-hidden">
                {['전체', '의류', '전자기기', '생활'].map((t, i) => (
                  <span
                    key={t}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${
                      i === 0 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-8 rounded-lg bg-slate-100 border border-slate-200" />
                <div className="w-14 h-8 rounded-lg bg-slate-800" />
              </div>
            </div>

            {/* Mock card grid */}
            <div className="p-4 bg-slate-50">
              <div className="columns-2 sm:columns-3 gap-3">
                {mockCards.map((card, i) => (
                  <div key={i} className="break-inside-avoid mb-3">
                    <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                      <div
                        className={`w-full bg-gradient-to-br ${card.gradient} relative ${
                          card.tall ? 'aspect-[3/4]' : 'aspect-video'
                        }`}
                      >
                        <span
                          className={`absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${statusStyle[card.status].color}`}
                        >
                          {statusStyle[card.status].text}
                        </span>
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs text-slate-400 mb-0.5">{card.site}</p>
                        <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">{card.title}</p>
                        <p className="text-xs font-bold text-slate-900 mt-1">{card.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────── */}
      <section className="bg-slate-900 py-20 px-6">
        <div ref={ctaSection.ref} className={`max-w-lg mx-auto text-center ${ctaSection.className}`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">지금 바로 시작하세요</h2>
          <p className="text-slate-400 text-sm mb-8">무료로 사용할 수 있어요. 카드 등록 필요 없음.</p>
          <button
            onClick={() => setShowLogin(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors shadow-lg"
          >
            지금 시작하기
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </section>
    </div>
  )
}
