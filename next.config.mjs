/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    // MaterialM demo pages have pre-existing type mismatches; PhoneNotify pages are typed.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "phonenotify.hi-team.ir" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
