'use client'

import { useState, Suspense } from 'react'
import CategoryCard from '@/components/CategoryCard'
import { Category } from '@/types/sounds'
import { soundCategories } from '@/data/soundsData'
import CategorySection from '@/components/CategorySection'
import { useAudioStore, selectActiveSounds } from '@/lib/store'
import { useAccessibility } from '@/contexts/accessibility-context'
import { getGridColumns } from '@/lib/accessibility/card-sizes'
import { Button } from "@/components/ui/button"
import { Diamond, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import MixHydrator from '@/components/MixHydrator'
import RandomizerButton from '@/components/custom/RandomizerButton'
import BreatheButton from '@/components/custom/BreatheButton'

export default function HomePage() {
  const { addSound, removeSound } = useAudioStore()
  const activeSounds = useAudioStore(selectActiveSounds)
  const { cardSize } = useAccessibility()
  const gridCols = getGridColumns(cardSize)
  const [categories] = useState<Category[]>(soundCategories)
  const router = useRouter()

  const hasActiveSounds = activeSounds.length > 0

  // Extract active sound IDs for the CategorySection
  const activeSoundIds = activeSounds.map(sound => sound.id)

  // Handle toggling a sound on/off
  const handleToggleSound = (soundId: string) => {
    if (activeSoundIds.includes(soundId)) {
      removeSound(soundId)
    } else {
      // Check if reached 10-sound limit
      if (activeSounds.length >= 10) {
        return;
      }
      addSound(soundId)
    }
  }

  // Get featured sounds from first few categories (limit to keep appearance similar)
  const featuredCategories = categories.slice(0, 2).map(cat => ({
    ...cat,
    sounds: cat.sounds.slice(0, 3) // Limit to 3 sounds per category to not overwhelm the page
  }))

  return (
    <main className="p-4 pt-6 pb-32">
      <Suspense fallback={null}>
        <MixHydrator />
      </Suspense>
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">StarNoct Sound Library</h1>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <RandomizerButton variant="inline" />
          <BreatheButton />
        </div>
      </div>
      <div className={`grid ${gridCols} gap-4 mb-8`}>
        {categories.map((category: Category) => (
          <CategoryCard
            key={category.id}
            category={category}
          />
        ))}
      </div>

      {/* Featured Quick Play Section */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Play</h2>
        {featuredCategories.map((category, index) => (
          <CategorySection
            key={category.id}
            id={category.id}
            category={category}
            activeSoundIds={activeSoundIds}
            onToggleSound={handleToggleSound}
            isFirstCategory={index === 0}
          />
        ))}
      </div>
      
      <Button
        onClick={() => router.push('/saved-mixes')}
        className="w-full justify-between h-auto p-5 rounded-xl bg-linear-to-br from-sky-600/30 to-sky-800/20 backdrop-blur-sm hover:opacity-90 border border-white/10 text-gray-100"
      >
        <div className="flex items-center gap-3">
          <Diamond className='h-5 w-5 text-sky-400' />
          <span className="font-medium">Saved Sound Mixes</span>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </Button>
      <div className="sm:hidden">
        <RandomizerButton variant="floating" hasActiveSounds={hasActiveSounds} />
      </div>
    </main>
  );
}
