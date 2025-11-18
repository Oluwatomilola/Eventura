# Eventura Architecture

This document provides an overview of the Eventura platform's architecture, components, and data flow.

## System Overview

Eventura is built as a decentralized application (dApp) with the following key components:

1. **Frontend**: Next.js application with TypeScript and React
2. **Smart Contracts**: Solidity contracts deployed on Base blockchain
3. **Wallet Integration**: Web3 wallet connectivity (MetaMask, WalletConnect)
4. **IPFS**: Decentralized storage for event images and metadata
5. **Indexing**: The Graph for efficient blockchain data querying

## High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Frontend      │────▶│   Smart         │────▶│   Base          │
│   (Next.js)     │     │   Contracts     │     │   Blockchain    │
│                 │     │                 │     │                 │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │                         ▲
         │                         │
         ▼                         │
┌─────────────────┐     ┌─────────┴─────────┐
│                 │     │                   │
│   IPFS          │     │   The Graph      │
│   (File Storage)│     │   (Indexing)     │
│                 │     │                   │
└─────────────────┘     └───────────────────┘
```

## Frontend Architecture

The frontend is built with Next.js and follows these key principles:

- **App Router**: Uses Next.js 14+ App Router for routing and data fetching
- **State Management**: Zustand for global state management
- **Styling**: Tailwind CSS with custom components
- **Web3 Integration**: Viem and Wagmi for blockchain interactions
- **UI Components**: Reusable components in `components/` directory
- **Hooks**: Custom React hooks in `hooks/` directory for business logic

## Smart Contract Architecture

### Core Contracts

1. **EventFactory**
   - Deploys new Event contracts
   - Tracks all events created on the platform
   - Manages event metadata and ownership

2. **Event** (deployed per event)
   - Manages ticket minting and transfers
   - Handles ticket pricing and supply
   - Implements access control for event organizers

3. **TicketMarketplace**
   - Secondary market for ticket resale
   - Handles listing, buying, and selling of tickets
   - Implements platform fees and royalty distribution

### Key Design Patterns

- **Factory Pattern**: For creating new event contracts
- **Proxy Pattern**: For upgradeable contracts (if implemented)
- **Access Control**: Using OpenZeppelin's AccessControl
- **Reentrancy Guard**: For secure token transfers

## Data Flow

### Ticket Purchase Flow

1. User connects wallet to the dApp
2. User selects event and clicks "Buy Ticket"
3. Frontend requests wallet signature for transaction
4. Smart contract mints NFT ticket to user's wallet
5. Transaction is confirmed on-chain
6. UI updates to reflect new ticket in user's collection

### Event Creation Flow

1. Organizer connects wallet and fills event details
2. Frontend uploads event image to IPFS
3. Smart contract creates new Event contract
4. Event contract is deployed with initial parameters
5. Event is indexed by The Graph for efficient querying

## Storage

### On-Chain Storage
- Event metadata (minimal)
- Ticket ownership and transfers
- Marketplace listings and offers

### Off-Chain Storage (IPFS)
- Event images
- Detailed event descriptions
- Organizer profiles
- Ticket metadata (if applicable)

## Security Considerations

1. **Smart Contract Security**
   - Comprehensive test coverage
   - Formal verification (if applicable)
   - Regular security audits

2. **Frontend Security**
   - Input validation
   - XSS protection
   - Rate limiting on API routes

3. **Wallet Security**
   - No private key handling in the frontend
   - Clear transaction signing prompts
   - Phishing protection

## Scalability

1. **Layer 2 Solution**
   - Built on Base (Ethereum L2) for low fees and fast transactions
   - Optimized contract storage to minimize gas costs

2. **Indexing**
   - The Graph for efficient querying of on-chain data
   - Client-side caching for better performance

3. **Content Delivery**
   - IPFS for decentralized file storage
   - CDN for static assets

## Monitoring and Analytics

1. **On-chain**
   - Transaction success/failure rates
   - Gas usage metrics
   - Contract events and logs

2. **Off-chain**
   - Application performance monitoring
   - Error tracking
   - User analytics (privacy-focused)
