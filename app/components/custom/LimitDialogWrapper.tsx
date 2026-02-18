'use client'

import { useAudioStore } from '@/lib/store';
import { LimitReachedToast } from './LimitReachedToast';

export const LimitDialogWrapper = () => {
  const showLimitDialog = useAudioStore(state => state.showLimitDialog);
  const setShowLimitDialog = useAudioStore(state => state.setShowLimitDialog);

  return (
    <LimitReachedToast
      open={showLimitDialog}
      onOpenChange={setShowLimitDialog}
    />
  );
};