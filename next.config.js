/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // إزالة الإعدادات المتقادمة
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons", "date-fns", "framer-motion"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "localhost",
        port: "7217",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5268",
      },
      {
        protocol: "https",
        hostname: "learnquest.runasp.net",
      },
    ],
    unoptimized: true,
  },

  // تبسيط الإعدادات لتجنب الأخطاء
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `https://localhost:7217/api/:path*`,
      },
      {
        source: "/api/fallback/:path*",
        destination: `http://localhost:5268/api/:path*`,
      },
    ]
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
