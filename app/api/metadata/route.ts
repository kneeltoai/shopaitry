import { NextRequest, NextResponse } from 'next/server'

// 가격 문자열에서 정수 추출 (반올림)
// "$29.99" → 30, "₩64,000" → 64000, "89,000원" → 89000
function extractPrice(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.]/g, '')
  if (!cleaned) return null
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : Math.round(num)
}

// 가격 문자열에서 통화 코드 추론
function detectCurrency(raw: string): string {
  if (raw.includes('$')) return 'USD'
  if (raw.includes('€')) return 'EUR'
  if (raw.includes('£')) return 'GBP'
  if (raw.includes('¥')) return 'JPY'
  return 'KRW'
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url')
  if (!rawUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  // 프로토콜 없으면 https 추가
  const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: AbortSignal.timeout(8000),
    })

    const html = await response.text()

    const get = (patterns: RegExp[]) => {
      for (const re of patterns) {
        const m = html.match(re)
        if (m?.[1]) return m[1].trim()
      }
      return null
    }

    const title = get([
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
      /<title[^>]*>([^<]+)<\/title>/i,
    ])

    const image = get([
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    ])

    const description = get([
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
    ])

    // 상대 경로 이미지 처리
    let resolvedImage = image
    if (image && !image.startsWith('http')) {
      const base = new URL(url)
      resolvedImage = image.startsWith('/')
        ? `${base.origin}${image}`
        : `${base.origin}/${image}`
    }

    const hostname = new URL(url).hostname

    // ── 가격 추출 ──────────────────────────────────────────
    // 1순위: og:price:amount / product:price:amount 메타 태그
    const priceMetaRaw = get([
      /<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:price:amount["']/i,
      /<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']product:price:amount["']/i,
    ])

    // 2순위: application/ld+json 의 offers.price 또는 price
    let ldPriceRaw: string | null = null
    const ldMatch = html.match(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
    )
    if (ldMatch?.[1]) {
      try {
        const ld = JSON.parse(ldMatch[1]) as Record<string, unknown>
        const offersField = ld.offers
        const offers = (
          offersField && typeof offersField === 'object' && !Array.isArray(offersField)
            ? offersField
            : null
        ) as Record<string, unknown> | null
        if (offers?.price !== undefined) {
          ldPriceRaw = String(offers.price)
        } else if (ld.price !== undefined) {
          ldPriceRaw = String(ld.price)
        }
      } catch {
        // JSON 파싱 실패는 무시
      }
    }

    const priceRaw = priceMetaRaw ?? ldPriceRaw
    const price = priceRaw ? extractPrice(priceRaw) : null
    const currency = priceRaw ? detectCurrency(priceRaw) : 'KRW'
    // ──────────────────────────────────────────────────────

    return NextResponse.json({
      title: title || hostname,
      image: resolvedImage,
      description,
      url,
      hostname,
      price,
      priceRaw,
      currency,
    })
  } catch {
    const hostname = (() => {
      try { return new URL(url).hostname } catch { return url }
    })()
    return NextResponse.json(
      { error: 'Failed to fetch metadata', title: hostname, url, hostname },
      { status: 200 }, // 실패해도 카드는 저장되도록
    )
  }
}
