// Base network chain configurations
import { Chain } from 'viem';

export const baseMainnet: Chain = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
    public: {
      http: ['https://mainnet.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://basescan.org',
    },
  },
  contracts: {
    // TODO: Add common contract addresses if needed
  },
};

export const baseSepolia: Chain = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
    public: {
      http: ['https://sepolia.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://sepolia.basescan.org',
    },
  },
  testnet: true,
};

export const supportedChains = [baseMainnet, baseSepolia] as const;
import { Chain } from "viem";

// Base Mainnet
export const baseMainnet: Chain = {
  id: 8453,
  name: "Base",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: "https://basescan.org",
    },
  },
};

// Base Sepolia Testnet
export const baseSepolia: Chain = {
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: "https://sepolia.basescan.org",
    },
  },
};
