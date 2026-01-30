import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // 若文章/头像引用站外图，在此添加域名，例如: ["avatars.githubusercontent.com"]
    // remotePatterns: [],
  },
};

export default nextConfig;
