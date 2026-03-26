import { ReactNode } from 'react'

interface MasonryGridProps {
  children: ReactNode
}

export default function MasonryGrid({ children }: MasonryGridProps) {
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-1.5 sm:gap-2">
      {children}
    </div>
  )
}
