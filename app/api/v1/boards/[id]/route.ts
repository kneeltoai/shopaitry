import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, apiError } from '@/lib/api-auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { auth, errorResponse } = await authenticateRequest(request)
  if (!auth) return errorResponse

  const { id } = await params
  const boardId = parseInt(id, 10)
  if (isNaN(boardId)) {
    return apiError(422, 'INVALID_PARAM', 'Board ID must be a number')
  }

  // 소유권 확인
  const { data: board } = await auth.supabase
    .from('boards')
    .select('id')
    .eq('id', boardId)
    .eq('user_id', auth.userId)
    .single()

  if (!board) {
    return apiError(404, 'NOT_FOUND', 'Board not found')
  }

  // 해당 보드의 아이템 board_id를 null로 변경
  await auth.supabase
    .from('items')
    .update({ board_id: null })
    .eq('board_id', boardId)
    .eq('user_id', auth.userId)

  const { error } = await auth.supabase
    .from('boards')
    .delete()
    .eq('id', boardId)
    .eq('user_id', auth.userId)

  if (error) {
    console.error('[DELETE /api/v1/boards/:id]', error.message)
    return apiError(500, 'SERVER_ERROR', 'Failed to delete board')
  }

  return NextResponse.json({ success: true })
}
