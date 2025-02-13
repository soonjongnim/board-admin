require('dotenv').config();

console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // distDir: 'build',
  output: 'export',
  // typescript: {
  //     ignoreBuildErrors: true, // 빌드 중 에러를 무시
  // },
  reactStrictMode: true,
  transpilePackages: ["antd"],
  // basePath: '/admin', // 기본 경로 설정
  // async rewrites() {
  //   return [
  //     {
  //       source: "/admin/api/auth/:path*", // /admin/api/auth로 시작하는 요청을
  //       destination: "/api/auth/:path*", // 원래의 /admin/api/auth 경로로 매핑
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
