import { NextRequest, NextResponse } from 'next/server'

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
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
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

    return NextResponse.json({
      title: title || hostname,
      image: resolvedImage,
      description,
      url,
      hostname,
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
