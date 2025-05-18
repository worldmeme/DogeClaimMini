import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['static.usernames.app-backend.toolsforhumanity.com'],
  },
  // allowedDevOrigins hanya untuk pengembangan lokal, hapus untuk produksi
  // allowedDevOrigins: ['a5eb-2001-448a-20e0-9ecc-e5b2-acb8-9266-f404.ngrok-free.app'],
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://xdoge-app.vercel.app' }, // Sesuaikan dengan domain Vercel
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        source: '/(.*)', // Untuk semua rute
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' }, // Opsional untuk keamanan
        ],
      },
    ];
  },
};

export default nextConfig;