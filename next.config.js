/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ["uuid", "fs", "path"],
  },
  // 정적 생성을 하지 않고 SSR로 처리
  staticPageGenerationTimeout: 120,
  // headers() 및 cookies() 사용을 허용
  serverActions: {
    bodySizeLimit: "2mb",
  },
};

export default nextConfig;
