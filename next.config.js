/** @type {import('next').NextConfig} */
const nextConfig = {
  // distDir: 'build',
  // output: 'export',
  // typescript: {
  //     ignoreBuildErrors: true, // 빌드 중 에러를 무시
  // },
  reactStrictMode: true,
  transpilePackages: ["antd"],
};

module.exports = nextConfig;
