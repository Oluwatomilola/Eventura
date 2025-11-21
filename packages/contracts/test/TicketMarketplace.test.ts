import { expect } from 'chai';
import { ethers } from 'hardhat';
import { deployContracts, createEvent, mintTicket, ZERO_ADDRESS } from './helpers';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('TicketMarketplace', function () {
  describe('Deployment', function () {
    it('should deploy with correct parameters', async function () {
      const { ticketMarketplace, feeRecipient } = await deployContracts();
      
      // Check fee recipient and initial state
      expect(await ticketMarketplace.feeRecipient()).to.equal(feeRecipient.address);
      expect(await ticketMarketplace.paused()).to.be.true; // Should start paused
      expect(await ticketMarketplace.enforcePriceCeiling()).to.be.true; // Price ceiling enabled by default
    });

    it('should initialize correctly', async function () {
      const { ticketMarketplace } = await deployContracts();
      
      // Initialize the contract
      await ticketMarketplace.initialize();
      expect(await ticketMarketplace.paused()).to.be.false;
    });

    it('should not allow non-owner to initialize', async function () {
      const { ticketMarketplace, attendee1 } = await deployContracts();
      
      await expect(
        ticketMarketplace.connect(attendee1).initialize()
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('Listing Tickets', function () {
    it('should allow ticket owner to list for sale', async function () {
      const { eventFactory, eventTicketing, ticketMarketplace, organizer, attendee1 } = await deployContracts();
      await ticketMarketplace.initialize(); // Unpause the contract
      
      // Create event and mint ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Approve marketplace to transfer ticket
      await eventTicketing.connect(attendee1).approve(await ticketMarketplace.getAddress(), tokenId);
      
      // List ticket for sale
      const salePrice = ethers.parseEther('0.15');
      await ticketMarketplace.connect(attendee1).listTicket(
        await eventTicketing.getAddress(),
        tokenId,
        salePrice
      );
      
      // Verify listing
      const listingId = 1; // First listing
      const listing = await ticketMarketplace.listings(listingId);
      expect(listing.seller).to.equal(attendee1.address);
      expect(listing.price).to.equal(salePrice);
      expect(listing.active).to.be.true;
      expect(listing.nft).to.equal(await eventTicketing.getAddress());
      expect(listing.tokenId).to.equal(tokenId);
      
      // Verify ticket was transferred to marketplace
      expect(await eventTicketing.ownerOf(tokenId)).to.equal(await ticketMarketplace.getAddress());
    });

    it('should not allow listing if not ticket owner', async function () {
      const { eventFactory, eventTicketing, ticketMarketplace, organizer, attendee1, attendee2 } = await deployContracts();
      await ticketMarketplace.initialize();
      
      // Create event and mint ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Try to list with non-owner account
      await expect(
        ticketMarketplace.connect(attendee2).listTicket(
          await eventTicketing.getAddress(),
          tokenId,
          ethers.parseEther('0.15')
        )
      ).to.be.revertedWith('Not token owner');
    });

    it('should not allow listing after event has ended', async function () {
      const { eventFactory, eventTicketing, ticketMarketplace, organizer, attendee1 } = await deployContracts();
      await ticketMarketplace.initialize();
      
      // Create event with short duration and mint ticket
      const eventDuration = 60 * 60; // 1 hour
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer, {
        duration: eventDuration
      });
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Approve marketplace
      await eventTicketing.connect(attendee1).approve(await ticketMarketplace.getAddress(), tokenId);
      
      // Fast forward past event end time
      await time.increase(eventDuration + 1);
      
      // Try to list ticket
      await expect(
        ticketMarketplace.connect(attendee1).listTicket(
          await eventTicketing.getAddress(),
          tokenId,
          ethers.parseEther('0.15')
        )
      ).to.be.revertedWith('Event has ended');
    });

    it('should not allow listing if price exceeds maximum allowed', async function () {
      const { eventFactory, eventTicketing, ticketMarketplace, organizer, attendee1 } = await deployContracts();
      await ticketMarketplace.initialize();
      
      // Create event and mint ticket
      const ticketPrice = ethers.parseEther('0.1');
      const { eventId } = await createEvent(eventFactory, organizer, {
        ticketPrice: ticketPrice
      });
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Approve marketplace
      await eventTicketing.connect(attendee1).approve(await ticketMarketplace.getAddress(), tokenId);
      
      // Try to list with price > 2x original price (price ceiling is enabled by default)
      const maxAllowedPrice = (ticketPrice * 200n) / 100n; // 2x original price
      const invalidPrice = maxAllowedPrice + 1n;
      
      await expect(
        ticketMarketplace.connect(attendee1).listTicket(
          await eventTicketing.getAddress(),
          tokenId,
          invalidPrice
        )
      ).to.be.revertedWith('Price exceeds maximum allowed');
      
      // Disable price ceiling and try again
      await ticketMarketplace.togglePriceCeiling();
      await ticketMarketplace.connect(attendee1).listTicket(
        await eventTicketing.getAddress(),
        tokenId,
        invalidPrice
      );
      
      // Should work now
      const listingId = 1;
      const listing = await ticketMarketplace.listings(listingId);
      expect(listing.price).to.equal(invalidPrice);
    });

    it('should not allow listing with zero price', async function () {
      const { eventFactory, eventTicketing, ticketMarketplace, organizer, attendee1 } = await deployContracts();
      
      // Create event and mint ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Approve marketplace
      await eventTicketing.connect(attendee1).approve(await ticketMarketplace.getAddress(), tokenId);
      
      // Try to list with zero price
      await expect(
        ticketMarketplace.connect(attendee1).listTicket(
          await eventTicketing.getAddress(),
          tokenId,
          0
        )
      ).to.be.revertedWith('Price must be greater than 0');
    });
  });

  describe('Canceling Listings', function () {
    it('should allow seller to cancel listing', async function () {
      const { eventFactory, eventTicketing, ticketMarketplace, organizer, attendee1 } = await deployContracts();
      
      // Create event, mint and list ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintAndListTicket(
        eventTicketing, 
        ticketMarketplace, 
        eventId, 
        attendee1, 
        ticketPrice, 
        ethers.parseEther('0.15')
      );
      
      // Cancel listing
      await ticketMarketplace.connect(attendee1).cancelListing(
        await eventTicketing.getAddress(),
        tokenId
      );
      
      // Verify listing is inactive
      const listing = await ticketMarketplace.listings(await eventTicketing.getAddress(), tokenId);
      expect(listing.active).to.be.false;
      
      // Verify ticket is still owned by seller
      expect(await eventTicketing.ownerOf(tokenId)).to.equal(attendee1.address);
    });

    it('should not allow non-sellers to cancel listings', async function () {
      const { eventFactory, eventTicketing, ticketMarketplace, organizer, attendee1, attendee2 } = await deployContracts();
      
      // Create event, mint and list ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintAndListTicket(
        eventTicketing, 
        ticketMarketplace, 
        eventId, 
        attendee1, 
        ticketPrice, 
        ethers.parseEther('0.15')
      );
      
      // Try to cancel with non-seller account
      await expect(
        ticketMarketplace.connect(attendee2).cancelListing(
          await eventTicketing.getAddress(),
          tokenId
        )
      ).to.be.revertedWith('Not the seller');
    });
  });

  describe('Buying Tickets', function () {
    it('should allow buying a listed ticket with proper fee distribution', async function () {
      const { 
        eventFactory, 
        eventTicketing, 
        ticketMarketplace, 
        organizer, 
        attendee1, 

  describe('Admin Functions', function () {
    it('should allow owner to update fee recipient', async function () {
      const { ticketMarketplace, organizer, attendee1 } = await deployContracts();
      
      // Update fee recipient
      await ticketMarketplace.connect(organizer).setFeeRecipient(attendee1.address);
      expect(await ticketMarketplace.feeRecipient()).to.equal(attendee1.address);
    });
    
    it('should not allow non-owner to update fee recipient', async function () {
      const { ticketMarketplace, attendee1 } = await deployContracts();
      
      await expect(
        ticketMarketplace.connect(attendee1).setFeeRecipient(attendee1.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
    
    it('should allow owner to set event royalties', async function () {
      const { ticketMarketplace, organizer } = await deployContracts();
      
      // Set royalty to 5%
      const eventId = 1;
      const royaltyBps = 500; // 5%
      await ticketMarketplace.setEventRoyalty(eventId, royaltyBps);
      
      expect(await ticketMarketplace.eventRoyalties(eventId)).to.equal(royaltyBps);
    });
    
    it('should not allow royalties to exceed maximum', async function () {
      const { ticketMarketplace } = await deployContracts();
      
      await expect(
        ticketMarketplace.setEventRoyalty(1, 1001) // 10.01%
      ).to.be.revertedWith('Royalty too high');
    });
    
    it('should allow owner to toggle price ceiling', async function () {
      const { ticketMarketplace } = await deployContracts();
      
      // Toggle off
      await ticketMarketplace.togglePriceCeiling();
      expect(await ticketMarketplace.enforcePriceCeiling()).to.be.false;
      
      // Toggle back on
      await ticketMarketplace.togglePriceCeiling();
      expect(await ticketMarketplace.enforcePriceCeiling()).to.be.true;
    });
    
    it('should allow owner to pause and unpause the contract', async function () {
      const { ticketMarketplace, eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();
      await ticketMarketplace.initialize();
      
      // Pause the contract
      await ticketMarketplace.togglePause();
      expect(await ticketMarketplace.paused()).to.be.true;
      
      // Try to list a ticket while paused
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      await eventTicketing.connect(attendee1).approve(await ticketMarketplace.getAddress(), tokenId);
      
      await expect(
        ticketMarketplace.connect(attendee1).listTicket(
          await eventTicketing.getAddress(),
          tokenId,
          ethers.parseEther('0.15')
        )
      ).to.be.revertedWith('Pausable: paused');
      
      // Unpause and try again
      await ticketMarketplace.togglePause();
      await ticketMarketplace.connect(attendee1).listTicket(
        await eventTicketing.getAddress(),
        tokenId,
        ethers.parseEther('0.15')
      );
      
      // Should work now
      const listingId = 1;
      const listing = await ticketMarketplace.listings(listingId);
      expect(listing.active).to.be.true;
    });
  });
});

// Helper function to mint and list a ticket
async function mintAndListTicket(
  eventTicketing: any,
  ticketMarketplace: any,
  eventId: number,
  owner: any,
  mintPrice: bigint,
  salePrice: bigint
): Promise<bigint> {
  // Mint ticket
  const tokenId = await mintTicket(eventTicketing, eventId, owner, mintPrice);
  
  // Approve marketplace to transfer ticket
  await eventTicketing.connect(owner).approve(await ticketMarketplace.getAddress(), tokenId);
  
  // List ticket for sale
  await ticketMarketplace.connect(owner).listTicket(
    await eventTicketing.getAddress(),
    tokenId,
    salePrice
  );
  
  return tokenId;
}

// Constants for testing
const PLATFORM_FEE_BPS = 250; // 2.5%
const MAX_ROYALTY_BPS = 1000; // 10%
const MAX_PRICE_MULTIPLIER = 200; // 2x
