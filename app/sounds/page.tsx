'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAudioStore, selectActiveSounds } from '@/lib/store'
import CategorySection from '@/components/CategorySection'
import { Category, Sound } from '@/types/sounds'
import { soundCategories } from '@/data/soundsData'
import { Home } from 'lucide-react'
import Link from 'next/link'

export default function SoundsPage() {
  const { addSound, removeSound } = useAudioStore()
  const activeSounds = useAudioStore(selectActiveSounds)
  const router = useRouter()

  const activeSoundIds = activeSounds.map(sound => sound.id)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1)
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }
    }
  }, [])

  const handleToggleSound = (soundId: string) => {
    const sound = soundCategories.flatMap((cat: Category) => cat.sounds).find((s: Sound) => s.id === soundId)
    if (!sound) return

    if (activeSoundIds.includes(soundId)) {
      removeSound(soundId)
    } else {
      addSound(soundId)
    }
  }

  return (
    <div>
      <main className="p-4 pt-6 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">
            StarNoct Sound Library
          </h1>
          <Link
            href="/"
            aria-label="Home"
            className="inline-flex items-center justify-center rounded-xl p-2.5 min-w-11 min-h-11 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Home className="h-6 w-6" />
          </Link>
        </div>
        {useMemo(() => soundCategories.map((category: Category, index: number) => (
          <CategorySection
            key={category.id}
            id={category.id}
            category={category}
            activeSoundIds={activeSoundIds}
            onToggleSound={handleToggleSound}
            isFirstCategory={index === 0} // Pass this prop to identify the first category
          />
        )), [activeSoundIds, handleToggleSound])}
      </main>
    </div>
  )
}
