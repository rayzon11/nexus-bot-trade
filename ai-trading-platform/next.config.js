/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk']
  },
  images: {
    domains: ['api.dicebear.com', 'avatars.githubusercontent.com']
  }
}

module.exports = nextConfig
