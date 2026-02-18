
import { AudioOrchestrator } from './application/audio/AudioOrchestrator';
import { IAudioPort } from './application/sounds/ports/IAudioPort';
import { MixEntity } from './domain/sounds/entities/MixEntity';

// Mock AudioPort
class MockAudioPort implements IAudioPort {
  public pauseAllCalled = false;
  public resumeAllCalled = false;
  public stopAllCalled = false;
  public playCalled = false;
  public setVolumeCalled = false;
  public setMasterVolumeCalled = false;
  public stopCalled = false;

  async play(trackId: string, url: string, volume: number): Promise<void> { this.playCalled = true; }
  async stop(trackId: string): Promise<void> { this.stopCalled = true; }
  async stopAll(): Promise<void> { this.stopAllCalled = true; }
  async setVolume(trackId: string, volume: number): Promise<void> { this.setVolumeCalled = true; }
  async setMasterVolume(volume: number): Promise<void> { this.setMasterVolumeCalled = true; }
  async pauseAll(): Promise<void> { this.pauseAllCalled = true; }
  async resumeAll(): Promise<void> { this.resumeAllCalled = true; }
  
  // For AudioOrchestrator compatibility if it uses execute
  async execute(command: any): Promise<void> {
    if (command.type === 'PLAY') this.playCalled = true;
    if (command.type === 'STOP') this.stopCalled = true;
    if (command.type === 'SET_VOLUME') this.setVolumeCalled = true;
    if (command.type === 'SET_MASTER_VOLUME') this.setMasterVolumeCalled = true;
    if (command.type === 'PAUSE_ALL') this.pauseAllCalled = true;
    if (command.type === 'RESUME_ALL') this.resumeAllCalled = true;
  }
}

async function runTest() {
  console.log('Starting Verification Test...');

  const audioPort = new MockAudioPort();
  const orchestrator = new AudioOrchestrator(audioPort as any);

  // 1. Add a sound
  console.log('Adding sound...');
  await orchestrator.addSound('rain');

  // 2. Call handleSystemInterrupt('PAUSE')
  console.log('Calling handleSystemInterrupt("PAUSE")...');
  if (typeof (orchestrator as any).handleSystemInterrupt === 'function') {
    await (orchestrator as any).handleSystemInterrupt('PAUSE');
  } else {
    console.error('Error: handleSystemInterrupt not found on Orchestrator');
    process.exit(1);
  }

  // 3. Verify audioPort.pauseAll() was called
  if (audioPort.pauseAllCalled) {
    console.log('✅ audioPort.pauseAll() was called.');
  } else {
    console.error('❌ audioPort.pauseAll() was NOT called.');
    process.exit(1);
  }

  // 4. Verify orchestrator.getMixState().isPaused (or equivalent) is true
  const mixState = orchestrator.getMixState() as any;
  if (mixState.isPaused === true || (orchestrator as any).isPaused === true) {
    console.log('✅ Orchestrator state isPaused is true.');
  } else {
    console.error('❌ Orchestrator state isPaused is NOT true.');
    console.log('Current state:', { mixPaused: mixState.isPaused, orchPaused: (orchestrator as any).isPaused });
    process.exit(1);
  }

  // 5. Call handleSystemRecovery()
  console.log('Calling handleSystemRecovery()...');
  if (typeof (orchestrator as any).handleSystemRecovery === 'function') {
    await (orchestrator as any).handleSystemRecovery();
  } else {
    console.error('Error: handleSystemRecovery not found on Orchestrator');
    process.exit(1);
  }

  // 6. Verify audioPort.resumeAll() was called
  if (audioPort.resumeAllCalled) {
    console.log('✅ audioPort.resumeAll() was called.');
  } else {
    console.error('❌ audioPort.resumeAll() was NOT called.');
    process.exit(1);
  }

  console.log('Verification Test Passed Successfully!');
}

runTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
import { AudioOrchestrator } from './application/audio/AudioOrchestrator';
import { IAudioPort } from './application/sounds/ports/IAudioPort';
import { MixEntity } from './domain/sounds/entities/MixEntity';

// Mock AudioPort
class MockAudioPort implements IAudioPort {
  public pauseAllCalled = false;
  public resumeAllCalled = false;
  public stopAllCalled = false;
  public playCalled = false;
  public setVolumeCalled = false;
  public setMasterVolumeCalled = false;
  public stopCalled = false;

  async play(trackId: string, url: string, volume: number): Promise<void> { this.playCalled = true; }
  async stop(trackId: string): Promise<void> { this.stopCalled = true; }
  async stopAll(): Promise<void> { this.stopAllCalled = true; }
  async setVolume(trackId: string, volume: number): Promise<void> { this.setVolumeCalled = true; }
  async setMasterVolume(volume: number): Promise<void> { this.setMasterVolumeCalled = true; }
  async pauseAll(): Promise<void> { this.pauseAllCalled = true; }
  async resumeAll(): Promise<void> { this.resumeAllCalled = true; }
  
  // For AudioOrchestrator compatibility if it uses execute
  async execute(command: any): Promise<void> {
    if (command.type === 'PLAY') this.playCalled = true;
    if (command.type === 'STOP') this.stopCalled = true;
    if (command.type === 'SET_VOLUME') this.setVolumeCalled = true;
    if (command.type === 'SET_MASTER_VOLUME') this.setMasterVolumeCalled = true;
    if (command.type === 'PAUSE_ALL') this.pauseAllCalled = true;
    if (command.type === 'RESUME_ALL') this.resumeAllCalled = true;
  }
}

