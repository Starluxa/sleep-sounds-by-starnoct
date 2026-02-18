import React, { useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Volume2 } from 'lucide-react';
import { useAudioStore } from '@/lib/store';
import { triggerImpact } from '@/lib/haptics';
import { MixEntity } from '../../../src/domain/sounds/entities/MixEntity';

/** Default master volume level (75%) for double-click reset */
const DEFAULT_MASTER_VOLUME = 75;

interface MasterVolumeSliderProps {
  orientation?: 'horizontal' | 'vertical';
}

/**
 * MasterVolumeSlider is a "Dumb Terminal" component.
 * It emits raw linear values (0-100) to the store and delegates all logic
 * (math, debouncing, policies) to the domain and store layers.
 */
const MasterVolumeSlider = React.memo(({ orientation = 'horizontal' }: MasterVolumeSliderProps) => {
  const transientVolume = useAudioStore((state) => state.transientVolume);
  const updateAudioSettings = useAudioStore((state) => state.updateAudioSettings);
  const audioPort = useAudioStore((state) => state.audioPort);

  const handleVolumeChange = useCallback(([value]: number[]) => {
    // Haptic feedback is a UI side-effect, but the policy (when to trigger)
    // is defined in the domain layer.
    if (MixEntity.shouldTriggerHaptic(value)) {
      triggerImpact('light');
    }

    // Fast Path: Update hardware immediately via AudioPort
    if (audioPort) {
      void audioPort.setMasterVolume(value / 100);
    }

    // Emit raw linear value to the store.
    // Debouncing and persistence are handled internally by the store.
    updateAudioSettings({ volume: value });
  }, [updateAudioSettings, audioPort]);

  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col items-center space-y-2">
        <Slider
          orientation="vertical"
          value={[transientVolume]}
          onValueChange={handleVolumeChange}
          max={100}
          step={1}
          className="h-32"
        />
        <span className="text-sm text-slate-300">{transientVolume}%</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Volume2
        className="h-4 w-4 cursor-pointer"
        onDoubleClick={() => updateAudioSettings({ volume: DEFAULT_MASTER_VOLUME })}
      />
      <Slider
        value={[transientVolume]}
        onValueChange={handleVolumeChange}
        max={100}
        step={1}
        className="w-full"
      />
      <span className="text-sm text-slate-300 w-10 text-right">{transientVolume}%</span>
    </div>
  );
});

MasterVolumeSlider.displayName = 'MasterVolumeSlider';

export default MasterVolumeSlider;
