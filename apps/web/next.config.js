/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@base-ticketing/contracts'],
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
};

module.exports = nextConfig;
