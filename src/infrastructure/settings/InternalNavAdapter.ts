/**
 * Internal Navigation Adapter - Infrastructure Layer
 *
 * This adapter provides a specialized implementation for internal navigation
 * using the Next.js router. It wraps the useRouter hook in a way that can be
 * used by adapters that need navigation capabilities without direct framework coupling.
 *
 * Infrastructure Layer: Mechanism (How navigation is performed)
 * - Uses Next.js useRouter hook for client-side navigation
 * - Provides navigation callback for use by other adapters
 * - Adapts framework-specific routing to domain interface
 */

import { useRouter } from 'next/navigation';

/**
 * NavigationCallback - Function type for navigation operations
 *
 * This callback allows adapters to perform navigation without knowing
 * the specific routing implementation details.
 */
export type NavigationCallback = (path: string) => void;

/**
 * useInternalNavigation - React hook for Next.js router navigation
 *
 * This hook provides a navigation callback that uses Next.js useRouter.
 * It should be used within React components that need navigation capabilities.
 *
 * The hook abstracts the Next.js router implementation, allowing adapters
 * to perform navigation without direct framework dependencies.
 *
 * @returns NavigationCallback function for performing navigation
 */
export function useInternalNavigation(): NavigationCallback {
  const router = useRouter();

  /**
   * Navigation callback that uses Next.js router
   *
   * @param path - The path to navigate to
   */
  const navigate = (path: string): void => {
    if (!path || path.trim() === '') {
      console.warn('InternalNavAdapter: Empty path provided to navigate');
      return;
    }

    try {
      // Use Next.js router for client-side navigation
      // This preserves SPA behavior and handles route transitions properly
      router.push(path);
    } catch (error) {
      console.error('InternalNavAdapter: Failed to navigate to', path, error);
      // Fallback to window.location for critical navigation failures
      window.location.href = path;
    }
  };

  return navigate;
}

/**
 * InternalNavAdapter - Static utility for navigation operations
 *
 * This class provides static methods for navigation that can be used
 * outside of React component context. It serves as a bridge between
 * framework-specific routing and domain-level navigation needs.
 *
 * Note: This adapter requires access to the Next.js router instance,
 * which must be provided by the calling context.
 */
export class InternalNavAdapter {
  /**
   * Creates a navigation callback using a provided router instance
   *
   * This method allows creating navigation callbacks when you have
   * direct access to a router instance (useful for testing or non-hook contexts).
   *
   * @param router - Next.js router instance (from useRouter hook)
   * @returns NavigationCallback function
   */
  static createNavigationCallback(router: ReturnType<typeof useRouter>): NavigationCallback {
    return (path: string): void => {
      if (!path || path.trim() === '') {
        console.warn('InternalNavAdapter: Empty path provided to navigate');
        return;
      }

      try {
        router.push(path);
      } catch (error) {
        console.error('InternalNavAdapter: Failed to navigate to', path, error);
        // Fallback to window.location for critical navigation failures
        window.location.href = path;
      }
    };
  }

  /**
   * Performs navigation using window.location.href
   *
   * This is a fallback navigation method that works in any context
   * but may cause full page reloads instead of client-side routing.
   *
   * @param path - The path to navigate to
   */
  static navigateWithWindowLocation(path: string): void {
    if (!path || path.trim() === '') {
      console.warn('InternalNavAdapter: Empty path provided to navigate');
      return;
    }

    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Use window.location.href - may cause full page reload
    window.location.href = normalizedPath;
  }
}