'use client'

import { useState } from 'react'
import { GlobalMemoryData } from '@/types'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

interface MemoryAnalysisProps {
  data: GlobalMemoryData
}

const TYPE_COLORS: Record<string, string> = {
  person: '#6366f1',
  event: '#f59e0b',
  preference: '#10b981',
  skill: '#3b82f6',
  habit: '#8b5cf6',
  project: '#ef4444',
  note: '#64748b',
}

export default function MemoryAnalysis({ data }: MemoryAnalysisProps) {
  const [expandedType, setExpandedType] = useState(true)
  const [expandedLabels, setExpandedLabels] = useState(true)

  const byTypeArray = Object.entries(data.by_type ?? {}).map(([type, count]) => ({ type, count }))
  const topLabels = data.top_labels ?? []

  return (
    <div className="space-y-4">
      {/* Distribution by Type */}
      <Collapsible open={expandedType} onOpenChange={setExpandedType}>
        <div className="rounded-xl border bg-card overflow-hidden">
          <CollapsibleTrigger className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Distribución por tipo</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {byTypeArray.length} tipos
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${expandedType ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-5 pb-5 pt-3 border-t">
            {byTypeArray.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground text-xs">Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byTypeArray} layout="vertical" margin={{ top: 4, right: 8, left: 80, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {byTypeArray.map((entry, i) => (
                      <rect key={i} fill={TYPE_COLORS[entry.type] ?? '#64748b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Top Labels */}
      <Collapsible open={expandedLabels} onOpenChange={setExpandedLabels}>
        <div className="rounded-xl border bg-card overflow-hidden">
          <CollapsibleTrigger className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Etiquetas más comunes</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {topLabels.length} etiquetas
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${expandedLabels ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-5 pb-5 pt-3 border-t">
            {topLabels.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground text-xs">Sin etiquetas</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topLabels.map((item, i) => {
                  const opacity = Math.max(0.6, 1 - i * 0.04)
                  return (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-xs px-2.5 py-1 cursor-default"
                      style={{ opacity }}
                    >
                      {item.label}
                      <span className="ml-1.5 text-muted-foreground font-mono text-xs">{item.count}</span>
                    </Badge>
                  )
                })}
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}
