// next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Recommended setting
  // ... any other configurations you had

  images: {
    remotePatterns: [
      // Keep other patterns if needed, e.g., for googleusercontent
      // {
      //   protocol: 'http', // Or 'https'
      //   hostname: 'lh3.googleusercontent.com',
      //   pathname: '**',
      // },
      // *** CORRECT FORMAT FOR drive.google.com ***
      {
        protocol: "https", // Use https as the uc?export=view link is typically https
        hostname: "drive.google.com",
        pathname: "/uc/**", // This pattern should match the /uc?export=view&id=... format
      },
    ],
  },

  // ... rest of your next.config.js
};

module.exports = nextConfig;
