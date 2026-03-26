'use client'

import { useState } from 'react'

interface EditModalCard {
  id: number
  title: string
  price: number | null
  image_url: string | null
  url: string
}

interface EditModalProps {
  card: EditModalCard
  onSave: (id: number, updates: { title: string; price: number | null; image_url: string | null }) => Promise<void>
  onClose: () => void
}

export default function EditModal({ card, onSave, onClose }: EditModalProps) {
  const initialTitle = card.title.toLowerCase().includes('access denied') ? '' : card.title
  const [title, setTitle] = useState(initialTitle)
  const [price, setPrice] = useState(card.price !== null ? String(card.price) : '')
  const [imageUrl, setImageUrl] = useState(card.image_url ?? '')
  const [imgPreviewOk, setImgPreviewOk] = useState(!!card.image_url)
  const [saving, setSaving] = useState(false)

  const handleImageUrlChange = (val: string) => {
    setImageUrl(val)
    setImgPreviewOk(!!val.trim())
  }

  const handleSave = async () => {
    setSaving(true)
    const priceNum = price.trim() ? parseInt(price, 10) : null
    await onSave(card.id, {
      title: title.trim() || card.url,
      price: Number.isFinite(priceNum) ? priceNum : null,
      image_url: imageUrl.trim() || null,
    })
    setSaving(false)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        {/* 이미지 미리보기 */}
        {imageUrl.trim() && imgPreviewOk && (
          <div className="w-full aspect-video rounded-t-2xl overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImgPreviewOk(false)}
              onLoad={() => setImgPreviewOk(true)}
            />
          </div>
        )}

        <div className="p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">아이템 편집</h2>

          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="상품 제목을 입력하세요"
                autoFocus
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">가격 (숫자만)</label>
              <input
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="64000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">이미지 URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
              {imageUrl.trim() && !imgPreviewOk && (
                <p className="text-xs text-red-400 mt-1">이미지를 불러올 수 없습니다</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