async function runTest() {
  console.log('Starting Verification Test...');

  const audioPort = new MockAudioPort();
  const orchestrator = new AudioOrchestrator(audioPort as any);

  // 1. Add a sound
  console.log('Adding sound...');
  await orchestrator.addSound('rain');

  // 2. Call handleSystemInterrupt('PAUSE')
  console.log('Calling handleSystemInterrupt("PAUSE")...');
  if (typeof (orchestrator as any).handleSystemInterrupt === 'function') {
    await (orchestrator as any).handleSystemInterrupt('PAUSE');
  } else {
    console.error('Error: handleSystemInterrupt not found on Orchestrator');
    process.exit(1);
  }

  // 3. Verify audioPort.pauseAll() was called
  if (audioPort.pauseAllCalled) {
    console.log('✅ audioPort.pauseAll() was called.');
  } else {
    console.error('❌ audioPort.pauseAll() was NOT called.');
    process.exit(1);
  }

  // 4. Verify orchestrator.getMixState().isPaused (or equivalent) is true
  const mixState = orchestrator.getMixState() as any;
  if (mixState.isPaused === true || (orchestrator as any).isPaused === true) {
    console.log('✅ Orchestrator state isPaused is true.');
  } else {
    console.error('❌ Orchestrator state isPaused is NOT true.');
    console.log('Current state:', { mixPaused: mixState.isPaused, orchPaused: (orchestrator as any).isPaused });
    process.exit(1);
  }

  // 5. Call handleSystemRecovery()
  console.log('Calling handleSystemRecovery()...');
  if (typeof (orchestrator as any).handleSystemRecovery === 'function') {
    await (orchestrator as any).handleSystemRecovery();
  } else {
    console.error('Error: handleSystemRecovery not found on Orchestrator');
    process.exit(1);
  }

  // 6. Verify audioPort.resumeAll() was called
  if (audioPort.resumeAllCalled) {
    console.log('✅ audioPort.resumeAll() was called.');
  } else {
    console.error('❌ audioPort.resumeAll() was NOT called.');
    process.exit(1);
  }

  console.log('Verification Test Passed Successfully!');
}

runTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});

import { IAudioPort } from './application/sounds/ports/IAudioPort';
import { MixEntity } from './domain/sounds/entities/MixEntity';

// Mock AudioPort
class MockAudioPort implements IAudioPort {
  public pauseAllCalled = false;
  public resumeAllCalled = false;
  public stopAllCalled = false;
  public playCalled = false;
  public setVolumeCalled = false;
  public setMasterVolumeCalled = false;
  public stopCalled = false;

  async play(trackId: string, url: string, volume: number): Promise<void> { this.playCalled = true; }
  async stop(trackId: string): Promise<void> { this.stopCalled = true; }
  async stopAll(): Promise<void> { this.stopAllCalled = true; }
  async setVolume(trackId: string, volume: number): Promise<void> { this.setVolumeCalled = true; }
  async setMasterVolume(volume: number): Promise<void> { this.setMasterVolumeCalled = true; }
  async pauseAll(): Promise<void> { this.pauseAllCalled = true; }
  async resumeAll(): Promise<void> { this.resumeAllCalled = true; }
  
  // For AudioOrchestrator compatibility if it uses execute
  async execute(command: any): Promise<void> {
    if (command.type === 'PLAY') this.playCalled = true;
    if (command.type === 'STOP') this.stopCalled = true;
    if (command.type === 'SET_VOLUME') this.setVolumeCalled = true;
    if (command.type === 'SET_MASTER_VOLUME') this.setMasterVolumeCalled = true;
    if (command.type === 'PAUSE_ALL') this.pauseAllCalled = true;
    if (command.type === 'RESUME_ALL') this.resumeAllCalled = true;
  }
}

async function runTest() {
  console.log('Starting Verification Test...');

  const audioPort = new MockAudioPort();
  const orchestrator = new AudioOrchestrator(audioPort as any);

  // 1. Add a sound
  console.log('Adding sound...');
  await orchestrator.addSound('rain');

  // 2. Call handleSystemInterrupt('PAUSE')
  console.log('Calling handleSystemInterrupt("PAUSE")...');
  if (typeof (orchestrator as any).handleSystemInterrupt === 'function') {
    await (orchestrator as any).handleSystemInterrupt('PAUSE');
  } else {
    console.error('Error: handleSystemInterrupt not found on Orchestrator');
    process.exit(1);
  }

  // 3. Verify audioPort.pauseAll() was called
  if (audioPort.pauseAllCalled) {
    console.log('✅ audioPort.pauseAll() was called.');
  } else {
    console.error('❌ audioPort.pauseAll() was NOT called.');
    process.exit(1);
  }

  // 4. Verify orchestrator.getMixState().isPaused (or equivalent) is true
  const mixState = orchestrator.getMixState() as any;
  if (mixState.isPaused === true || (orchestrator as any).isPaused === true) {
    console.log('✅ Orchestrator state isPaused is true.');
  } else {
    console.error('❌ Orchestrator state isPaused is NOT true.');
    console.log('Current state:', { mixPaused: mixState.isPaused, orchPaused: (orchestrator as any).isPaused });
    process.exit(1);
  }

  // 5. Call handleSystemRecovery()
  console.log('Calling handleSystemRecovery()...');
  if (typeof (orchestrator as any).handleSystemRecovery === 'function') {
    await (orchestrator as any).handleSystemRecovery();
  } else {
    console.error('Error: handleSystemRecovery not found on Orchestrator');
    process.exit(1);
  }

  // 6. Verify audioPort.resumeAll() was called
  if (audioPort.resumeAllCalled) {
    console.log('✅ audioPort.resumeAll() was called.');
  } else {
    console.error('❌ audioPort.resumeAll() was NOT called.');
    process.exit(1);
  }

  console.log('Verification Test Passed Successfully!');
}

runTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});

