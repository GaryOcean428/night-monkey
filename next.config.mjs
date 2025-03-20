/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude certain directories from being included in the production build
  // This helps reduce build size and improve performance
  webpack: (config, { isServer }) => {
    // Ignore the docs folder in production builds
    if (process.env.NODE_ENV === 'production') {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [...(config.watchOptions?.ignored || []), '**/docs/**']
      };
    }
    return config;
  },
  
  // Configure output for better Vercel compatibility
  output: 'standalone',
};

export default nextConfig;
