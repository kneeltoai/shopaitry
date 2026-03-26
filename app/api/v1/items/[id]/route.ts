import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, apiError } from '@/lib/api-auth'

const VALID_STATUSES = ['wish', 'to_buy', 'bought'] as const

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { auth, errorResponse } = await authenticateRequest(request)
  if (!auth) return errorResponse

  const { id } = await params
  const itemId = parseInt(id, 10)
  if (isNaN(itemId)) {
    return apiError(422, 'INVALID_PARAM', 'Item ID must be a number')
  }

  const { data: item } = await auth.supabase
    .from('items')
    .select('id')
    .eq('id', itemId)
    .eq('user_id', auth.userId)
    .single()

  if (!item) {
    return apiError(404, 'NOT_FOUND', 'Item not found')
  }

  const { error } = await auth.supabase
    .from('items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', auth.userId)

  if (error) {
    console.error('[DELETE /api/v1/items/:id]', error.message)
    return apiError(500, 'SERVER_ERROR', 'Failed to delete item')
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { auth, errorResponse } = await authenticateRequest(request)
  if (!auth) return errorResponse

  const { id } = await params
  const itemId = parseInt(id, 10)
  if (isNaN(itemId)) {
    return apiError(422, 'INVALID_PARAM', 'Item ID must be a number')
  }

  let body: {
    title?: unknown
    price?: unknown
    status?: unknown
    board_id?: unknown
    image_url?: unknown
  }
  try {
    body = await request.json()
  } catch {
    return apiError(422, 'INVALID_BODY', 'Request body must be valid JSON')
  }

  const updates: Record<string, string | number | null> = {}

  if (body.title !== undefined) {
    if (typeof body.title !== 'string') {
      return apiError(422, 'INVALID_BODY', '"title" must be a string')
    }
    updates.title = body.title.trim()
  }

  if (body.price !== undefined) {
    if (body.price !== null && typeof body.price !== 'number') {
      return apiError(422, 'INVALID_BODY', '"price" must be a number or null')
    }
    updates.price = body.price as number | null
  }

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status as typeof VALID_STATUSES[number])) {
      return apiError(422, 'INVALID_BODY', `"status" must be one of: ${VALID_STATUSES.join(', ')}`)
    }
    updates.status = body.status as string
  }

  if (body.board_id !== undefined) {
    if (body.board_id === null) {
      updates.board_id = null
    } else {
      const boardId = typeof body.board_id === 'number'
        ? body.board_id
        : parseInt(String(body.board_id), 10)
      if (isNaN(boardId)) {
        return apiError(422, 'INVALID_BODY', '"board_id" must be a number or null')
      }
      updates.board_id = boardId
    }
  }

  if (body.image_url !== undefined) {
    if (body.image_url !== null && typeof body.image_url !== 'string') {
      return apiError(422, 'INVALID_BODY', '"image_url" must be a string or null')
    }
    updates.image_url = body.image_url as string | null
  }

  if (Object.keys(updates).length === 0) {
    return apiError(422, 'INVALID_BODY', 'No valid fields to update')
  }

  // 소유권 확인
  const { data: existing } = await auth.supabase
    .from('items')
    .select('id')
    .eq('id', itemId)
    .eq('user_id', auth.userId)
    .single()

  if (!existing) {
    return apiError(404, 'NOT_FOUND', 'Item not found')
  }

  const { data, error } = await auth.supabase
    .from('items')
    .update(updates)
    .eq('id', itemId)
    .eq('user_id', auth.userId)
    .select('id, url, title, image_url, status, board_id, price, currency, price_raw, created_at')
    .single()

  if (error) {
    console.error('[PATCH /api/v1/items/:id]', error.message)
    return apiError(500, 'SERVER_ERROR', 'Failed to update item')
  }

  return NextResponse.json({ item: data })
}
