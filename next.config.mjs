/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "phonenotify.hi-team.ir" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
