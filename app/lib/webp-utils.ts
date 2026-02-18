/**
 * WebP Detection and Image Optimization Utilities
 *
 * Provides browser compatibility detection for WebP format
 * and smart image loading with fallbacks for older browsers.
 */

/**
 * Detects if the browser supports WebP images
 */
export function supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
        // Quick check using canvas if available
        if (typeof window === 'undefined') {
            // Server-side rendering - assume no WebP support
            resolve(false);
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;

        // Check if canvas is supported and can convert to WebP
        if (canvas.toDataURL && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
            resolve(true);
        } else {
            // Fallback: try to load a tiny WebP image
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        }
    });
}

/**
 * Handles WebP image path with fallback to JPG
 */
export function getWebPImagePath(imagePath: string, quality: 'high' | 'medium' | 'low' | 'lowest' = 'medium'): string {
    if (typeof window === 'undefined') {
        // Server-side - return original path for now
        return imagePath;
    }

    // If it's already a WebP file, return as-is
    if (imagePath.endsWith('.webp')) {
        return imagePath;
    }

    // For JPG files, try to find corresponding WebP version
    const basePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const webPPath = basePath.replace('.jpg', '.webp');

    return `/${webPPath}`;
}

/**
 * Gets the appropriate image path based on WebP support
 */
export function getOptimizedImagePath(imagePath: string, quality: 'high' | 'medium' | 'low' | 'lowest' = 'medium'): string {
    // For now, return the original path - the Next.js Image component will handle optimization
    return imagePath;
}

/**
 * Image optimization configuration
 */
export const imageOptimizationConfig = {
    // Quality settings (1-100, where 100 is best quality)
    quality: {
        high: 90,
        medium: 75,
        low: 60,
        lowest: 45
    },
    // File size targets (in bytes)
    sizeTargets: {
        thumbnail: 50 * 1024,    // 50KB
        mobile: 150 * 1024,      // 150KB
        desktop: 300 * 1024      // 300KB
    }
} as const;