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

const FETCH_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
}

async function fetchHtml(target: string): Promise<string | null> {
  try {
    const response = await fetch(target, {
      headers: FETCH_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) return null
    return await response.text()
  } catch {
    return null
  }
}

// 쿠팡 PC URL → 모바일 URL 변환
function toCoupangMobileUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?coupang\.com/i, 'https://m.coupang.com')
}

// 쿠팡 상품번호를 URL에서 추출해 임시 제목 생성
function extractCoupangFallbackTitle(url: string): string | null {
  const m = url.match(/\/products\/(\d+)/)
  return m ? `쿠팡 상품 #${m[1]}` : null
}

interface ParsedMetadata {
  title: string | null
  image: string | null
  description: string | null
  priceRaw: string | null
}

function parseHtml(html: string, baseUrl: string): ParsedMetadata {
  const get = (patterns: RegExp[]): string | null => {
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

  // 이미지: og:image → twitter:image → product:image → link[rel=image_src] (LD+JSON은 아래서 보강)
  let image = get([
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /<meta[^>]+property=["']product:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']product:image["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']image_src["']/i,
  ])

  const description = get([
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
  ])

  // ── 가격 추출 ──────────────────────────────────────────
  // 1순위: og:price:amount / product:price:amount 메타 태그
  let priceRaw = get([
    /<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:price:amount["']/i,
    /<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']product:price:amount["']/i,
  ])

  // 2순위: 모든 application/ld+json 블록에서 offers.price 또는 price + 이미지 보강
  if (!priceRaw || !image) {
    const ldBlocks = Array.from(
      html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    )
    for (const ldMatch of ldBlocks) {
      if (priceRaw && image) break
      try {
        const ld = JSON.parse(ldMatch[1]) as Record<string, unknown>

        // 이미지 보강
        if (!image && ld.image !== undefined) {
          const imgVal = Array.isArray(ld.image) ? ld.image[0] : ld.image
          if (typeof imgVal === 'string') {
            image = imgVal
          } else if (imgVal && typeof imgVal === 'object') {
            const imgObj = imgVal as Record<string, unknown>
            if (typeof imgObj.url === 'string') image = imgObj.url
          }
        }

        // 가격 보강
        if (!priceRaw) {
          const offersField = ld.offers
          const offers = (
            offersField && typeof offersField === 'object' && !Array.isArray(offersField)
              ? offersField
              : null
          ) as Record<string, unknown> | null
          if (offers?.price !== undefined) {
            priceRaw = String(offers.price)
          } else if (ld.price !== undefined) {
            priceRaw = String(ld.price)
          }
        }
      } catch {
        // JSON 파싱 실패는 무시
      }
    }
  }

  // 3순위: HTML 내 가격 패턴 (4자리 이상 숫자만 허용해 노이즈 감소)
  if (!priceRaw) {
    const pricePatterns: RegExp[] = [
      /"salePrice"\s*:\s*(\d{4,})/i,
      /"discountedPrice"\s*:\s*(\d{4,})/i,
      /"finalPrice"\s*:\s*(\d{4,})/i,
      /data-price=["']([\d,]{4,})["']/i,
      /"price"\s*:\s*(\d{4,})/i,
    ]
    for (const re of pricePatterns) {
      const m = html.match(re)
      if (m?.[1]) {
        const num = parseInt(m[1].replace(/,/g, ''), 10)
        if (!isNaN(num) && num >= 1000) {
          priceRaw = m[1]
          break
        }
      }
    }
  }

  // 상대 경로 이미지 처리
  if (image && !image.startsWith('http')) {
    const base = new URL(baseUrl)
    image = image.startsWith('/') ? `${base.origin}${image}` : `${base.origin}/${image}`
  }

  return { title, image, description, priceRaw }
}

// 네이버 스마트스토어 __NEXT_DATA__ 파싱
function extractFromNextData(html: string): Partial<ParsedMetadata> {
  const m = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i)
  if (!m?.[1]) return {}
  try {
    const nextData = JSON.parse(m[1]) as Record<string, unknown>
    const props = nextData.props as Record<string, unknown> | undefined
    const pageProps = props?.pageProps as Record<string, unknown> | undefined
    const initialState = pageProps?.initialState as Record<string, unknown> | undefined
    if (!initialState) return {}

    // 네이버 스마트스토어 상품 데이터 위치 탐색
    const productGroup = initialState.Product as Record<string, unknown> | undefined
    const product = productGroup?.currentProduct as Record<string, unknown> | undefined
    if (!product) return {}

    const title = typeof product.name === 'string' ? product.name : null
    const image =
      typeof product.representativeImageUrl === 'string'
        ? product.representativeImageUrl
        : null
    const priceRaw =
      product.salePrice !== undefined ? String(product.salePrice) : null

    return { title, image, priceRaw }
  } catch {
    return {}
  }
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url')
  if (!rawUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  // 프로토콜 없으면 https 추가
  const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`

  try {
    const hostname = new URL(url).hostname
    const isCoupang = /coupang\.com$/i.test(hostname)
    const isNaver = /smartstore\.naver\.com|brand\.naver\.com/i.test(hostname)

    let html: string | null = null

    if (isCoupang) {
      // 쿠팡: 모바일 URL 먼저 시도 (봇 차단이 덜함)
      html = await fetchHtml(toCoupangMobileUrl(url))
      // 모바일도 실패하면 원본 시도
      if (!html) html = await fetchHtml(url)
    } else {
      html = await fetchHtml(url)
    }

    // fetch 완전 실패 시 최소 응답 반환
    if (!html) {
      const fallbackTitle = isCoupang ? extractCoupangFallbackTitle(url) : null
      return NextResponse.json({
        title: fallbackTitle || hostname,
        image: null,
        description: null,
        url,
        hostname,
        price: null,
        priceRaw: null,
        currency: 'KRW',
      })
    }

    let parsed = parseHtml(html, url)

    // 네이버 스마트스토어 전용: __NEXT_DATA__ 로 누락된 필드 보강
    if (isNaver) {
      const nextParsed = extractFromNextData(html)
      parsed = {
        title: parsed.title || nextParsed.title || null,
        image: parsed.image || nextParsed.image || null,
        description: parsed.description || null,
        priceRaw: parsed.priceRaw || nextParsed.priceRaw || null,
      }
    }

    const price = parsed.priceRaw ? extractPrice(parsed.priceRaw) : null
    const currency = parsed.priceRaw ? detectCurrency(parsed.priceRaw) : 'KRW'

    return NextResponse.json({
      title: parsed.title || hostname,
      image: parsed.image,
      description: parsed.description,
      url,
      hostname,
      price,
      priceRaw: parsed.priceRaw,
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
