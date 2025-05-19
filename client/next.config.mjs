/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // ⬅️ enables `next export`
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3-inventorymanagementmel.s3.ap-southeast-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // ⬅️ optional: skip ESLint errors in build
  },
};

export default nextConfig;