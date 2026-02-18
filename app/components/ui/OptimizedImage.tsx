'use client';

import { useEffect, useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { supportsWebP, getWebPImagePath } from '@/lib/webp-utils';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
    src: string;
    webpQuality?: 'high' | 'medium' | 'low' | 'lowest';
    fallbackSrc?: string;
}

/**
 * OptimizedImage component that automatically serves WebP images with JPG fallbacks
 *
 * Features:
 * - Automatic WebP detection
 * - Fallback to original format for older browsers
 * - Configurable quality settings
 * - Loading states and error handling
 */
export function OptimizedImage({
    src,
    webpQuality = 'medium',
    fallbackSrc,
    alt,
    className,
    priority = false,
    fetchPriority,
    ...props
}: OptimizedImageProps & { fetchPriority?: 'high' | 'low' | 'auto' }) {
    const [useWebP, setUseWebP] = useState<boolean | null>(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        // Detect WebP support on client-side only
        supportsWebP().then(setUseWebP);
    }, []);

    // Show loading state while detecting WebP support
    if (useWebP === null) {
        return (
            <div
                className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
                style={{
                    width: props.width || '100%',
                    height: props.height || 'auto',
                    aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : undefined
                }}
            />
        );
    }

    // Determine the image source based on WebP support
    let imageSrc = src;
    let webPImageSrc = '';

    if (useWebP) {
        if (src.endsWith('.webp')) {
            // Already a WebP file
            imageSrc = src;
        } else if (src.endsWith('.jpg')) {
            // Try to find WebP version
            webPImageSrc = getWebPImagePath(src, webpQuality);
            imageSrc = webPImageSrc;
        }
    }

    const handleError = () => {
        setImageError(true);
        // If WebP fails and we have a fallback, try the original
        if (useWebP && webPImageSrc && imageSrc === webPImageSrc) {
            imageSrc = fallbackSrc || src;
        }
    };

    const handleLoad = () => {
        setImageError(false);
    };

    return (
        <Image
            {...props}
            src={imageError ? (fallbackSrc || src) : imageSrc}
            alt={alt}
            className={`${className} ${imageError ? 'opacity-50' : ''}`}
            priority={priority}
            fetchPriority={fetchPriority}
            onError={handleError}
            onLoad={handleLoad}
            unoptimized={process.env.NEXT_PUBLIC_IS_MOBILE === 'true'} // Explicit unoptimized for mobile static export
        />
    );
}

/**
 * Simplified image component for sound cards
 */
interface SoundCardImageProps {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function SoundCardImage({ src, alt, className, priority, objectFit = 'cover' }: SoundCardImageProps) {
    // Card images fill their container with intelligent center cropping
    // Use Next/Image in 'fill' mode with cover for best appearance
    const parts = src.split('/');
    const fileName = parts.pop() || '';
    const dir = parts.join('/');
    const base = fileName.replace(/\.[^/.]+$/, '');

    const small = `${dir}/optimized/${base}-380w.webp`;
    const medium = `${dir}/optimized/${base}-760w.webp`;
    const original = src;

    // sizes hint for responsive selection
    const sizes = `(max-width: 640px) 380px, 760px`;

    return (
        <Image
            src={small}
            alt={alt}
            fill
            className={className}
            sizes={sizes}
            unoptimized={process.env.NEXT_PUBLIC_IS_MOBILE === 'true'}
            priority={priority}
            fetchPriority={priority ? 'high' : 'auto'}
            style={{ objectFit, objectPosition: 'center', width: '100%', height: '100%' }}
        />
    );
}