/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i8qy5y6gxkdgdcv9.public.blob.vercel-storage.com",
      },
    ],
  },
}

export default nextConfig
