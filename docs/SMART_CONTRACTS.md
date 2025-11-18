# Smart Contracts Documentation

This document provides detailed information about the Eventura smart contracts, including architecture, functions, and deployment details.

## Contract Overview

### Core Contracts

1. **EventFactory**
   - Factory contract for deploying new Event contracts
   - Tracks all events created on the platform
   - Implements access control for event creation

2. **Event** (deployed per event)
   - Manages ticket lifecycle (minting, transfers)
   - Implements ERC-721 standard for NFT tickets
   - Handles access control for event organizers

3. **TicketMarketplace**
   - Secondary market for ticket resale
   - Handles listing, buying, and selling of tickets
   - Implements platform fees and royalty distribution

## Contract Addresses

| Network  | EventFactory | TicketMarketplace |
|----------|--------------|-------------------|
| Base Mainnet | `0x...` | `0x...` |
| Base Sepolia Testnet | `0x...` | `0x...` |

## Contract Functions

### EventFactory.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EventFactory
 * @dev Factory contract for creating new Event contracts
 */
contract EventFactory {
    // Creates a new event with the given parameters
    function createEvent(
        string memory name,
        string memory symbol,
        string memory baseURI,
        uint256 maxSupply,
        uint256 ticketPrice,
        address payable organizer
    ) external returns (address);

    // Returns all events created by this factory
    function getAllEvents() external view returns (address[] memory);
}
```

### Event.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Event
 * @dev ERC-721 contract for event tickets
 */
contract Event is ERC721, Ownable {
    // Mints a new ticket to the specified address
    function safeMint(address to) external onlyOwner;

    // Burns a ticket (only callable by owner or approved)
    function burn(uint256 tokenId) external;

    // Updates the base URI for token metadata
    function setBaseURI(string memory baseURI) external onlyOwner;
}
```

### TicketMarketplace.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TicketMarketplace
 * @dev Secondary marketplace for ticket resale
 */
contract TicketMarketplace is ReentrancyGuard, Ownable {
    // Lists a ticket for sale
    function listTicket(
        address nftContract,
        uint256 tokenId,
        uint128 price
    ) external;

    // Buys a listed ticket
    function buyTicket(address nftContract, uint256 tokenId) external payable;

    // Makes an offer on a ticket
    function makeOffer(address nftContract, uint256 tokenId) external payable;

    // Accepts an offer for a ticket
    function acceptOffer(address nftContract, uint256 tokenId) external;
}
```

## Events

### EventFactory Events

```solidity
event EventCreated(
    address indexed eventAddress,
    address indexed creator,
    string name,
    uint256 timestamp
);
```

### Event Events

```solidity
event TicketMinted(
    address indexed to,
    uint256 indexed tokenId,
    uint256 timestamp
);

// Emitted when the base URI is updated
event BaseURIUpdated(string newBaseURI);
```

### TicketMarketplace Events

```solidity
event TicketListed(
    address indexed seller,
    address indexed nftContract,
    uint256 indexed tokenId,
    uint256 price
);

event TicketSold(
    address indexed seller,
    address indexed buyer,
    address indexed nftContract,
    uint256 tokenId,
    uint256 price
);

event OfferMade(
    address indexed offerer,
    address indexed nftContract,
    uint256 indexed tokenId,
    uint256 amount
);
```

## Access Control

- **EventFactory**: Only owner can create events (may be updated to allow anyone with a fee)
- **Event**: Only owner (event organizer) can mint tickets and update metadata
- **TicketMarketplace**: Public marketplace with role-based access for admin functions

## Security Considerations

### Reentrancy Protection
All state-changing functions in the marketplace use OpenZeppelin's `ReentrancyGuard` to prevent reentrancy attacks.

### Access Control
- Uses OpenZeppelin's `Ownable` for basic ownership
- Consider using `AccessControl` for more granular permissions if needed

### Input Validation
- All external inputs are validated
- Price must be greater than zero
- Token IDs must exist
- Caller must be the owner when transferring or burning tokens

## Deployment

### Prerequisites
- Node.js (v16+)
- Hardhat
- Alchemy or Infura API key
- Private key with testnet ETH

### Steps
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file (see `.env.example`)

3. Compile contracts:
   ```bash
   npx hardhat compile
   ```

4. Run tests:
   ```bash
   npx hardhat test
   ```

5. Deploy to testnet:
   ```bash
   npx hardhat run scripts/deploy.ts --network base-sepolia
   ```

## Testing

### Unit Tests
Tests are written using Hardhat and Waffle. Run all tests with:
```bash
npx hardhat test
```

### Test Coverage
Generate a test coverage report:
```bash
npx hardhat coverage
```

## Audits

Smart contracts should be audited before deployment to mainnet. Include audit reports and findings in this section.

## Known Issues

- None currently

## License

MIT
