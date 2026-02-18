'use client'

import dynamic from 'next/dynamic'

const OnboardingFlow = dynamic(() => import('./OnboardingFlow'), {
  ssr: false,
  loading: () => null
})

export function OnboardingFlowWrapper() {
  return <OnboardingFlow />
}