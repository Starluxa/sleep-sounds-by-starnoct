'use client'

import { useEffect, RefObject } from 'react'

function isDebugScrollLockEnabled() {
  return false
}

export function useScrollLock(isExpanded: boolean, allowScrollRef?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!isExpanded) return

    // Lock body scroll by adding overflow: hidden to body
    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight
    
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    const isWithinAllowed = (target: EventTarget | null) => {
      const allowedEl = allowScrollRef?.current
      if (!allowedEl) return false
      return target instanceof Node ? allowedEl.contains(target) : false
    }

    const preventScroll = (e: Event) => {
      // Allow scroll interactions inside the expanded ActiveSoundsBar scroller.
      const withinAllowed = isWithinAllowed(e.target)
      if (withinAllowed) return
      e.preventDefault()
    }

    // Prevent scroll on touch devices
    const preventTouchMove = (e: TouchEvent) => {
      const withinAllowed = isWithinAllowed(e.target)
      if (withinAllowed) return
      e.preventDefault()
    }

    // Add listeners to prevent body scroll
    document.addEventListener('wheel', preventScroll, { passive: false })
    document.addEventListener('touchmove', preventTouchMove, { passive: false })

    return () => {
      // Restore body scroll
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight

      document.removeEventListener('wheel', preventScroll)
      document.removeEventListener('touchmove', preventTouchMove)
    }
  }, [isExpanded, allowScrollRef])
}
