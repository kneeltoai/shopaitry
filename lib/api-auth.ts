import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}

export interface AuthResult {
  userId: string
  supabase: SupabaseClient
}

interface ApiError {
  status: number
  code: string
  message: string
}

export function apiError(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status })
}

export async function authenticateRequest(
  request: NextRequest
): Promise<{ auth: AuthResult; errorResponse: null } | { auth: null; errorResponse: NextResponse }> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      auth: null,
      errorResponse: apiError(500, 'SERVER_ERROR', 'SUPABASE_SERVICE_ROLE_KEY is not configured'),
    }
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      auth: null,
      errorResponse: apiError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header'),
    }
  }

  const key = authHeader.slice(7).trim()
  if (!key) {
    return {
      auth: null,
      errorResponse: apiError(401, 'UNAUTHORIZED', 'Missing API key'),
    }
  }

  const keyHash = createHash('sha256').update(key).digest('hex')
  const supabase = getServiceClient()

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, user_id, is_active')
    .eq('key_hash', keyHash)
    .single()

  if (error || !data) {
    return {
      auth: null,
      errorResponse: apiError(401, 'UNAUTHORIZED', 'Invalid API key'),
    }
  }

  if (!data.is_active) {
    return {
      auth: null,
      errorResponse: apiError(401, 'UNAUTHORIZED', 'API key has been disabled'),
    }
  }

  // last_used_at 갱신 (결과 무시)
  supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)
    .then(() => {})

  return {
    auth: { userId: data.user_id as string, supabase },
    errorResponse: null,
  }
}
