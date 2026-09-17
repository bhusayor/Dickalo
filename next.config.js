/**
 * Next.js configuration for DICKALO.
 *
 * Notable choices:
 * - `optimizePackageImports` keeps GSAP and Framer Motion tree-shaken.
 * - The hero uses a pre-rendered Blender sequence on a 2D canvas.
 * - Long-lived immutable caching for videos and fonts served from /public.
 * - A conservative security header set. `Permissions-Policy` is deliberately tight
 *   because nothing on this site needs camera, mic or geolocation.
 */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const immutableAssetCache =
  process.env.NODE_ENV === 'production'
    ? 'public, max-age=31536000, immutable'
    : 'no-store, max-age=0';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow a production verification build alongside the IDE's dev server.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1440, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  experimental: {
    optimizePackageImports: ['framer-motion', 'gsap', 'lenis'],
    scrollRestoration: true,
  },

  compiler: {
    // Strip console output in production, but keep errors and warnings so Vercel
    // runtime logs stay useful.
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    styledComponents: true,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      {
        source: '/videos/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/images/hero-construction/v1/:path*',
        headers: [{ key: 'Cache-Control', value: immutableAssetCache }],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/portfolio', destination: '/projects', permanent: true },
      { source: '/work', destination: '/projects', permanent: true },
      { source: '/team', destination: '/about#team', permanent: true },
      { source: '/about/team', destination: '/about#team', permanent: true },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
