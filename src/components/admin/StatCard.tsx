'use client'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  trend?: number
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const colorMap = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-950/30',   text: 'text-blue-600 dark:text-blue-400',   border: 'border-blue-100 dark:border-blue-900' },
  green:  { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900' },
  purple: { bg: 'bg-indigo-50 dark:bg-indigo-950/30',  text: 'text-indigo-600 dark:text-indigo-400',  border: 'border-indigo-100 dark:border-indigo-900' },
  orange: { bg: 'bg-amber-50 dark:bg-amber-950/30',   text: 'text-amber-600 dark:text-amber-400',   border: 'border-amber-100 dark:border-amber-900' },
}

export default function StatCard({ title, value, subtitle, icon, trend, color = 'blue' }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-6 flex flex-col gap-3 transition-all hover:shadow-lg hover:border-opacity-100 cursor-default`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className={`text-3xl font-bold tracking-tight ${c.text}`}>{value}</div>
      <div className="flex items-center gap-2 pt-1">
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        {trend !== undefined && (
          <span className={`text-xs font-semibold ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  )
}
