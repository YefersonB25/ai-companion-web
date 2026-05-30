export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-lg bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
      </div>
      <div className="h-8 w-16 rounded bg-muted mb-1" />
      <div className="h-3 w-20 rounded bg-muted" />
    </div>
  )
}

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="rounded-xl border bg-card p-5 animate-pulse">
      <div className="h-4 w-40 rounded bg-muted mb-4" />
      <div className="rounded bg-muted" style={{ height }} />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b bg-muted/30 h-12" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3 border-b last:border-0">
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="h-4 flex-1 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
          <div className="h-6 w-24 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}
