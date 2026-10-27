/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'ecuador.travel',
      },
      {
        protocol: 'https',
        hostname: 'www.lahora.com.ec',
      },
      {
        protocol: 'https',
        hostname: 'www.carchi.gob.ec',
      },
      {
        protocol: 'https',
        hostname: 'imbabura.travel',
      },
    ],
  },
};

export default nextConfig;
