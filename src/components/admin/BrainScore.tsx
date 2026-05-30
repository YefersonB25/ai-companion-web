'use client'

interface BrainScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

function getLabel(score: number): string {
  if (score >= 80) return 'Experto'
  if (score >= 50) return 'Desarrollado'
  if (score >= 20) return 'En crecimiento'
  return 'Principiante'
}

function getColor(score: number): string {
  if (score >= 80) return '#10b981'   // green
  if (score >= 50) return '#6366f1'   // indigo
  if (score >= 20) return '#f59e0b'   // amber
  return '#ef4444'                    // red
}

function getGradient(score: number): string {
  if (score >= 80) return 'from-emerald-400 to-emerald-600'
  if (score >= 50) return 'from-indigo-400 to-violet-600'
  if (score >= 20) return 'from-amber-400 to-orange-500'
  return 'from-red-400 to-red-600'
}

const sizeMap = {
  sm: { bar: 'h-1.5', text: 'text-xs', value: 'text-sm font-semibold' },
  md: { bar: 'h-2',   text: 'text-sm', value: 'text-base font-semibold' },
  lg: { bar: 'h-3',   text: 'text-sm', value: 'text-xl font-bold' },
}

export default function BrainScore({ score, size = 'md' }: BrainScoreProps) {
  const s = sizeMap[size]
  const label = getLabel(score)
  const color = getColor(score)
  const gradient = getGradient(score)
  const clamped = Math.min(100, Math.max(0, score))

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <span className={`${s.text} font-medium text-muted-foreground`}>{label}</span>
        <span className={s.value} style={{ color }}>{clamped}</span>
      </div>
      <div className={`w-full rounded-full bg-muted ${s.bar} overflow-hidden`}>
        <div
          className={`${s.bar} rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
