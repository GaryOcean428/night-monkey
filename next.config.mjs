/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude certain directories from being included in the production build
  // This helps reduce build size and improve performance
  webpack: (config, { isServer }) => {
    // Ignore the docs folder and old app folder in builds
    config.watchOptions = {
      ...config.watchOptions,
      ignored: Array.isArray(config.watchOptions?.ignored)
        ? [...config.watchOptions.ignored, "**/docs/**", "**/app/**"]
        : ["**/node_modules/**", "**/docs/**", "**/app/**"]
    };
    return config;
  },

  // Set the output directory for the application
  distDir: ".next",

  // Configure API routes to point to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/backend/api/:path*',
      },
    ];
  },

  // Output a standalone build for better deployment
  output: "standalone",
};

export default nextConfig;
