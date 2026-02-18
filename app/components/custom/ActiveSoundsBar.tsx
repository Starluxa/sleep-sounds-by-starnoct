'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useAudioStore, selectActiveSounds } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { useMixStore } from '@/lib/mix-store'
import { ActiveSound } from '@/types/sounds'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
// Replace heavy icon library imports with small inline SVG components to reduce bundle size
import XIcon from './icons/XIcon'
import ChevronUpIcon from './icons/ChevronUpIcon'
import ChevronDownIcon from './icons/ChevronDownIcon'
import ClockIcon from './icons/ClockIcon'
import { soundCategories } from '@/data/soundsData'
import { cn, formatTimerDisplay } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import Link from 'next/link'
import SaveMixDialog from '../SaveMixDialog'
import ShareButton from './ShareButton'
import MasterVolumeSlider from './MasterVolumeSlider'
import { useScrollLock } from '@/hooks/useScrollLock'
import { useActiveSounds } from '@/hooks/useActiveSounds'
import { useAccessibility } from '@/contexts/accessibility-context'
import { useAtomicTimer } from '@/hooks/useAtomicTimer'


export default function ActiveSoundsBar() {
  const [hasMounted, setHasMounted] = useState(false)

  const { cardSize } = useAccessibility()
  
  // Optimize state selection - only subscribe to what we need
  const activeSounds = useAudioStore(useShallow(selectActiveSounds))
  const updateVolume = useAudioStore(state => state.updateVolume)
  const removeSound = useAudioStore(state => state.removeSound)
  
  // Use atomic timer for remaining time display (single source of truth)
  const { timeLeft: atomicTimeLeft } = useAtomicTimer()
  
  const { saveCurrentMix: saveCurrentMixToStore, loading, error, savedMixes } = useMixStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  
  // Use custom hooks for scroll functionality
  // Allow scrolling inside the expanded list while preventing background/page scroll.
  useScrollLock(isExpanded, scrollerRef)
  useActiveSounds(isExpanded, scrollerRef)

  // Stable callbacks + memoized list to avoid unnecessary re-renders
  const getSoundDetails = useCallback((soundId: string) => {
    for (const category of soundCategories) {
      const sound = category.sounds.find(s => s.id === soundId)
      if (sound) return { name: sound.name, icon: sound.icon }
    }
    return { name: soundId, icon: '🎵' }
  }, [])

  const handleSaveMix = useCallback(async (name: string) => {
    await saveCurrentMixToStore(name, activeSounds);
  }, [saveCurrentMixToStore, activeSounds])

  const onToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  const onRemove = useCallback((id: string) => {
    removeSound(id)
  }, [removeSound])

  const memoizedActiveSounds = useMemo(() => activeSounds, [activeSounds])

  // Use atomic timer for display (single source of truth from TimerOrchestrator)
  const displayTimerSeconds = atomicTimeLeft

  // Collapsed bar sizing is tied to Accessibility "Card Size".
  // Expanded UI keeps its own sizing and should not be affected.
  const collapsedUi = useMemo(() => {
    switch (cardSize) {
      case 'small':
        return {
          title: 'text-xs',
          buttonText: 'text-xs',
          timer: 'text-xs',
          buttonPad: 'p-2',
          // Keep collapsed actions comfortably tappable (>=44px), and visually aligned with ShareButton.
          buttonBox: 'h-11',
          chevron: 'h-6 w-6',
          gap: 'gap-3',
        }
      case 'large':
        return {
          // Large = accessibility-first (target ~18px+ readable text)
          title: 'text-lg',
          buttonText: 'text-lg',
          timer: 'text-lg',
          buttonPad: 'p-3',
          buttonBox: 'h-12',
          chevron: 'h-8 w-8',
          gap: 'gap-4',
        }
      case 'medium':
      default:
        return {
          // Medium = midpoint between small (12px) and large (18px)
          title: 'text-base',
          buttonText: 'text-base',
          timer: 'text-base',
          buttonPad: 'p-3',
          // Match ShareButton's minimum tap target in collapsed view.
          buttonBox: 'h-11',
          chevron: 'h-6 w-6',
          gap: 'gap-3',
        }
    }
  }, [cardSize])

  const expandedUi = useMemo(() => {
    // Expanded panel should scale with accessibility, but keep touch targets generously sized.
    switch (cardSize) {
      case 'small':
        return {
          padding: 'p-4',
          title: 'text-lg',
          timerSmall: 'text-sm',
          saveText: 'text-sm',
          savePad: 'px-3 py-2',
          saveMinH: 'min-h-11', // ~44px tap target
          chevron: 'h-6 w-6',
          label: 'text-xs',
          timerBig: 'text-xl',
          clock: 'h-5 w-5',
          cardPad: 'p-4',
          icon: 'text-xl',
          soundName: 'text-base',
          percent: 'text-sm',
          removeBtn: 'h-11 w-11',
          sliderRowMinH: 'min-h-11',
          sliderPad: 'py-2',
        }
      case 'large':
        return {
          padding: 'p-6',
          title: 'text-2xl',
          timerSmall: 'text-lg',
          saveText: 'text-lg',
          savePad: 'px-5 py-3',
          saveMinH: 'min-h-14',
          chevron: 'h-8 w-8',
          label: 'text-base',
          timerBig: 'text-4xl',
          clock: 'h-7 w-7',
          cardPad: 'p-6',
          icon: 'text-3xl',
          soundName: 'text-2xl',
          percent: 'text-lg',
          removeBtn: 'h-12 w-12',
          sliderRowMinH: 'min-h-14',
          sliderPad: 'py-3',
        }
      case 'medium':
      default:
        return {
          padding: 'p-5',
          title: 'text-xl',
          timerSmall: 'text-base',
          saveText: 'text-base',
          savePad: 'px-4 py-2.5',
          saveMinH: 'min-h-12',
          chevron: 'h-7 w-7',
          label: 'text-sm',
          timerBig: 'text-3xl',
          clock: 'h-6 w-6',
          cardPad: 'p-5',
          icon: 'text-2xl',
          soundName: 'text-xl',
          percent: 'text-base',
          removeBtn: 'h-11 w-11',
          sliderRowMinH: 'min-h-12',
          sliderPad: 'py-2.5',
        }
    }
  }, [cardSize])

  const bottomOffset = useMemo(() => {
    // Give the "Large" collapsed bar a little extra lift so it never tucks under BottomNav.
    // (Collapsed height increases with accessibility size, but BottomNav height stays constant.)
    if (isExpanded) return 'var(--bottom-nav-height)'
    if (cardSize === 'large') return 'calc(var(--bottom-nav-height) + 12px)'
    // Medium collapsed controls are now taller; add a small lift on mobile so the bar never feels clipped by BottomNav.
    if (cardSize === 'medium' && isMobile) return 'calc(var(--bottom-nav-height) + 8px)'
    return 'var(--bottom-nav-height)'
  }, [cardSize, isExpanded, isMobile])

  // Set mounted state
  useEffect(() => {
    setHasMounted(true)
  }, [])


  // Collapse menu when navigating to new page
  useEffect(() => {
    setIsExpanded(false)
  }, [pathname])

  // Collapse menu when all sounds are removed
  useEffect(() => {
    if (activeSounds.length === 0 && isExpanded) {
      setIsExpanded(false)
    }
  }, [activeSounds.length, isExpanded])

  const ease: [number, number, number, number] = [0.32, 0.72, 0, 1]
  const barVariants = {
    collapsed: {
      height: isMobile ? '64px' : '72px',
      bottom: 'var(--bottom-nav-height)', // Use CSS variable for dynamic positioning
      transition: { duration: 0.5, ease }
    },
    expanded: {
      height: 'auto',
      bottom: 'var(--bottom-nav-height)', // Leave space for bottom nav
      top: '0px', // Cover from top down
      transition: { duration: 0.5, ease }
    }
  }

  if (!hasMounted || activeSounds.length === 0) return null

  return (
    <div
      ref={outerRef}
      className={cn(
        'fixed left-0 right-0 z-40 bg-slate-900/92 border-t border-slate-700 text-white',
        isExpanded ? 'rounded-t-2xl' : ''
      )}
      style={{
        height: isExpanded ? 'auto' : (isMobile ? '80px' : '90px'),
        maxHeight: isExpanded ? 'calc(100vh - var(--bottom-nav-height))' : 'auto',
        bottom: bottomOffset,
        // When expanded, keep the container at the top of the viewport.
        // Safe-area spacing is handled via padding on the expanded content so it works across devices.
        top: isExpanded ? '0px' : 'auto',
        overflow: isExpanded ? 'visible' : 'hidden'
      }}
    >
      <div
        ref={scrollRef}
        className={cn(
          isExpanded
            ? cn(
                expandedUi.padding,
                // Prevent the expanded header from sitting under mobile status bars/notches.
                // (Affects expanded only; collapsed bar remains unchanged.)
                'pt-[calc(env(safe-area-inset-top,0px)+16px)]'
              )
            : 'p-4',
          isExpanded && "flex flex-col"
        )}
        style={{
          overflowY: 'hidden',
          height: isExpanded ? '100%' : 'auto'
        }}
      >
          <div className={cn(isExpanded && 'flex flex-col min-h-0 h-full')}>
            <div
              className={cn(
                // Flexible sides keep the timer centered, but allow the side columns to shrink on small screens
                // or large accessibility sizes.
                'grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center mb-4 cursor-pointer',
                isExpanded ? 'flex-none gap-3' : collapsedUi.gap
              )}
              onClick={() => onToggleExpand()}
            >
              <div className="justify-start min-w-0">
                <h2 className={cn(isExpanded ? 'text-lg' : collapsedUi.title, 'font-bold')}>
                  Active Sounds ({memoizedActiveSounds.length})
                </h2>
              </div>
              {/* Keep column 2 always present so the right-side buttons don't shift left when timer is absent */}
              <div className="flex justify-center px-1 min-w-0">
                {displayTimerSeconds > 0 && (
                  <span
                    className={cn(
                      isExpanded ? expandedUi.timerSmall : collapsedUi.timer,
                      'font-mono text-blue-400 leading-none'
                    )}
                  >
                    {formatTimerDisplay(displayTimerSeconds)}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 justify-end min-w-0">
                <Button
  size="sm"
  onClick={(e) => { e.stopPropagation(); setIsSaveDialogOpen(true); }}
  className={cn(
    'w-auto justify-center h-auto rounded-xl bg-linear-to-br from-fuchsia-600/40 to-fuchsia-800/25 hover:opacity-95 shadow-sm border border-white/10 text-gray-100 pointer-events-auto',
    isExpanded
      ? cn(expandedUi.saveMinH, expandedUi.savePad, expandedUi.saveText)
      : cn(collapsedUi.buttonBox, collapsedUi.buttonPad, collapsedUi.buttonText)
  )}
>
  Save
</Button>
                <ShareButton size={cardSize} context={isExpanded ? 'expanded' : 'collapsed'} />
                {isExpanded ? (
                  <ChevronDownIcon className={cn(expandedUi.chevron)} />
                ) : (
                  <ChevronUpIcon className={cn(collapsedUi.chevron)} />
                )}
              </div>
        </div>

          {isExpanded && (
            <div
              className="flex flex-col flex-1 min-h-0 opacity-100"
              style={{ transition: 'opacity 0.3s' }}
            >
              <div
                ref={scrollerRef}
                className="flex-1 min-h-0 overflow-y-auto pb-20 flex flex-col gap-4 active-sounds-scroll"
                style={{
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {/* Put the controls *inside* the scroll container so wheel/touch scrolling works anywhere within the expanded panel. */}
                <div className="w-full px-4 pb-6 pt-2 border-b border-white/5">
                  <span className={cn(expandedUi.label, 'font-medium text-slate-400 uppercase tracking-wider block mb-2')}>
                    Master Volume
                  </span>
                  <MasterVolumeSlider orientation="horizontal" />
                </div>

                <div className="flex items-center justify-between px-4">
                  {displayTimerSeconds > 0 ? (
                    <>
                      <div className="flex items-center space-x-3">
                        <ClockIcon className={cn(expandedUi.clock, 'text-blue-400')} />
                        <span className={cn(expandedUi.timerBig, 'font-mono font-bold text-blue-400 leading-none')}>
                          {formatTimerDisplay(displayTimerSeconds)}
                        </span>
                      </div>
                      <Link href="/timer">
                        <Button
                          size="sm"
                          variant="outline"
                          className={cn(
                            'border-purple-400/50 text-purple-30 hover:bg-purple-50/10 hover:border-purple-30 animate-border-glow',
                            expandedUi.saveMinH
                          )}
                          title="Edit Timer"
                        >
                          Edit Timer
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No sleep timer active
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 px-4">
                  {memoizedActiveSounds.map((sound: ActiveSound) => {
                    const { name, icon } = getSoundDetails(sound.id)
                    return (
                      <div
                        key={sound.id}
                        className={cn(
                          'bg-slate-800/50 rounded-xl flex flex-col space-y-3 shadow-lg border border-slate-700',
                          expandedUi.cardPad
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className={cn(expandedUi.icon)}>{icon}</span>
                            <h3 className={cn(expandedUi.soundName, 'font-semibold leading-tight')}>{name}</h3>
                          </div>
                          <button
                            onClick={() => onRemove(sound.id)}
                            className={cn(
                              expandedUi.removeBtn,
                              'text-slate-300 hover:text-white rounded-xl flex items-center justify-center'
                            )}
                            aria-label={`Remove ${name}`}
                          >
                            <XIcon className="w-6 h-6" />
                          </button>
                        </div>
                        <div className={cn('flex items-center space-x-2', expandedUi.sliderRowMinH)}>
                          <div className={cn('flex-1', expandedUi.sliderPad)}>
                            <Slider
                              value={[sound.volume]}
                              onValueChange={([v]) => updateVolume(sound.id, v)}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <span className={cn(expandedUi.percent, 'text-slate-300 w-14 text-right')}>
                            {Math.round(sound.volume)}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      <SaveMixDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSaveMix}
        currentSounds={activeSounds}
        loading={loading}
        error={error}
      />
    </div>
  )
}
