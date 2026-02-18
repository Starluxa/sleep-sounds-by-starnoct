'use client';

import { useState } from 'react';
import { Dice5 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioStore, selectActiveSounds } from '@/lib/store';
import { orchestrator } from '../../../src/application/audio/orchestrator';
import { toast } from 'sonner';
import { Duration } from '../../../src/domain/shared/value-objects/Duration';

interface RandomizerButtonProps {
  variant?: 'default' | 'inline' | 'floating';
  hasActiveSounds?: boolean;
}

const RandomizerButton = ({ variant = 'default', hasActiveSounds = false }: RandomizerButtonProps) => {
  const [spinning, setSpinning] = useState(false);

  const handleClick = () => {
    setSpinning(true);
    const store = useAudioStore.getState();
    const previousSounds = selectActiveSounds(store as any);
    const previousTimer = store.sleepTimer;
    const previousIsPaused = store.isPaused;

    setTimeout(async () => {
      const newMix = await orchestrator.generateAndPlayRandomMix();
      
      // Sync the new mix state back to the Zustand store
      const store = useAudioStore.getState();
      const { setMix, sleepTimer, timerOrchestrator } = store;
      setMix(newMix);

      // Start the timer if it's not already running and has a selected time
      if (sleepTimer.selectedTime > 0 && timerOrchestrator) {
        void timerOrchestrator.start(
          Duration.fromNow(sleepTimer.selectedTime),
          sleepTimer.selectedTime
        );
        useAudioStore.setState({
          sleepTimer: {
            ...sleepTimer,
            isRunning: true,
            timeLeft: sleepTimer.selectedTime,
            totalTime: sleepTimer.selectedTime,
          },
          isPaused: false,
        });
      }

      toast.success('Surprise mix generated!', {
        description: 'Tap here to undo.',
        action: {
          label: 'Undo',
          onClick: () => {
            const { setMix, setSleepTimer } = useAudioStore.getState();
            // Restore sounds and timer state
            setMix(previousSounds);
            setSleepTimer(previousTimer);
            useAudioStore.setState({ isPaused: previousIsPaused });
            
            // If it was running, re-sync orchestrator
            if (previousTimer.isRunning && previousTimer.timeLeft > 0 && !previousIsPaused) {
              const timerOrchestrator = (useAudioStore.getState() as any).timerOrchestrator;
              void timerOrchestrator?.start(
                Duration.fromNow(previousTimer.timeLeft),
                previousTimer.selectedTime
              );
            }
          }
        }
      });
      setSpinning(false);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 600);
  };

  const buttonClass = variant === 'inline'
    ? "gap-1 text-sm bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 px-3 py-1"
    : variant === 'floating'
    ? `fixed ${hasActiveSounds ? 'bottom-40' : 'bottom-24'} right-4 h-14 w-14 rounded-full shadow-xl bg-indigo-600 hover:bg-indigo-500 z-30 transition-transform active:scale-95`
    : "gap-2 bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300";

  return (
    <Button
      variant={variant === 'floating' ? 'default' : 'outline'}
      className={buttonClass}
      onClick={handleClick}
      aria-label="Surprise Me"
    >
      <Dice5 className={`${spinning ? 'animate-spin-slow' : ''} ${variant === 'floating' ? 'h-8 w-8' : ''}`} />
      {variant !== 'floating' && 'Surprise Me'}
    </Button>
  );
};

export default RandomizerButton;