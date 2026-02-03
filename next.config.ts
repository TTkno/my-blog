import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      { source: "/blog", destination: "/archives", permanent: false },
      { source: "/blog/", destination: "/archives", permanent: false },
    ]
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // 若文章/头像引用站外图，在此添加域名，例如: ["avatars.githubusercontent.com"]
    // remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ]
  },
};

export default nextConfig;
