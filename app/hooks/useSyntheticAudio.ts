'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAudioStore } from '@/lib/store'
import { ActiveSound, SyntheticSound } from '@/types/sounds'
import { createNoiseBuffer, NoiseColor } from '@/lib/audio/noise-math'
import { soundCategories } from '@/data/soundsData'
import { MixEntity } from '../../src/domain/sounds/entities/MixEntity';

interface SyntheticNodes {
  source: AudioBufferSourceNode
  gain: GainNode
  filter?: BiquadFilterNode
  modulation?: OscillatorNode
  modulationGain?: GainNode
}

export const useSyntheticAudio = (
  activeSounds: ActiveSound[],
  masterVolume: number,
  isPaused: boolean,
  hasUserGesture: boolean
) => {
  const mixEntity = useAudioStore(state => state.mixEntity);
  // Global AudioContext singleton
  const audioContextRef = useRef<AudioContext | null>(null)
  // Buffer cache per color
  const bufferCacheRef = useRef<Map<NoiseColor, AudioBuffer>>(new Map())
  // Nodes per soundId
  const nodesRef = useRef<Map<string, SyntheticNodes>>(new Map())
  // Active soundIds ref for cleanup
  const activeSoundIdsRef = useRef<string[]>([])

  const setAutoplayBlocked = useAudioStore(state => state.setAutoplayBlocked)

  // Get synthetic sound config
  const getSyntheticConfig = useCallback((soundId: string) => {
    for (const category of soundCategories) {
      const sound = category.sounds.find(s => s.id === soundId) as SyntheticSound
      if (sound?.type === 'synthetic') {
        return sound.syntheticConfig
      }
    }
    return null
  }, [])

  // Initialize AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }, [])

  // Resume context on iOS
  const resumeContext = useCallback(async () => {
    const context = getAudioContext()
    if (context.state === 'suspended' && hasUserGesture) {
      try {
        await context.resume()
      } catch (error) {
        // Silent fail for context resume
      }
    }
  }, [getAudioContext, hasUserGesture])

  // Get or create buffer for color
  const getNoiseBuffer = useCallback((color: NoiseColor) => {
    if (!bufferCacheRef.current.has(color)) {
      const context = getAudioContext()
      const buffer = createNoiseBuffer(context, color)
      bufferCacheRef.current.set(color, buffer)
    }
    return bufferCacheRef.current.get(color)!
  }, [getAudioContext])

  // Volume calculation using MixEntity (single source of truth)
  const calculateVolume = useCallback((soundVolume: number, soundId: string) => {
    // Use MixEntity for all volume calculations
    const mix = mixEntity || MixEntity.create({
      tracks: activeSounds.map(s => ({ id: s.id, volume: s.volume, addedAt: Date.now() }))
    });
    // Use MixEntity's calculateTransientGainWithMaster for complete gain calculation
    return mix.calculateTransientGainWithMaster(soundId, soundVolume, masterVolume);
  }, [masterVolume, activeSounds.length, mixEntity])

  // Fade volume with setTargetAtTime
  const fadeVolume = useCallback((gainNode: GainNode, targetVolume: number, duration: number = 0.3) => {
    const context = getAudioContext()
    const now = context.currentTime
    gainNode.gain.setTargetAtTime(targetVolume, now, duration)
  }, [getAudioContext])

  // Create nodes for a synthetic sound
  const createNodes = useCallback((soundId: string, config: SyntheticSound['syntheticConfig']) => {
    const context = getAudioContext()
    const buffer = getNoiseBuffer(config.color)

    // Source
    const source = context.createBufferSource()
    source.buffer = buffer
    source.loop = true

    // Gain
    const gain = context.createGain()
    gain.gain.value = 0 // Start silent

    // Filter if configured
    let filter: BiquadFilterNode | undefined
    if (config.filter) {
      filter = context.createBiquadFilter()
      filter.type = config.filter.type as BiquadFilterType
      filter.frequency.value = config.filter.freq
      filter.Q.value = 1 // Default resonance
    }

    // Modulation if configured
    let modulation: OscillatorNode | undefined
    let modulationGain: GainNode | undefined
    if (config.modulation) {
      modulation = context.createOscillator()
      modulation.type = 'sine'
      modulation.frequency.value = config.modulation.rate
      modulationGain = context.createGain()
      modulationGain.gain.value = config.modulation.depth

      modulation.connect(modulationGain)
      if (filter) {
        modulationGain.connect(filter.frequency)
      }
      modulation.start()
    }

    // Connect chain: source -> gain -> filter -> destination
    source.connect(gain)
    if (filter) {
      gain.connect(filter)
      filter.connect(context.destination)
    } else {
      gain.connect(context.destination)
    }

    const nodes: SyntheticNodes = { source, gain }
    if (filter) nodes.filter = filter
    if (modulation) nodes.modulation = modulation
    if (modulationGain) nodes.modulationGain = modulationGain

    nodesRef.current.set(soundId, nodes)
    return nodes
  }, [getAudioContext, getNoiseBuffer])

  // Start playing a sound
  const startSound = useCallback((soundId: string) => {
    const config = getSyntheticConfig(soundId)
    if (!config) return

    const nodes = createNodes(soundId, config)
    nodes.source.start()
  }, [getSyntheticConfig, createNodes])

  // Stop and cleanup nodes for a sound
  const stopSound = useCallback((soundId: string) => {
    const nodes = nodesRef.current.get(soundId)
    if (!nodes) return

    // Fade out
    fadeVolume(nodes.gain, 0, 0.3)

    // Stop after fade
    setTimeout(() => {
      nodes.source.stop()
      nodes.source.disconnect()
      nodes.gain.disconnect()
      if (nodes.filter) {
        nodes.filter.disconnect()
      }
      if (nodes.modulation) {
        nodes.modulation.stop()
        nodes.modulation.disconnect()
      }
      if (nodes.modulationGain) {
        nodes.modulationGain.disconnect()
      }
      nodesRef.current.delete(soundId)
    }, 300)
  }, [fadeVolume])

  // Update volume for a sound
  const updateVolume = useCallback((soundId: string, volume: number) => {
    const nodes = nodesRef.current.get(soundId)
    if (!nodes) return

    const targetVolume = calculateVolume(volume, soundId)
    fadeVolume(nodes.gain, targetVolume)
  }, [calculateVolume, fadeVolume])

  // Handle active sounds changes
  useEffect(() => {
    const syntheticSounds = activeSounds.filter(sound => getSyntheticConfig(sound.id))

    // Resume context if needed
    resumeContext()

    // Add new sounds
    syntheticSounds.forEach(sound => {
      if (!nodesRef.current.has(sound.id)) {
        if (!isPaused && hasUserGesture) {
          startSound(sound.id)
          updateVolume(sound.id, sound.volume)
        }
      } else {
        // Update volume if already playing
        updateVolume(sound.id, sound.volume)
      }
    })

    // Remove old sounds
    const currentIds = syntheticSounds.map(s => s.id)
    const previousIds = activeSoundIdsRef.current
    const removedIds = previousIds.filter(id => !currentIds.includes(id))
    removedIds.forEach(stopSound)

    activeSoundIdsRef.current = currentIds
  }, [activeSounds, isPaused, hasUserGesture, getSyntheticConfig, resumeContext, startSound, updateVolume, stopSound])

  // Handle pause/play
  useEffect(() => {
    if (isPaused) {
      // Fade out all
      nodesRef.current.forEach((nodes, soundId) => {
        fadeVolume(nodes.gain, 0)
      })
    } else if (hasUserGesture) {
      // Fade in all to their current volumes
      activeSounds.forEach(sound => {
        const nodes = nodesRef.current.get(sound.id)
        if (nodes) {
          const targetVolume = calculateVolume(sound.volume, sound.id)
          fadeVolume(nodes.gain, targetVolume)
        }
      })
    } else {
      setAutoplayBlocked(true)
    }
  }, [isPaused, hasUserGesture, activeSounds, fadeVolume, calculateVolume, setAutoplayBlocked])

  // Handle master volume changes - update all playing sounds
  useEffect(() => {
    if (isPaused || !hasUserGesture) return;
    
    // Update volume for all currently playing sounds
    activeSounds.forEach(sound => {
      const nodes = nodesRef.current.get(sound.id);
      if (nodes) {
        const targetVolume = calculateVolume(sound.volume, sound.id);
        fadeVolume(nodes.gain, targetVolume);
      }
    });
  }, [masterVolume, calculateVolume, fadeVolume, isPaused, hasUserGesture, activeSounds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      nodesRef.current.forEach((nodes, soundId) => {
        stopSound(soundId)
      })
      // Keep context and cache for persistence across navigation
    }
  }, [stopSound])

  return {}
}