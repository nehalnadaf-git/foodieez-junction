import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [], // all images are local assets; extend here when adding external CDN
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
}

export default nextConfig
