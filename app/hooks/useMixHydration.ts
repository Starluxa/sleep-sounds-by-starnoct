'use client'

import { useState, useEffect } from 'react'
import { useMixStore } from '@/lib/mix-store'

export function useMixHydration() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Check initial hydration state
    const initialHydrated = useMixStore.persist.hasHydrated()
    setHydrated(initialHydrated)

    // Subscribe to hydration events
    const unsubHydrate = useMixStore.persist.onHydrate(() => setHydrated(false))
    const unsubFinishHydration = useMixStore.persist.onFinishHydration(() => setHydrated(true))

    return () => {
      unsubHydrate?.()
      unsubFinishHydration?.()
    }
  }, [])

  return hydrated
}