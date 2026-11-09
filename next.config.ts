import type { NextConfig } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.specmob.com').replace(/\/+$/, '')

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'specmob.vercel.app' }],
        destination: `${SITE_URL}/:path*`,
        permanent: true,
      },
    ]
  },
}

export default nextConfig
