'use client'

import { useState } from 'react'

interface Board {
  id: number
  name: string
}

interface BoardSelectorProps {
  boards: Board[]
  selectedBoardId: number | null
  onSelectBoard: (boardId: number | null) => void
  onCreateBoard: (name: string) => void
}

export default function BoardSelector({
  boards,
  selectedBoardId,
  onSelectBoard,
  onCreateBoard,
}: BoardSelectorProps) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const handleCreate = () => {
    const name = newName.trim()
    if (!name) return
    onCreateBoard(name)
    setNewName('')
    setCreating(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') {
      setCreating(false)
      setNewName('')
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onSelectBoard(null)}
        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
          selectedBoardId === null
            ? 'bg-slate-800 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        전체
      </button>

      {boards.map((board) => (
        <button
          key={board.id}
          onClick={() => onSelectBoard(board.id)}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            selectedBoardId === board.id
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {board.name}
        </button>
      ))}

      {creating ? (
        <input
          autoFocus
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!newName.trim()) {
              setCreating(false)
            }
          }}
          placeholder="보드 이름"
          className="px-3 py-1 rounded-lg border border-slate-300 text-xs bg-white outline-none focus:border-slate-500 w-28"
        />
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          + 새 보드
        </button>
      )}
    </div>
  )
}
