'use client';

import { usePathname } from 'next/navigation';
import { useTimerSync } from '@/hooks/useTimerSync';

export function TimerProvider({ children }: { children: React.ReactNode }) {
  usePathname();

  // Enable timer sync from native on app resume (temporal jump recovery)
  useTimerSync()

  // Legacy interval removed - TimerOrchestrator now drives timer state directly
  // UI is updated via useAtomicTimer which subscribes to orchestrator state changes

  return <>{children}</>
}