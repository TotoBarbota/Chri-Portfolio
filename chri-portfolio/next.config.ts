// next.config.js

console.log("Loadig next.config.ts");
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Recommended setting
  // ... any other configurations you had

  images: {
    remotePatterns: [
      new URL("https://lh3.googleusercontent.com/drive-storage/**"),
    ],
  },

  // ... rest of your next.config.js
};

module.exports = nextConfig;
