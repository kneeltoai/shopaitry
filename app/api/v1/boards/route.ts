import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, apiError } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const { auth, errorResponse } = await authenticateRequest(request)
  if (!auth) return errorResponse

  const { data, error } = await auth.supabase
    .from('boards')
    .select('id, name, created_at')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[GET /api/v1/boards]', error.message)
    return apiError(500, 'SERVER_ERROR', 'Failed to fetch boards')
  }

  return NextResponse.json({ boards: data ?? [] })
}

export async function POST(request: NextRequest) {
  const { auth, errorResponse } = await authenticateRequest(request)
  if (!auth) return errorResponse

  let body: { name?: unknown }
  try {
    body = await request.json()
  } catch {
    return apiError(422, 'INVALID_BODY', 'Request body must be valid JSON')
  }

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return apiError(422, 'INVALID_BODY', '"name" is required and must be a non-empty string')
  }

  const { data, error } = await auth.supabase
    .from('boards')
    .insert({ name: body.name.trim(), user_id: auth.userId })
    .select('id, name, created_at')
    .single()

  if (error) {
    console.error('[POST /api/v1/boards]', error.message)
    return apiError(500, 'SERVER_ERROR', 'Failed to create board')
  }

  return NextResponse.json({ board: data }, { status: 201 })
}
