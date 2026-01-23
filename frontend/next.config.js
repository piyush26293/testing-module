/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'api.testing-platform.com'],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  },
}

module.exports = nextConfig
