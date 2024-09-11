/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:shortCode',
        destination: '/api/:shortCode',
      },
    ]
  },
};

export default nextConfig;
