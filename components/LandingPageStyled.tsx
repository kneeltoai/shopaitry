'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import LoginScreen from '@/components/LoginScreen'

export default function LandingPageStyled() {
  const [showLogin, setShowLogin] = useState(false)

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (showLogin) return <LoginScreen />

  return (
    <div>
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --bg-deep: #0a0a0f;
          --bg-card: #13131a;
          --bg-card-hover: #1a1a24;
          --surface: #1e1e2a;
          --border: rgba(255,255,255,0.06);
          --text-primary: #f0f0f5;
          --text-secondary: #8a8a9a;
          --text-muted: #55556a;
          --accent: #6c5ce7;
          --accent-glow: rgba(108, 92, 231, 0.3);
          --coral: #ff6b6b;
          --mint: #51cf66;
          --sky: #74c0fc;
          --amber: #fcc419;
          --font-body: var(--landing-font-body, 'Noto Sans KR', -apple-system, sans-serif);
          --font-mono: var(--landing-font-mono, 'JetBrains Mono', monospace);
        }
        html { scroll-behavior: smooth; }
        body {
          font-family: var(--font-body);
          background: var(--bg-deep);
          color: var(--text-primary);
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* NAV */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 16px 32px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(10,10,15,0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo {
          font-size: 20px; font-weight: 900; letter-spacing: -0.5px;
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; color: var(--text-primary);
        }
        .nav-logo span { font-size: 22px; }
        .nav-links { display: flex; gap: 28px; align-items: center; }
        .nav-links a, .nav-links button {
          color: var(--text-secondary); text-decoration: none;
          font-size: 14px; font-weight: 500; transition: color 0.2s;
          background: transparent; border: 0; padding: 0; cursor: pointer;
        }
        .nav-links a:hover, .nav-links button:hover { color: var(--text-primary); }
        .nav-cta {
          background: var(--accent) !important; color: #fff !important;
          padding: 8px 20px; border-radius: 8px; font-weight: 600 !important;
          transition: transform 0.2s, box-shadow 0.2s !important;
        }
        .nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px var(--accent-glow);
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 120px 24px 80px;
          position: relative;
          text-align: center;
        }
        .hero::before {
          content: '';
          position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
          width: 800px; height: 800px;
          background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
          pointer-events: none;
          opacity: 0.4;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 8px 20px;
          font-size: 13px; font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 32px;
          animation: fadeUp 0.6s ease-out;
        }
        .hero-badge .dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--mint);
          box-shadow: 0 0 8px var(--mint);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .hero h1 {
          font-size: clamp(40px, 7vw, 72px);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -2px;
          margin-bottom: 24px;
          animation: fadeUp 0.6s ease-out 0.1s both;
        }
        .hero h1 .highlight {
          background: linear-gradient(135deg, var(--accent), var(--sky));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: 18px; line-height: 1.7;
          color: var(--text-secondary);
          max-width: 480px;
          margin-bottom: 40px;
          animation: fadeUp 0.6s ease-out 0.2s both;
        }
        .hero-actions {
          display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
          animation: fadeUp 0.6s ease-out 0.3s both;
        }
        .btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 28px; border-radius: 12px;
          font-size: 15px; font-weight: 600;
          text-decoration: none; cursor: pointer;
          transition: all 0.25s; border: none;
          background: transparent;
        }
        .btn-primary {
          background: var(--accent); color: #fff;
          box-shadow: 0 2px 20px var(--accent-glow);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px var(--accent-glow);
        }
        .btn-secondary {
          background: var(--surface); color: var(--text-primary);
          border: 1px solid var(--border);
        }
        .btn-secondary:hover {
          background: var(--bg-card-hover);
          border-color: rgba(255,255,255,0.12);
        }
        .btn-google {
          background: #fff; color: #333;
        }
        .btn-google:hover {
          background: #f5f5f5; transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .btn-google svg { width: 18px; height: 18px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* MOCKUP */
        .hero-mockup {
          margin-top: 60px;
          width: 100%; max-width: 900px;
          animation: fadeUp 0.8s ease-out 0.5s both;
          position: relative;
        }
        .mockup-browser {
          background: var(--bg-card);
          border-radius: 16px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03);
        }
        .mockup-bar {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
        }
        .mockup-dots { display: flex; gap: 6px; }
        .mockup-dots span {
          width: 10px; height: 10px; border-radius: 50%;
        }
        .mockup-dots span:nth-child(1) { background: #ff5f57; }
        .mockup-dots span:nth-child(2) { background: #febc2e; }
        .mockup-dots span:nth-child(3) { background: #28c840; }
        .mockup-url {
          flex: 1; text-align: center;
          font-family: var(--font-mono); font-size: 12px;
          color: var(--text-muted);
        }
        .mockup-body { padding: 20px; }

        /* MASONRY DEMO */
        .masonry-demo {
          columns: 4; column-gap: 12px;
        }
        .masonry-card {
          break-inside: avoid; margin-bottom: 12px;
          border-radius: 12px; overflow: hidden;
          position: relative;
          transition: transform 0.3s;
        }
        .masonry-card:hover { transform: scale(1.02); }
        .masonry-img {
          width: 100%; display: block;
          border-radius: 12px;
        }
        .masonry-tag {
          position: absolute; top: 8px; left: 8px;
          padding: 3px 10px; border-radius: 6px;
          font-size: 11px; font-weight: 700;
        }
        .tag-wish { background: var(--accent); color: #fff; }
        .tag-buy { background: var(--coral); color: #fff; }
        .tag-done { background: var(--mint); color: #fff; }
        .masonry-price {
          position: absolute; bottom: 8px; left: 8px;
          font-family: var(--font-mono); font-size: 14px; font-weight: 700;
          color: #fff;
          text-shadow: 0 1px 4px rgba(0,0,0,0.8);
        }
        .masonry-source {
          position: absolute; bottom: 8px; right: 8px;
          font-size: 10px; color: rgba(255,255,255,0.6);
          text-shadow: 0 1px 4px rgba(0,0,0,0.8);
        }

        /* FEATURES */
        .section {
          padding: 100px 24px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .section-label {
          font-family: var(--font-mono);
          font-size: 13px; font-weight: 500;
          color: var(--accent);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 900;
          letter-spacing: -1px;
          line-height: 1.2;
          margin-bottom: 16px;
        }
        .section-desc {
          font-size: 16px; color: var(--text-secondary);
          line-height: 1.7; max-width: 560px;
          margin-bottom: 48px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }
        .feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 32px;
          transition: all 0.3s;
          position: relative; overflow: hidden;
        }
        .feature-card:hover {
          background: var(--bg-card-hover);
          border-color: rgba(255,255,255,0.1);
          transform: translateY(-4px);
        }
        .feature-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          margin-bottom: 20px;
        }
        .fi-purple { background: rgba(108,92,231,0.15); }
        .fi-coral { background: rgba(255,107,107,0.15); }
        .fi-mint { background: rgba(81,207,102,0.15); }
        .fi-sky { background: rgba(116,192,252,0.15); }
        .fi-amber { background: rgba(252,196,25,0.15); }
        .fi-pink { background: rgba(230,100,180,0.15); }
        .feature-card h3 {
          font-size: 18px; font-weight: 700;
          margin-bottom: 8px;
        }
        .feature-card p {
          font-size: 14px; line-height: 1.7;
          color: var(--text-secondary);
        }

        /* HOW IT WORKS */
        .steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          counter-reset: step;
        }
        .step {
          text-align: center; padding: 40px 24px;
          position: relative;
          counter-increment: step;
        }
        .step::before {
          content: counter(step);
          display: flex; align-items: center; justify-content: center;
          width: 56px; height: 56px;
          border-radius: 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          font-family: var(--font-mono);
          font-size: 22px; font-weight: 700;
          color: var(--accent);
          margin: 0 auto 20px;
        }
        .step h3 {
          font-size: 18px; font-weight: 700;
          margin-bottom: 8px;
        }
        .step p {
          font-size: 14px; color: var(--text-secondary);
          line-height: 1.7;
        }
        .step-arrow {
          position: absolute; right: -12px; top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted); font-size: 24px;
        }

        /* AI AGENT */
        .agent-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 60px;
          display: flex; gap: 48px;
          align-items: center;
          margin-top: 24px;
        }
        .agent-text { flex: 1; }
        .agent-visual {
          flex: 1;
          background: var(--surface);
          border-radius: 16px;
          padding: 24px;
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 1.8;
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        .agent-visual .cmd { color: var(--mint); }
        .agent-visual .response { color: var(--sky); }
        .agent-visual .arrow { color: var(--amber); }
        .agent-visual .user { color: var(--coral); }

        /* EXTENSION */
        .ext-section {
          display: flex; align-items: center; gap: 48px;
          margin-top: 24px;
        }
        .ext-visual {
          flex: 0 0 320px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }
        .ext-icon { font-size: 64px; margin-bottom: 16px; }
        .ext-visual h4 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .ext-visual p { font-size: 13px; color: var(--text-secondary); }
        .ext-text { flex: 1; }

        /* CTA */
        .cta-section {
          text-align: center;
          padding: 120px 24px;
          position: relative;
        }
        .cta-section::before {
          content: '';
          position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 600px; height: 600px;
          background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
          pointer-events: none;
          opacity: 0.3;
        }
        .cta-section h2 {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 900;
          letter-spacing: -1px;
          margin-bottom: 16px;
        }
        .cta-section p {
          font-size: 16px; color: var(--text-secondary);
          margin-bottom: 36px;
        }

        /* FOOTER */
        footer {
          padding: 40px 24px;
          border-top: 1px solid var(--border);
          max-width: 1100px;
          margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 16px;
        }
        footer .left { font-size: 13px; color: var(--text-muted); }
        footer .right { display: flex; gap: 24px; }
        footer .right a {
          font-size: 13px; color: var(--text-muted);
          text-decoration: none; transition: color 0.2s;
        }
        footer .right a:hover { color: var(--text-secondary); }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          nav { padding: 12px 16px; }
          .nav-links a:not(.nav-cta), .nav-links button:not(.nav-cta) { display: none; }
          .hero { padding: 100px 20px 60px; }
          .masonry-demo { columns: 2; }
          .features-grid { grid-template-columns: 1fr; }
          .steps { grid-template-columns: 1fr; }
          .step-arrow { display: none; }
          .agent-section { flex-direction: column; padding: 32px; }
          .ext-section { flex-direction: column-reverse; }
          .ext-visual { flex: none; width: 100%; }
          footer { flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <Link href="/" className="nav-logo">
          <span>🛒</span> Shopaitry
        </Link>
        <div className="nav-links">
          <a href="#features">기능</a>
          <a href="#how">사용법</a>
          <a href="#agent">AI 에이전트</a>
          <button type="button" onClick={() => setShowLogin(true)} className="nav-cta">
            시작하기
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">
          <span className="dot" />
          AI 에이전트 API · 크롬 확장 지원
        </div>
        <h1>
          AI가 찾고,<br />
          <span className="highlight">내가 고른다.</span>
        </h1>
        <p className="hero-sub">
          URL 하나면 어떤 쇼핑몰이든 자동 저장.<br />
          AI 에이전트가 대신 찾아주고, 결정은 내가 한다.
        </p>
        <div className="hero-actions">
          <button type="button" onClick={handleGoogleLogin} className="btn btn-google">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google로 시작하기
          </button>
          <a href="#how" className="btn btn-secondary">
            어떻게 작동하나요? ↓
          </a>
        </div>

        {/* MOCKUP */}
        <div className="hero-mockup">
          <div className="mockup-browser">
            <div className="mockup-bar">
              <div className="mockup-dots">
                <span />
                <span />
                <span />
              </div>
              <div className="mockup-url">shopaitry.vercel.app</div>
            </div>
            <div className="mockup-body">
              <div className="masonry-demo">
                <div
                  className="masonry-card"
                  style={{ height: '180px', background: 'linear-gradient(145deg, #2d1b69, #1a1040)' }}
                >
                  <span className="masonry-tag tag-wish">위시</span>
                  <span className="masonry-price">299,000원</span>
                  <span className="masonry-source">coupang.com</span>
                </div>
                <div
                  className="masonry-card"
                  style={{ height: '240px', background: 'linear-gradient(145deg, #1b3a2a, #0d1f16)' }}
                >
                  <span className="masonry-tag tag-buy">살 예정</span>
                  <span className="masonry-price">47,410원</span>
                  <span className="masonry-source">musinsa.com</span>
                </div>
                <div
                  className="masonry-card"
                  style={{ height: '160px', background: 'linear-gradient(145deg, #3a1b1b, #1f0d0d)' }}
                >
                  <span className="masonry-tag tag-wish">위시</span>
                  <span className="masonry-price">119,000원</span>
                  <span className="masonry-source">nike.com</span>
                </div>
                <div
                  className="masonry-card"
                  style={{ height: '200px', background: 'linear-gradient(145deg, #1b2a3a, #0d1620)' }}
                >
                  <span className="masonry-tag tag-done">구매완료</span>
                  <span className="masonry-price">64,000원</span>
                  <span className="masonry-source">smartstore.naver.com</span>
                </div>
                <div
                  className="masonry-card"
                  style={{ height: '220px', background: 'linear-gradient(145deg, #2a2a1b, #18180d)' }}
                >
                  <span className="masonry-tag tag-wish">위시</span>
                  <span className="masonry-price">9,000,000원</span>
                  <span className="masonry-source">brand.naver.com</span>
                </div>
                <div
                  className="masonry-card"
                  style={{ height: '150px', background: 'linear-gradient(145deg, #1b3a3a, #0d2020)' }}
                >
                  <span className="masonry-tag tag-buy">살 예정</span>
                  <span className="masonry-price">39,900원</span>
                  <span className="masonry-source">musinsa.com</span>
                </div>
                <div
                  className="masonry-card"
                  style={{ height: '190px', background: 'linear-gradient(145deg, #2d1b45, #1a0d2a)' }}
                >
                  <span className="masonry-tag tag-wish">위시</span>
                  <span className="masonry-price">290,000원</span>
                  <span className="masonry-source">store.sony.co.kr</span>
                </div>
                <div
                  className="masonry-card"
                  style={{ height: '170px', background: 'linear-gradient(145deg, #1b2d1b, #0d1a0d)' }}
                >
                  <span className="masonry-tag tag-done">구매완료</span>
                  <span className="masonry-price">139,000원</span>
                  <span className="masonry-source">adidas.com</span>
                </div>
                <div
                  className="masonry-card"
                  style={{ height: '210px', background: 'linear-gradient(145deg, #3a2a1b, #201a0d)' }}
                >
                  <span className="masonry-tag tag-wish">위시</span>
                  <span className="masonry-price">50,000원</span>
                  <span className="masonry-source">당근마켓</span>
                </div>
                <div
                  className="masonry-card"
                  style={{ height: '155px', background: 'linear-gradient(145deg, #1b1b3a, #0d0d20)' }}
                >
                  <span className="masonry-tag tag-buy">살 예정</span>
                  <span className="masonry-price">69,000원</span>
                  <span className="masonry-source">aliexpress.com</span>
                </div>
                <div
                  className="masonry-card"
                  style={{ height: '185px', background: 'linear-gradient(145deg, #3a1b2d, #200d1a)' }}
                >
                  <span className="masonry-tag tag-wish">위시</span>
                  <span className="masonry-price">129,000원</span>
                  <span className="masonry-source">coupang.com</span>
                </div>
                <div
                  className="masonry-card"
                  style={{ height: '145px', background: 'linear-gradient(145deg, #1b3a2d, #0d201a)' }}
                >
                  <span className="masonry-tag tag-done">구매완료</span>
                  <span className="masonry-price">25,900원</span>
                  <span className="masonry-source">oliveyoung.co.kr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="section-label">Features</div>
        <h2 className="section-title">
          모든 쇼핑몰,<br />
          하나의 보드에.
        </h2>
        <p className="section-desc">
          쿠팡, 네이버, 무신사, 해외몰, 심지어 당근마켓까지.
          <br />
          URL만 던져주면 나머지는 Shopaitry가 알아서.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon fi-purple">🔗</div>
            <h3>URL 자동 추출</h3>
            <p>
              URL을 붙여넣으면 상품명, 이미지, 가격을 자동으로 가져옵니다. OG 메타, JSON-LD, HTML 패턴까지 3중
              추출.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon fi-coral">📋</div>
            <h3>보드 & 태그 정리</h3>
            <p>카테고리별 보드로 분류하고, 위시·살것·구매완료 태그로 상태를 관리하세요.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon fi-mint">📈</div>
            <h3>가격 추적</h3>
            <p>저장한 상품의 가격이 떨어지면 알려드려요. 최저가 타이밍을 절대 놓치지 마세요.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon fi-sky">🧩</div>
            <h3>크롬 확장프로그램</h3>
            <p>쇼핑 중 발견한 상품, 한 클릭으로 바로 보드에 저장. 탭을 50개 열어놓을 필요 없어요.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon fi-amber">🤖</div>
            <h3>AI 에이전트 API</h3>
            <p>Claude, ChatGPT 등 AI 에이전트가 직접 상품을 찾아 보드에 올려줍니다. MCP 서버 지원.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon fi-pink">🔐</div>
            <h3>REST API</h3>
            <p>외부 서비스와 연동하세요. API 키 발급으로 보드·아이템 CRUD를 자유롭게.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <div className="section-label">How it works</div>
        <h2 className="section-title">3단계면 끝.</h2>
        <p className="section-desc">복잡한 건 싫잖아요. URL만 있으면 됩니다.</p>
        <div className="steps">
          <div className="step">
            <h3>URL 복사</h3>
            <p>쇼핑몰에서 마음에 드는 상품의 URL을 복사하세요. 또는 크롬 확장으로 한 클릭.</p>
            <span className="step-arrow">→</span>
          </div>
          <div className="step">
            <h3>자동 저장</h3>
            <p>상품명, 이미지, 가격이 자동 추출되어 보드에 예쁘게 정리됩니다.</p>
            <span className="step-arrow">→</span>
          </div>
          <div className="step">
            <h3>비교 & 결정</h3>
            <p>한 눈에 비교하고, 가격 변동을 추적하고, 최적의 타이밍에 구매하세요.</p>
          </div>
        </div>
      </section>

      {/* AI AGENT SECTION */}
      <section className="section" id="agent">
        <div className="section-label">AI Agent</div>
        <h2 className="section-title">
          AI가 찾고,<br />
          내가 결정한다.
        </h2>
        <p className="section-desc">
          AI 에이전트에게 &quot;좋은 블루투스 이어폰 찾아줘&quot;라고 하면,
          <br />
          에이전트가 인터넷을 뒤져서 선택지를 보드에 올려줍니다.
          <br />
          결제 버튼은 내가 누른다.
        </p>
        <div className="agent-section">
          <div className="agent-text">
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
              🛡️ 승인 후 구매 워크플로우
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              AI가 아무거나 사버리는 게 아닙니다.
              <br />
              에이전트가 추천한 상품은 내 Shopaitry 보드에 먼저 올라옵니다.
              <br />
              비교하고, 검토하고, 내가 직접 최종 선택.
              <br />
              <br />
              <strong style={{ color: 'var(--text-primary)' }}>돈을 쓰는 결정권은 항상 나에게.</strong>
            </p>
          </div>
          <div className="agent-visual">
            <span className="cmd">→ &quot;쓸만한 포마드 찾아줘&quot;</span>
            <br />
            <br />
            <span className="response">🤖 AI 에이전트가 검색 중...</span>
            <br />
            <span className="response">✓ 쿠팡에서 3개 발견</span>
            <br />
            <span className="response">✓ 네이버에서 2개 발견</span>
            <br />
            <span className="response">✓ 올리브영에서 1개 발견</span>
            <br />
            <br />
            <span className="arrow">→ Shopaitry 보드에 6개 저장 완료</span>
            <br />
            <br />
            <span className="user">👤 사용자가 2개를 선택해서 구매</span>
          </div>
        </div>
      </section>

      {/* CHROME EXTENSION */}
      <section className="section">
        <div className="ext-section">
          <div className="ext-visual">
            <div className="ext-icon">🧩</div>
            <h4>Shopaitry for Chrome</h4>
            <p>쇼핑 중 한 클릭으로 저장</p>
            <div style={{ marginTop: '20px' }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                }}
                className="btn btn-secondary"
                style={{ fontSize: '13px', padding: '10px 20px' }}
              >
                Chrome에 추가 →
              </a>
            </div>
          </div>
          <div className="ext-text">
            <div className="section-label">Chrome Extension</div>
            <h2 className="section-title">
              탭 50개는<br />
              이제 그만.
            </h2>
            <p className="section-desc" style={{ marginBottom: 0 }}>
              쇼핑하다가 마음에 드는 거 발견하면?
              <br />
              Shopaitry 확장 프로그램 아이콘 한 번 클릭.
              <br />
              상품 정보가 자동으로 내 보드에 저장됩니다.
              <br />
              브라우저 탭을 수십 개 열어놓고 비교하던 시대는 끝났어요.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>
          지금 시작하세요.<br />
          무료입니다.
        </h2>
        <p>가입도 카드 등록도 필요 없어요. Google 계정이면 바로.</p>
        <div className="hero-actions">
          <button type="button" onClick={handleGoogleLogin} className="btn btn-google">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google로 시작하기
          </button>
          <a href="#features" className="btn btn-secondary">
            기능 둘러보기
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="left">© 2026 Shopaitry. 모든 쇼핑몰, 하나의 보드.</div>
        <div className="right">
          <a href="#">API 문서</a>
          <a href="#">개인정보처리방침</a>
          <a href="#">문의</a>
        </div>
      </footer>
    </div>
  )
}

