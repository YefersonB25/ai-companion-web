'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { GlobalMemoryData } from '@/types'
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

const NeuralBrainGraph = dynamic(() => import('@/components/admin/NeuralBrainGraph'), {
  ssr: false,
  loading: () => <div className="h-[480px] bg-slate-950 animate-pulse rounded-b-xl" />,
})

interface MemoryNeuralTabProps {
  data: GlobalMemoryData
  onNodeSelect: (node: any) => void
}

export default function MemoryNeuralTab({ data, onNodeSelect }: MemoryNeuralTabProps) {
  const [isOpen, setIsOpen] = useState(false)

  const byTypeArray = Object.entries(data.by_type ?? {}).map(([type, count]) => ({ type, count }))
  const topLabels = data.top_labels ?? []
  const totalNodes = data.total_nodes ?? 0

  return (
    <div className="space-y-4">
      {/* Neural Graph */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="rounded-xl border border-indigo-500/20 overflow-hidden">
          <CollapsibleTrigger className="w-full px-4 py-3 border-b border-indigo-500/20 bg-slate-950/50 hover:bg-slate-950 transition-colors flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-indigo-300">Red Neural Global — {totalNodes} nodos</h2>
              <p className="text-xs text-slate-500 mt-0.5">Visualización en tiempo real del conocimiento colectivo acumulado</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-indigo-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <NeuralBrainGraph
              nodes={(topLabels).slice(0, 40).map((item, i) => ({
                id: i + 1,
                type: byTypeArray[i % Math.max(byTypeArray.length, 1)]?.type ?? 'default',
                label: item.label,
                importance: Math.min(1, item.count / 5),
                parent_id: i > 0 && i % 4 === 0 ? i - 1 : null,
              }))}
              width={900}
              height={480}
              onNodeSelect={onNodeSelect}
            />
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Info */}
      <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
        <p>
          La red neural visualiza los {topLabels.length} temas más relevantes del conocimiento colectivo.
          {' '}
          <strong>Haz clic en los nodos</strong> para explorar conexiones.
        </p>
      </div>
    </div>
  )
}
