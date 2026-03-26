import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, apiError } from '@/lib/api-auth'

interface MetadataResponse {
  title?: string
  image?: string
  price?: number | null
  priceRaw?: string | null
  currency?: string
  url?: string
}

async function fetchMetadata(url: string, origin: string): Promise<MetadataResponse> {
  try {
    const res = await fetch(`${origin}/api/metadata?url=${encodeURIComponent(url)}`)
    if (!res.ok) return {}
    return await res.json() as MetadataResponse
  } catch {
    return {}
  }
}

export async function GET(request: NextRequest) {
  const { auth, errorResponse } = await authenticateRequest(request)
  if (!auth) return errorResponse

  const boardIdParam = request.nextUrl.searchParams.get('board_id')
  const boardId = boardIdParam !== null ? parseInt(boardIdParam, 10) : null

  if (boardIdParam !== null && (boardId === null || isNaN(boardId))) {
    return apiError(422, 'INVALID_PARAM', 'board_id must be a number')
  }

  let query = auth.supabase
    .from('items')
    .select('id, url, title, image_url, status, board_id, price, currency, price_raw, created_at')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false })

  if (boardId !== null) {
    query = query.eq('board_id', boardId)
  }

  const { data, error } = await query

  if (error) {
    console.error('[GET /api/v1/items]', error.message)
    return apiError(500, 'SERVER_ERROR', 'Failed to fetch items')
  }

  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: NextRequest) {
  const { auth, errorResponse } = await authenticateRequest(request)
  if (!auth) return errorResponse

  let body: {
    url?: unknown
    board_id?: unknown
    title?: unknown
    price?: unknown
    thumbnail_url?: unknown
  }
  try {
    body = await request.json()
  } catch {
    return apiError(422, 'INVALID_BODY', 'Request body must be valid JSON')
  }

  if (!body.url || typeof body.url !== 'string' || !body.url.trim()) {
    return apiError(422, 'INVALID_BODY', '"url" is required')
  }

  const url = /^https?:\/\//i.test(body.url.trim())
    ? body.url.trim()
    : `https://${body.url.trim()}`

  const boardId =
    body.board_id !== undefined && body.board_id !== null
      ? typeof body.board_id === 'number'
        ? body.board_id
        : parseInt(String(body.board_id), 10)
      : null

  if (boardId !== null && isNaN(boardId)) {
    return apiError(422, 'INVALID_BODY', '"board_id" must be a number')
  }

  // 클라이언트(예: 크롬 확장)가 직접 제공한 값 우선 사용, 없으면 스크래핑
  let title = typeof body.title === 'string' ? body.title.trim() || null : null
  let price = typeof body.price === 'number' ? body.price : null
  const thumbnailUrl = typeof body.thumbnail_url === 'string' ? body.thumbnail_url.trim() || null : null
  let imageUrl: string | null = thumbnailUrl
  let currency = 'KRW'
  let priceRaw: string | null = null

  if (!title || price === null || !imageUrl) {
    const meta = await fetchMetadata(url, request.nextUrl.origin)
    if (!title) title = meta.title ?? url
    if (price === null) {
      price = meta.price ?? null
      currency = meta.currency ?? 'KRW'
      priceRaw = meta.priceRaw ?? null
    }
    if (!imageUrl) imageUrl = meta.image ?? null
  }

  const { data, error } = await auth.supabase
    .from('items')
    .insert({
      user_id: auth.userId,
      url,
      title: title ?? url,
      image_url: imageUrl,
      board_id: boardId,
      status: 'wish',
      price,
      currency,
      price_raw: priceRaw,
    })
    .select('id, url, title, image_url, status, board_id, price, currency, price_raw, created_at')
    .single()

  if (error) {
    console.error('[POST /api/v1/items]', error.message)
    return apiError(500, 'SERVER_ERROR', 'Failed to create item')
  }

  // price_history 첫 기록 (실패 무시)
  if (data.price !== null) {
    await auth.supabase.from('price_history').insert({
      item_id: data.id,
      price: data.price,
      currency: data.currency ?? 'KRW',
    })
  }

  return NextResponse.json({ item: data }, { status: 201 })
}
