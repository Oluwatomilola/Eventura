/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@base-ticketing/contracts'],

  // Performance budgets
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    // Allow external image sources using Next.js 14+ remotePatterns
    remotePatterns: [
      // Unsplash images for sample events
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      // IPFS gateways for decentralized storage
      { protocol: 'https', hostname: 'ipfs.io', pathname: '/**' },
      { protocol: 'https', hostname: 'gateway.pinata.cloud', pathname: '/**' },
      { protocol: 'https', hostname: 'ipfs.infura.io', pathname: '/**' },
      { protocol: 'https', hostname: '**.ipfs.dweb.link', pathname: '/**' },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fallbacks for node modules not available in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
      // REOWN/WalletConnect optional dependencies (not needed in browser)
      'pino-pretty': false,
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
    };

    // Suppress specific module warnings that are safe to ignore
    config.ignoreWarnings = [
      // MetaMask SDK optional React Native dependencies
      {
        module: /node_modules\/@metamask\/sdk/,
        message: /Can't resolve '@react-native-async-storage\/async-storage'/,
      },
      // WalletConnect pino-pretty (only used for development logging)
      {
        module: /node_modules\/@walletconnect/,
        message: /Can't resolve 'pino-pretty'/,
      },
      {
        module: /node_modules\/pino/,
        message: /Can't resolve 'pino-pretty'/,
      },
    ];

    return config;
  },

  // Performance monitoring
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

module.exports = withBundleAnalyzer(nextConfig);
