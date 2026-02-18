import { App } from '@capacitor/app';
import { IAppLifecycle } from '../../core/visuals/starry/types';

/**
 * CapacitorAppLifecycle Infrastructure Adapter
 * 
 * Implements IAppLifecycle using the Capacitor App plugin.
 * This is a "Dumb Infrastructure" layer that wraps native APIs.
 */
export class CapacitorAppLifecycle implements IAppLifecycle {
  /**
   * Subscribes to app state changes using Capacitor's App.addListener.
   * @param callback Function to call when state changes
   * @returns Unsubscribe function
   */
  public onStateChange(callback: (isActive: boolean) => void): () => void {
    const handlePromise = App.addListener('appStateChange', (state) => {
      callback(state.isActive);
    });

    // Return a cleanup function that removes the listener
    return () => {
      handlePromise.then((handle) => {
        handle.remove();
      });
    };
  }
}
