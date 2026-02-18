'use client'

import type { CuratedMix } from '@/data/default-mixes'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { cn } from '@/lib/utils'

interface CuratedMixButtonProps {
  mix: CuratedMix
  onLoad: (mix: CuratedMix) => void
  className?: string
  isCurrentPlaying?: boolean
}

export function CuratedMixButton({
  mix,
  onLoad,
  className,
  isCurrentPlaying = false,
}: CuratedMixButtonProps) {
  const Icon = isCurrentPlaying ? Pause : Play;
  const buttonClasses = isCurrentPlaying ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" : "text-green-400 hover:text-green-300 hover:bg-green-500/10";

  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center gap-4 rounded-xl border border-white/5 bg-slate-800/50 p-4 hover:bg-slate-700/80 transition-all duration-200',
        className
      )}
      onClick={() => onLoad(mix)}
    >
      <OptimizedImage
        src={mix.image ?? ''}
        alt={`${mix.name} mix`}
        width={48}
        height={48}
        className="h-12 w-12 shrink-0 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0 cursor-pointer pr-4">
        <h3 className="truncate text-lg font-semibold text-white leading-tight">
          {mix.name}
        </h3>
        <p className="mt-1 text-xs text-slate-400">{mix.sounds.length} sounds</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={`ml-auto h-10 w-10 shrink-0 ${buttonClasses} focus-visible:ring-blue-500`}
        onClick={(e) => {
          e.stopPropagation()
          onLoad(mix)
        }}
      aria-label={`${isCurrentPlaying ? 'Pause' : 'Play'} ${mix.name}`}>
        <Icon className="h-5 w-5" />
      </Button>
    </div>
  )
}