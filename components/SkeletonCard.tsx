export default function SkeletonCard() {
  return (
    <div className="break-inside-avoid mb-2">
      <div className="bg-white rounded-xl overflow-hidden animate-pulse">
        <div className="w-full aspect-video bg-slate-100" />
        <div className="p-3 space-y-2">
          <div className="h-2 bg-slate-100 rounded w-1/3" />
          <div className="h-2.5 bg-slate-100 rounded w-full" />
          <div className="h-2.5 bg-slate-100 rounded w-4/5" />
          <div className="h-5 bg-slate-100 rounded w-1/4 mt-1" />
        </div>
      </div>
    </div>
  )
}
