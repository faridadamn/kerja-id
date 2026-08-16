/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_PROXY_URL || 'http://127.0.0.1:3003'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;