
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    disableOptimizedLoading: true,
   
  },
  typescript: {
  
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "res.cloudinary.com",
      "localhost",
      "via.placeholder.com",
      "jacket.us.com",
      "d1.fineyst.com",
      "www.fineystjackets.com",
      "fineystjackets.com",
      "192.168.100.14",
      "192.168.100.114"
    ],
  },
}

export default nextConfig







