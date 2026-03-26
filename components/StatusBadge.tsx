'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Status = 'wish' | 'to_buy' | 'bought'

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  wish: {
    label: '위시',
    className: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
  },
  to_buy: {
    label: '살것',
    className: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
  },
  bought: {
    label: '구매완료',
    className: 'bg-green-100 text-green-600 hover:bg-green-200',
  },
}

const NEXT_STATUS: Record<Status, Status> = {
  wish: 'to_buy',
  to_buy: 'bought',
  bought: 'wish',
}

function toValidStatus(s: string): Status {
  if (s === 'to_buy' || s === 'bought') return s
  return 'wish'
}

interface StatusBadgeProps {
  itemId: number
  status: string
  onStatusChange: (newStatus: string) => void
}

export default function StatusBadge({ itemId, status, onStatusChange }: StatusBadgeProps) {
  const [updating, setUpdating] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (updating) return

    const current = toValidStatus(status)
    const next = NEXT_STATUS[current]

    onStatusChange(next) // 낙관적 업데이트
    setUpdating(true)

    const { error } = await supabase
      .from('items')
      .update({ status: next })
      .eq('id', itemId)

    if (error) {
      console.error('Failed to update status:', error.message)
      onStatusChange(current) // 롤백
    }

    setUpdating(false)
  }

  const safeStatus = toValidStatus(status)
  const config = STATUS_CONFIG[safeStatus]

  return (
    <button
      onClick={handleClick}
      disabled={updating}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${config.className} disabled:opacity-50`}
    >
      {config.label}
    </button>
  )
}
