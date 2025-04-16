/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  // 서버 컴포넌트에서 사용할 외부 패키지 지정
  serverExternalPackages: ["fs", "path"],
  // 정적 생성을 하지 않고 SSR로 처리
  staticPageGenerationTimeout: 120,
  // 모든 페이지 동적 렌더링
  exportPathMap: undefined,
  // 모든 페이지를 서버 사이드 렌더링
  trailingSlash: true,
  // 실험적 기능 설정
  experimental: {
    // 실험적 기능만 여기에 추가
  },
};

export default nextConfig;
