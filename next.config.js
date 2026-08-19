/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./prisma/dev.db', './prisma/schema.prisma'],
    },
  },
};

module.exports = nextConfig;
