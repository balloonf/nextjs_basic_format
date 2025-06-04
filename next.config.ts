import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 최적화 설정
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 실험적 기능
  experimental: {
    // 필요한 실험적 기능 추가
  },
  
  // 리다이렉트 설정 예시
  async redirects() {
    return [
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },
  
  // 환경 변수 검증
  env: {
    // 빌드 타임에 사용되는 환경 변수
  },
};

export default nextConfig;
