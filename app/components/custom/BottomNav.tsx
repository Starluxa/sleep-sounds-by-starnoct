'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Music, Clock } from 'lucide-react'
import { Sparkles, Moon, Settings, Play, Pause } from 'lucide-react'
import { useAudioStore, selectActiveSounds } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'

export default function BottomNav() {
  const [hasMounted, setHasMounted] = useState(false)
  const isPaused = useAudioStore(state => state.isPaused)
  const togglePausePlay = useAudioStore(state => state.togglePausePlay)
  const activeSounds = useAudioStore(useShallow(selectActiveSounds))
  const volume = useAudioStore(state => state.audioSettings.volume)
  const updateAudioSettings = useAudioStore(state => state.updateAudioSettings)

  usePathname()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const handlePlayPauseClick = () => {
    if (volume === 0) {
      updateAudioSettings({ volume: 50 })
      if (isPaused) togglePausePlay()
    } else {
      togglePausePlay()
    }
  }

  if (!hasMounted) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 pb-[max(env(safe-area-inset-bottom,1rem),1rem)] bg-slate-900/90 border-t border-slate-700 z-40">
        <nav className="container mx-auto px-4">
          <div className="flex justify-center items-center h-16">
            <div className="flex space-x-8 text-gray-200">
              <Link href="/sounds" className="flex flex-col items-center space-y-1 text-sky-400 transition-colors">
                <Sparkles className="w-6 h-6" />
                <span className="text-sm">Sounds</span>
              </Link>
              <button className="flex flex-col items-center space-y-1 opacity-50 cursor-not-allowed" disabled>
                <Play className="w-6 h-6" />
                <span className="text-sm">Play</span>
              </button>
              <Link href="/timer" className="flex flex-col items-center space-y-1 text-purple-400 transition-colors">
                <Moon className="w-6 h-6" />
                <span className="text-sm">Timer</span>
              </Link>
              <Link href="/settings" className="flex flex-col items-center space-y-1 text-pink-400 transition-colors">
                <Settings className="w-6 h-6" />
                <span className="text-sm">Settings</span>
              </Link>
            </div>
          </div>
        </nav>
      </footer>
    )
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 pb-[max(env(safe-area-inset-bottom,1rem),1rem)] bg-slate-900/90 border-t border-slate-700 z-40">
      <nav className="container mx-auto px-4">
        <div className="flex justify-center items-center h-16">
          <div className="flex space-x-8 text-gray-200">
            <Link
              href="/sounds"
              className="flex flex-col items-center space-y-1 text-sky-400 transition-colors"
            >
              <Sparkles className="w-6 h-6" />
              <span className="text-sm">Sounds</span>
            </Link>
            <button
              onClick={handlePlayPauseClick}
              className={`flex flex-col items-center space-y-1 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
                volume === 0
                  ? 'text-green-400'
                  : isPaused
                  ? 'text-green-400'
                  : 'text-amber-400'
              } ${isPaused && activeSounds.length > 0 ? 'animate-pulse-slow' : ''}`}
              disabled={activeSounds.length === 0}
            >
              {volume === 0 ? <Play className="w-6 h-6" /> : isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
              <span className="text-sm">{volume === 0 ? 'Play' : isPaused ? 'Play' : 'Pause'}</span>
            </button>
            <Link
              href="/timer"
              className="flex flex-col items-center space-y-1 text-purple-400 transition-colors"
            >
              <Moon className="w-6 h-6" />
              <span className="text-sm">Timer</span>
            </Link>
            <Link
              href="/settings"
              className="flex flex-col items-center space-y-1 text-pink-400 transition-colors"
            >
              <Settings className="w-6 h-6" />
              <span className="text-sm">Settings</span>
            </Link>
          </div>
        </div>
      </nav>
    </footer>
  )
}