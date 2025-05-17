import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['static.usernames.app-backend.toolsforhumanity.com'],
  },
  allowedDevOrigins: ['0919-2001-448a-20e0-9ecc-e5b2-acb8-9266-f404.ngrok-free.app'], // Hapus "https://"
  reactStrictMode: false,
};

export default nextConfig;