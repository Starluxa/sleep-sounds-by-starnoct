'use client'

import { useMemo, useState } from 'react'
import { DEVICE_GUIDES } from '@/constants'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'

export function OptimizationGuide({ deviceModel }: { deviceModel?: string }) {
  const [open, setOpen] = useState(false)

  const guide = useMemo(() => {
    if (!deviceModel) return null
    const key = Object.keys(DEVICE_GUIDES).find((k) => deviceModel.startsWith(k))
    return key ? DEVICE_GUIDES[key] : null
  }, [deviceModel])

  if (!guide) return null

  return (
    <div className="mt-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            Why is this needed?
            <span className="text-xs opacity-70">{open ? 'Hide' : 'Show'}</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-gray-200">
            <div className="font-semibold mb-2">{guide.title}</div>
            <ol className="list-decimal pl-5 space-y-1">
              {guide.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

