'use client'

import { useEffect, useRef, RefObject } from 'react'

export function useActiveSounds(isExpanded: boolean, scrollRef: RefObject<HTMLDivElement | null>) {
  const scrollY = useRef(0)

  // Bouncy overscroll effect for desktop
  useEffect(() => {
    const scrollContainer = scrollRef.current
    
    // Reset position when collapsing
    if (!isExpanded) {
      return
    }
    
    if (!scrollContainer) return

    const isOverscrolling = false
    const overscrollAmount = 0
    let rafId: number | null = null

    const handleWheel = (e: WheelEvent) => {
      // Use RAF to batch layout reads and prevent forced reflows
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }

      rafId = requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        const atTop = scrollTop <= 0
        const atBottom = scrollTop + clientHeight >= scrollHeight - 1

        // Allow normal scrolling within the expanded panel.
        // (Overscroll/bounce visuals are handled by the browser/platform; we don't block wheel here.)
      })
    }
 
    // Attach overscroll listener only when expanded to avoid main-thread work on initial load.
    if (isExpanded) {
      scrollContainer.addEventListener('wheel', handleWheel, { passive: false })
    }
 
    return () => {
      if (isExpanded) {
        scrollContainer.removeEventListener('wheel', handleWheel)
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [isExpanded, scrollRef])
}
