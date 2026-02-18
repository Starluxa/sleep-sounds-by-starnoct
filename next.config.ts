import type { NextConfig } from "next";

// Suppress baseline-browser-mapping warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    args.length > 0 &&
    typeof args[0] === 'string' &&
    args[0].includes('baseline-browser-mapping')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

/**
 * Configuration for Next.js 14 with React 18
 * - Stable versions for production reliability
 * - Turbopack enabled for faster builds
 */

const nextConfig: NextConfig = {
  generateEtags: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 0,
    formats: ['image/avif', 'image/webp'], // Use modern formats
    deviceSizes: [380, 760, 1080, 1920], // Responsive image sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true,
  },
  output: process.env.NEXT_PUBLIC_IS_MOBILE === 'true' ? 'export' : undefined,
  // Enable production optimizations
  productionBrowserSourceMaps: true,
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header for security
  
  // Modern JavaScript output - reduces bundle size by excluding legacy polyfills
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Security and performance headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          // HSTS - Force HTTPS for 2 years
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // XFO - Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // COOP - Isolate browsing context
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          // Content Security Policy
          {
                      key: 'Content-Security-Policy',
                      value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self' blob: data:; connect-src 'self'; frame-ancestors 'self';"
                    },
          // Prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
      // Cache static assets - DISABLED for development stability
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
        ],
      },
      {
        source: '/sounds/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;