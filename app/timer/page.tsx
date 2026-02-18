'use client'

import { useState, useEffect } from 'react'
import { useAudioStore, selectActiveSounds } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { formatTimerDisplay } from '@/lib/utils'
import { formatPresetLabel } from '@/lib/utils'
import { Play, Pause, RotateCcw, Sparkles, ChevronRight, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TimerVisualizer } from '@/components/custom/TimerVisualizer'
import { TIMER_PRESETS } from '@/data/timer-presets'
import { useAtomicTimer } from '@/hooks/useAtomicTimer'

const TimerPage = () => {
  const router = useRouter()
  const {
    sleepTimer,
    setSleepTimerDuration,
    resetSleepTimer,
    togglePausePlay,
    isPaused,
  } = useAudioStore()
  const activeSounds = useAudioStore(selectActiveSounds)

  // Use atomic timer for remaining time display (single source of truth)
  const { timeLeft: atomicTimeLeft, progress: atomicProgress, isRunning: atomicIsRunning, originalDuration } = useAtomicTimer()

  const [customMinutes, setCustomMinutes] = useState('')
  const [customHours, setCustomHours] = useState('')
  const [progress, setProgress] = useState<number>(0)
  const [isMounted, setIsMounted] = useState(false)

  const handleStartPause = () => {
    // Check if there are active sounds
    if (activeSounds.length === 0) {
      toast.info('Select a sound to start the timer')
      return
    }
    
    // Use togglePausePlay to sync with bottom menu and audio playback
    togglePausePlay()
    
    if (isPaused) {
      toast.success('Timer started')
    } else {
      toast.info('Timer paused')
    }
  }

  const handleReset = () => {
    resetSleepTimer(true)
    toast.info('Timer reset')
  }

  const handleWatchFaceClick = () => {
    handleStartPause()
  }

  const handleSetTime = (seconds: number) => {
    setSleepTimerDuration(seconds)
    // Just set the timer - don't auto-play or toggle pause state
    // User explicitly controls play/pause with the play button
    if (activeSounds.length > 0) {
      if (seconds === 0) {
        toast.success('Timer disabled - sounds will play continuously')
      } else {
        toast.success(`Timer set to ${formatTimerDisplay(seconds)}`)
      }
    } else {
      if (seconds === 0) {
        toast.info('Timer disabled - Select a sound to start')
      } else {
        toast.info(`Timer preset to ${formatTimerDisplay(seconds)} - Select a sound to start`)
      }
    }
  }

  const handleCustomTime = () => {
    const hours = parseInt(customHours, 10)
    const minutes = parseInt(customMinutes, 10)

    // Validate: Reject empty inputs
    if ((!customHours && !customMinutes) || (customHours === '' && customMinutes === '')) {
      toast.error('Please enter hours or minutes')
      return
    }

    // Validate: Reject non-numeric inputs (like 'abc')
    if ((customHours && isNaN(hours)) || (customMinutes && isNaN(minutes))) {
      toast.error('Please enter valid numbers')
      return
    }

    // Validate: Reject negative numbers
    if (hours < 0 || minutes < 0) {
      toast.error('Time cannot be negative')
      return
    }

    // Validate: Reject decimals (must be whole numbers)
    if ((customHours && customHours.includes('.')) || (customMinutes && customMinutes.includes('.'))) {
      toast.error('Please use whole numbers only')
      return
    }

    // Validate: Reject values outside reasonable bounds (HTML min/max can be bypassed)
    if (hours > 8) {
      toast.error('Hours cannot exceed 8')
      return
    }
    if (minutes > 59) {
      toast.error('Minutes cannot exceed 59')
      return
    }

    const totalMinutes = (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes)

    // Validate: Must be at least 1 minute, max 8 hours (480 minutes)
    if (totalMinutes < 1) {
      toast.error('Enter at least 1 minute')
      return
    }
    if (totalMinutes > 480) {
      toast.error('Maximum time is 8 hours')
      return
    }

    const totalSeconds = totalMinutes * 60
    setSleepTimerDuration(totalSeconds)
    setCustomHours('')
    setCustomMinutes('')
    
    // Just set the timer - don't auto-play or toggle pause state
    // User explicitly controls play/pause with the play button
    if (activeSounds.length > 0) {
      toast.success(`Timer set to ${formatTimerDisplay(totalSeconds)}`)
    } else {
      toast.info(`Timer preset to ${formatTimerDisplay(totalSeconds)} - Select a sound to start`)
    }
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const newProgress = sleepTimer.totalTime === 0
        ? 1
        : sleepTimer.totalTime > 0
        ? ((sleepTimer.totalTime - sleepTimer.timeLeft) / sleepTimer.totalTime)
        : 0;
  
      const animationTimeout = setTimeout(() => {
        setProgress(newProgress);
      }, 10);
  
      return () => clearTimeout(animationTimeout);
    }
  }, [isMounted, sleepTimer.timeLeft, sleepTimer.totalTime]);

  return (
    <div className="min-h-screen p-4 pb-20 bg-transparent text-gray-200">
      <header className="p-4 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-sky-300">Sleep Timer</h1>
            <p className="text-sm text-gray-400 mt-1">
              Automatically stops all sounds when the timer ends.
            </p>
          </div>
          <Link
            href="/"
            aria-label="Home"
            className="inline-flex items-center justify-center rounded-xl p-2.5 min-w-11 min-h-11 text-white/70 hover:text-white hover:bg-white/5 transition-colors shrink-0"
          >
            <Home className="h-6 w-6" />
          </Link>
        </div>
      </header>

      {activeSounds.length === 0 && (
        <div className="max-w-lg mx-auto px-4 mb-6">
          <Button
            onClick={() => router.push('/sounds')}
            className="w-full justify-between h-auto p-5 rounded-xl bg-linear-to-br from-emerald-600/30 to-emerald-800/20 backdrop-blur-sm hover:opacity-90 border border-white/10 text-gray-100"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <span className="font-medium">Select a sound to start the timer</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
      )}

      <main className="max-w-lg mx-auto space-y-8">
        <div className="bg-card p-8 rounded-lg border border-border">
          <TimerVisualizer
            totalTime={originalDuration > 0 ? originalDuration : sleepTimer.totalTime}
            timeLeft={atomicTimeLeft}
            progress={atomicProgress}
            isRunning={atomicIsRunning}
            isPaused={isPaused}
            onToggle={handleWatchFaceClick}
          />
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleStartPause}
            className={`w-full justify-between h-auto p-5 rounded-xl bg-linear-to-br from-sky-600/30 to-sky-800/20 backdrop-blur-sm hover:opacity-90 border border-white/10 text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={activeSounds.length === 0}
          >
            <div className="flex items-center gap-3">
              {!isPaused && atomicIsRunning ? (
                <>
                  <Pause className="w-5 h-5 text-sky-400" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 text-sky-400" />
                  <span>{atomicTimeLeft > 0 ? 'Resume' : 'Start'}</span>
                </>
              )}
            </div>
          </Button>
          <Button
            onClick={handleReset}
            className={`w-full justify-between h-auto p-5 rounded-xl bg-linear-to-br from-slate-600/30 to-slate-800/20 backdrop-blur-sm hover:opacity-90 border border-white/10 text-gray-100`}
          >
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-slate-400" />
              <span>Reset</span>
            </div>
          </Button>
        </div>

        <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-sky-300 text-center">Set Custom Time</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Hours</label>
              <Input
                type="number"
                placeholder="0"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                min="0"
                max="8"
                className="w-full h-10 text-center bg-slate-900/80 border border-slate-600 text-gray-200 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Minutes</label>
              <Input
                type="number"
                placeholder="0"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                min="0"
                max="59"
                className="w-full h-10 text-center bg-slate-900/80 border border-slate-600 text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>
          <Button
            onClick={handleCustomTime}
            className={`w-full justify-between h-auto p-5 rounded-xl bg-linear-to-br from-sky-600/30 to-sky-800/20 backdrop-blur-sm hover:opacity-90 border border-white/10 text-gray-100`}
            disabled={(!customHours && !customMinutes) || (customHours?.trim() === '' && customMinutes?.trim() === '')}
          >
            <div className="flex items-center gap-3 justify-center">
              <span>Set Timer</span>
            </div>
          </Button>
        </div>

        <div className="p-4 mt-6 rounded-lg bg-slate-800/50 border border-sky-700 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-sky-400 text-center">Quick Select</h3>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            {/* No Timer Option */}
            <Button
              onClick={() => handleSetTime(0)}
              className="w-full h-auto p-5 rounded-xl bg-linear-to-br from-amber-600/30 to-amber-800/20 backdrop-blur-sm hover:opacity-90 border border-amber-400/30 text-gray-100"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 rounded-full text-amber-400 bg-amber-400"></div>
                <span className="font-medium pl-1">No Timer</span>
              </div>
            </Button>
            
            {TIMER_PRESETS.map((preset) => (
              <Button
                key={preset.seconds}
                onClick={() => handleSetTime(preset.seconds)}
                className={`w-full h-auto p-5 rounded-xl bg-linear-to-br ${preset.color} backdrop-blur-sm hover:opacity-90 border border-white/10 text-gray-100`}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${preset.iconClass}`}></div>
                  <span className="font-medium pl-1">{preset.label}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}

export default TimerPage
