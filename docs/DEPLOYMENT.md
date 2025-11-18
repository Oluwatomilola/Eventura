# Deployment Guide

This guide provides step-by-step instructions for deploying the Eventura platform, including smart contracts and the frontend application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Smart Contract Deployment](#smart-contract-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Verification](#verification)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### For Smart Contracts
- Node.js (v18+)
- pnpm or npm
- Git
- Hardhat
- An Ethereum wallet with testnet ETH (for testnet deployment)
- [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/) account
- [Etherscan API key](https://etherscan.io/apis) (for contract verification)
- [Pinata](https://www.pinata.cloud/) account (for IPFS file storage)

### For Frontend
- All the above plus:
- Vercel account (recommended) or other hosting provider
- Domain name (optional but recommended)

## Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/eventura.git
   cd eventura
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Copy the example environment file and update with your values:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   ```
   # Network RPC URLs
   NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
   NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   
   # WalletConnect
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
   
   # Deployment
   DEPLOYER_PRIVATE_KEY=your-private-key
   
   # API Keys
   ALCHEMY_API_KEY=your-alchemy-api-key
   BASESCAN_API_KEY=your-basescan-api-key
   PINATA_API_KEY=your-pinata-api-key
   PINATA_SECRET_KEY=your-pinata-secret-key
   
   # Contract Addresses (will be filled after deployment)
   NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=
   NEXT_PUBLIC_TICKET_MARKETPLACE_ADDRESS=
   
   # Marketplace Fees
   FEE_RECIPIENT=your-fee-recipient-address
   MARKET_FEE_BPS=250  # 2.5% in basis points
   ```

## Smart Contract Deployment

### Local Development

1. **Start a local Hardhat node**
   ```bash
   cd packages/contracts
   npx hardhat node
   ```

2. **In a new terminal, deploy to local network**
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

### Testnet Deployment (Base Sepolia)

1. **Compile contracts**
   ```bash
   npx hardhat compile
   ```

2. **Deploy to Base Sepolia**
   ```bash
   npx hardhat run scripts/deploy.ts --network base-sepolia
   ```

3. **Verify contracts on BaseScan**
   ```bash
   npx hardhat verify --network base-sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
   ```

### Mainnet Deployment (Base)

1. **Double-check environment variables**
   Ensure all variables are set correctly for mainnet.

2. **Deploy to Base Mainnet**
   ```bash
   npx hardhat run scripts/deploy.ts --network base
   ```

3. **Verify contracts on BaseScan**
   ```bash
   npx hardhat verify --network base <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
   ```

## Frontend Deployment

### Vercel (Recommended)

1. **Push your code to a Git repository**
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import your repository to Vercel**
   - Go to [Vercel](https://vercel.com/)
   - Click "Add New" → "Project"
   - Import your Git repository
   - Configure the project:
     - Framework Preset: Next.js
     - Root Directory: `apps/web`
     - Build Command: `cd ../.. && pnpm install && pnpm build`
     - Output Directory: `apps/web/.next`
     - Install Command: `cd ../.. && pnpm install`

3. **Add environment variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add all variables from your local `.env` file
   - Make sure to prefix with `NEXT_PUBLIC_` for client-side variables

4. **Deploy**
   - Click "Deploy" and wait for the build to complete
   - Vercel will provide you with a deployment URL

### Self-Hosted

1. **Build the application**
   ```bash
   cd apps/web
   pnpm build
   ```

2. **Start the production server**
   ```bash
   pnpm start
   ```

3. **Set up a reverse proxy (Nginx example)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Set up SSL (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## Verification

### Contract Verification

1. **Verify on BaseScan**
   ```bash
   npx hardhat verify --network base <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
   ```

2. **Verify contract interactions**
   - Test all contract functions using the frontend
   - Verify transactions on [BaseScan](https://basescan.org/)

### Frontend Verification

1. **Check the production build**
   - Visit your deployed URL
   - Test all user flows
   - Check console for errors

2. **Verify environment variables**
   - Ensure all required environment variables are set
   - Test API endpoints

## Post-Deployment

### Update Documentation
- Update contract addresses in the repository
- Update deployment documentation if needed

### Set Up Monitoring
- Set up error tracking (Sentry, LogRocket)
- Set up analytics (Google Analytics, Mixpanel)
- Set up uptime monitoring (UptimeRobot, Better Stack)

### Security Hardening
- Set up rate limiting
- Configure CORS properly
- Enable security headers

## Troubleshooting

### Common Issues

**Contract Deployment Fails**
- Check your wallet has enough ETH for gas
- Verify RPC URL is correct
- Check gas prices (use a gas tracker)

**Verification Fails**
- Ensure constructor arguments are correct
- Check contract is deployed on the correct network
- Try flattening the contract and verifying manually

**Frontend Build Fails**
- Check for TypeScript errors
- Ensure all environment variables are set
- Check Node.js version compatibility

**Wallet Connection Issues**
- Ensure wallet is connected to the correct network
- Check if wallet extension is installed and unlocked
- Try clearing browser cache

## Rollback Plan

1. **Smart Contracts**
   - Pause the contract if possible
   - Deploy a new version with fixes
   - Migrate data if necessary

2. **Frontend**
   - Revert to previous deployment in Vercel
   - Or rollback to previous Git commit and redeploy

## Support

For deployment support, please contact the development team or open an issue in the repository.
