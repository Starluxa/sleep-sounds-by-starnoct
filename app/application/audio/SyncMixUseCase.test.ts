import { vi } from 'vitest';
import { SyncMixUseCase } from './SyncMixUseCase';
import { IAudioPort } from '../../core/audio/IAudioPort';
import { MixEntity } from '../../../src/domain/sounds/entities/MixEntity';

describe('SyncMixUseCase', () => {
  let syncMixUseCase: SyncMixUseCase;
  let mockAudioPort: any;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };

    mockAudioPort = {
      setVolume: vi.fn(),
      play: vi.fn(),
      stop: vi.fn(),
      stopAll: vi.fn(),
      setMasterVolume: vi.fn(),
      getActiveSounds: vi.fn().mockReturnValue([]),
    };

    syncMixUseCase = new SyncMixUseCase(mockAudioPort);
    
    // Mock console.log to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should start new sounds that are not currently active', async () => {
    mockAudioPort.getActiveSounds.mockReturnValue([]);

    const mix = MixEntity.create({
      tracks: [{ id: 'rain', volume: 80, addedAt: Date.now() }],
      masterVolume: 100
    });

    await syncMixUseCase.execute(mix);

    // Should call play with 0 volume first
    expect(mockAudioPort.play).toHaveBeenCalledWith('rain', 0, true);
    
    // Should then call setVolume with calculated gain
    expect(mockAudioPort.setVolume).toHaveBeenCalledWith('rain', expect.objectContaining({
      targetGain: expect.any(Number),
      rampDurationMs: 32
    }));
  });

  it('should stop sounds that are active but not in the mix', async () => {
    mockAudioPort.getActiveSounds.mockReturnValue(['thunder']);

    const mix = MixEntity.create({
      tracks: [{ id: 'rain', volume: 80, addedAt: Date.now() }],
      masterVolume: 100
    });

    await syncMixUseCase.execute(mix);

    // Should stop thunder
    expect(mockAudioPort.stop).toHaveBeenCalledWith('thunder');
    
    // Should start rain
    expect(mockAudioPort.play).toHaveBeenCalledWith('rain', 0, true);
  });

  it('should update volume for sounds that are already active', async () => {
    mockAudioPort.getActiveSounds.mockReturnValue(['rain']);

    const mix = MixEntity.create({
      tracks: [{ id: 'rain', volume: 80, addedAt: Date.now() }],
      masterVolume: 100
    });

    await syncMixUseCase.execute(mix);

    // Should NOT call play for rain
    expect(mockAudioPort.play).not.toHaveBeenCalledWith('rain', expect.any(Number), expect.any(Boolean));
    
    // Should call setVolume for rain
    expect(mockAudioPort.setVolume).toHaveBeenCalledWith('rain', expect.objectContaining({
      targetGain: expect.any(Number),
      rampDurationMs: 16
    }));
  });

  it('should calculate correct gain using MixEntity logic', async () => {
    mockAudioPort.getActiveSounds.mockReturnValue(['rain']);

    const mix = MixEntity.create({
      tracks: [{ id: 'rain', volume: 50, addedAt: Date.now() }],
      masterVolume: 100
    });

    await syncMixUseCase.execute(mix);

    // Expected gain for 50% vol, 100% master, 1 track
    const expectedGain = MixEntity.calculateTransientGain(50, 100, 1);

    expect(mockAudioPort.setVolume).toHaveBeenCalledWith('rain', expect.objectContaining({
      targetGain: expectedGain
    }));
  });

  it('should handle rapid successive updates by syncing the latest mix', async () => {
    const mix1 = MixEntity.create({ tracks: [{ id: 'rain', volume: 50, addedAt: Date.now() }] });
    const mix2 = MixEntity.create({ tracks: [{ id: 'rain', volume: 60, addedAt: Date.now() }] });
    const mix3 = MixEntity.create({ tracks: [{ id: 'rain', volume: 70, addedAt: Date.now() }] });

    // Start first sync
    const promise1 = syncMixUseCase.execute(mix1);
    
    // These should be queued
    const promise2 = syncMixUseCase.execute(mix2);
    const promise3 = syncMixUseCase.execute(mix3);

    await promise1;
    
    // After first sync finishes, it should have scheduled the next sync with mix3 (latest)
    // mix2 should have been skipped
    
    // Wait for the scheduled sync to complete (it's in a setTimeout(..., 0))
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Should have called setVolume for mix1 and mix3, but NOT mix2
    const calls = mockAudioPort.setVolume.mock.calls;
    expect(calls).toHaveLength(2);
    
    const gain1 = MixEntity.calculateTransientGain(50, 100, 1);
    const gain3 = MixEntity.calculateTransientGain(70, 100, 1);
    
    expect(calls[0][1].targetGain).toBeCloseTo(gain1);
    expect(calls[1][1].targetGain).toBeCloseTo(gain3);
  });

  it('should handle an empty mix by stopping all sounds', async () => {
    mockAudioPort.getActiveSounds.mockReturnValue(['rain', 'thunder']);
    
    const emptyMix = MixEntity.create({ tracks: [] });
    
    await syncMixUseCase.execute(emptyMix);
    
    expect(mockAudioPort.stop).toHaveBeenCalledWith('rain');
    expect(mockAudioPort.stop).toHaveBeenCalledWith('thunder');
    expect(mockAudioPort.play).not.toHaveBeenCalled();
  });

  it('should handle a mix with maximum tracks', async () => {
    const maxTracks = Array.from({ length: 10 }, (_, i) => ({
      id: `sound-${i}`,
      volume: 50,
      addedAt: Date.now()
    }));
    
    const mix = MixEntity.create({ tracks: maxTracks });
    
    await syncMixUseCase.execute(mix);
    
    expect(mockAudioPort.play).toHaveBeenCalledTimes(10);
    expect(mockAudioPort.setVolume).toHaveBeenCalledTimes(10);
    
    // Verify gain calculation for 10 tracks
    const expectedGain = MixEntity.calculateTransientGain(50, 100, 10);
    expect(mockAudioPort.setVolume).toHaveBeenCalledWith('sound-0', expect.objectContaining({
      targetGain: expectedGain
    }));
  });
});
