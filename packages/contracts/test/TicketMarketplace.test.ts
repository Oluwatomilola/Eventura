import { expect } from 'chai';
import { ethers } from 'hardhat';
import { deployContracts, createEvent, mintTicket, ZERO_ADDRESS } from './helpers';

describe('TicketMarketplace', function () {
  describe('Deployment', function () {
    it('should deploy with correct parameters', async function () {
      const { ticketMarketplace, feeRecipient } = await deployContracts();
      
      // Check fee recipient
      expect(await ticketMarketplace.feeRecipient()).to.equal(feeRecipient.address);
      
      // Check fee basis points (250 = 2.5%)
      expect(await ticketMarketplace.feeBasisPoints()).to.equal(250);
    });
  });

  describe('Listing Tickets', function () {
    it('should allow ticket owner to list for sale', async function () {
      const { eventFactory, eventTicketing, ticketMarketplace, organizer, attendee1 } = await deployContracts();
      
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
      const listing = await ticketMarketplace.listings(await eventTicketing.getAddress(), tokenId);
      expect(listing.seller).to.equal(attendee1.address);
      expect(listing.price).to.equal(salePrice);
      expect(listing.active).to.be.true;
    });

    it('should not allow listing if not ticket owner', async function () {
      const { eventFactory, eventTicketing, ticketMarketplace, organizer, attendee1, attendee2 } = await deployContracts();
      
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
      ).to.be.revertedWith('Not ticket owner');
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
    it('should allow buying a listed ticket', async function () {
      const { 
        eventFactory, 
        eventTicketing, 
        ticketMarketplace, 
        organizer, 
        attendee1, 
        attendee2,
        feeRecipient 
      } = await deployContracts();
      
      // Create event, mint and list ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const salePrice = ethers.parseEther('0.15');
      const tokenId = await mintAndListTicket(
        eventTicketing, 
        ticketMarketplace, 
        eventId, 
        attendee1, 
        ticketPrice, 
        salePrice
      );
      
      // Get initial balances
      const initialSellerBalance = await ethers.provider.getBalance(attendee1.address);
      const initialFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);
      
      // Buy ticket
      const tx = await ticketMarketplace.connect(attendee2).buyTicket(
        await eventTicketing.getAddress(),
        tokenId,
        { value: salePrice }
      );
      const receipt = await tx.wait();
      
      // Calculate gas cost
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      // Verify ticket transfer
      expect(await eventTicketing.ownerOf(tokenId)).to.equal(attendee2.address);
      
      // Verify listing is removed
      const listing = await ticketMarketplace.listings(await eventTicketing.getAddress(), tokenId);
      expect(listing.active).to.be.false;
      
      // Calculate expected amounts (2.5% fee)
      const feeAmount = salePrice * 250n / 10000n; // 2.5%
      const sellerAmount = salePrice - feeAmount;
      
      // Verify seller received funds (accounting for gas)
      const sellerBalance = await ethers.provider.getBalance(attendee1.address);
      expect(sellerBalance).to.be.closeTo(
        initialSellerBalance + sellerAmount - gasUsed,
        ethers.parseEther('0.001')
      );
      
      // Verify fee recipient received fee
      const feeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);
      expect(feeRecipientBalance).to.equal(initialFeeRecipientBalance + feeAmount);
    });

    it('should not allow buying with incorrect payment', async function () {
      const { eventFactory, eventTicketing, ticketMarketplace, organizer, attendee1, attendee2 } = await deployContracts();
      
      // Create event, mint and list ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const salePrice = ethers.parseEther('0.15');
      const tokenId = await mintAndListTicket(
        eventTicketing, 
        ticketMarketplace, 
        eventId, 
        attendee1, 
        ticketPrice, 
        salePrice
      );
      
      // Try to buy with incorrect payment
      await expect(
        ticketMarketplace.connect(attendee2).buyTicket(
          await eventTicketing.getAddress(),
          tokenId,
          { value: salePrice * 2n } // Paying double
        )
      ).to.be.revertedWith('Incorrect payment amount');
    });
  });

  describe('Offers', function () {
    it('should allow users to make offers on tickets', async function () {
      const { eventFactory, eventTicketing, ticketMarketplace, organizer, attendee1, attendee2 } = await deployContracts();
      
      // Create event and mint ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Make an offer
      const offerAmount = ethers.parseEther('0.12');
      await ticketMarketplace.connect(attendee2).makeOffer(
        await eventTicketing.getAddress(),
        tokenId,
        { value: offerAmount }
      );
      
      // Verify offer
      const offer = await ticketMarketplace.offers(await eventTicketing.getAddress(), tokenId, attendee2.address);
      expect(offer.amount).to.equal(offerAmount);
    });

    it('should allow ticket owner to accept an offer', async function () {
      const { 
        eventFactory, 
        eventTicketing, 
        ticketMarketplace, 
        organizer, 
        attendee1, 
        attendee2,
        feeRecipient
      } = await deployContracts();
      
      // Create event and mint ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Make an offer
      const offerAmount = ethers.parseEther('0.12');
      await ticketMarketplace.connect(attendee2).makeOffer(
        await eventTicketing.getAddress(),
        tokenId,
        { value: offerAmount }
      );
      
      // Approve marketplace for token transfer
      await eventTicketing.connect(attendee1).approve(await ticketMarketplace.getAddress(), tokenId);
      
      // Get initial balances
      const initialSellerBalance = await ethers.provider.getBalance(attendee1.address);
      const initialFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);
      
      // Accept offer
      const tx = await ticketMarketplace.connect(attendee1).acceptOffer(
        await eventTicketing.getAddress(),
        tokenId,
        attendee2.address
      );
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      // Verify token transfer
      expect(await eventTicketing.ownerOf(tokenId)).to.equal(attendee2.address);
      
      // Calculate expected amounts (2.5% fee)
      const feeAmount = offerAmount * 250n / 10000n; // 2.5%
      const sellerAmount = offerAmount - feeAmount;
      
      // Verify seller received funds (accounting for gas)
      const sellerBalance = await ethers.provider.getBalance(attendee1.address);
      expect(sellerBalance).to.be.closeTo(
        initialSellerBalance + sellerAmount - gasUsed,
        ethers.parseEther('0.001')
      );
      
      // Verify fee recipient received fee
      const feeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);
      expect(feeRecipientBalance).to.equal(initialFeeRecipientBalance + feeAmount);
      
      // Verify offer is removed
      const offer = await ticketMarketplace.offers(await eventTicketing.getAddress(), tokenId, attendee2.address);
      expect(offer.amount).to.equal(0);
    });

    it('should allow offer makers to cancel their offers', async function () {
      const { eventFactory, eventTicketing, ticketMarketplace, organizer, attendee1, attendee2 } = await deployContracts();
      
      // Create event and mint ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Make an offer
      const offerAmount = ethers.parseEther('0.12');
      await ticketMarketplace.connect(attendee2).makeOffer(
        await eventTicketing.getAddress(),
        tokenId,
        { value: offerAmount }
      );
      
      // Get initial balance
      const initialBalance = await ethers.provider.getBalance(attendee2.address);
      
      // Cancel offer
      const tx = await ticketMarketplace.connect(attendee2).cancelOffer(
        await eventTicketing.getAddress(),
        tokenId
      );
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      // Verify funds returned (accounting for gas)
      const finalBalance = await ethers.provider.getBalance(attendee2.address);
      expect(finalBalance).to.be.closeTo(
        initialBalance + offerAmount - gasUsed,
        ethers.parseEther('0.001')
      );
      
      // Verify offer is removed
      const offer = await ticketMarketplace.offers(await eventTicketing.getAddress(), tokenId, attendee2.address);
      expect(offer.amount).to.equal(0);
    });
  });

  describe('Admin Functions', function () {
    it('should allow owner to update fee recipient', async function () {
      const { ticketMarketplace, organizer, attendee1 } = await deployContracts();
      
      // Update fee recipient
      await ticketMarketplace.connect(organizer).setFeeRecipient(attendee1.address);
      
      // Verify update
      expect(await ticketMarketplace.feeRecipient()).to.equal(attendee1.address);
    });

    it('should allow owner to update fee basis points', async function () {
      const { ticketMarketplace, organizer } = await deployContracts();
      
      // Update fee basis points (5%)
      await ticketMarketplace.connect(organizer).setFeeBasisPoints(500);
      
      // Verify update
      expect(await ticketMarketplace.feeBasisPoints()).to.equal(500);
    });

    it('should not allow non-owners to update settings', async function () {
      const { ticketMarketplace, attendee1 } = await deployContracts();
      
      // Try to update with non-owner account
      await expect(
        ticketMarketplace.connect(attendee1).setFeeRecipient(attendee1.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
      
      await expect(
        ticketMarketplace.connect(attendee1).setFeeBasisPoints(100)
      ).to.be.revertedWith('Ownable: caller is not the owner');
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
  
  // Approve marketplace
  await eventTicketing.connect(owner).approve(await ticketMarketplace.getAddress(), tokenId);
  
  // List for sale
  await ticketMarketplace.connect(owner).listTicket(
    await eventTicketing.getAddress(),
    tokenId,
    salePrice
  );
  
  return tokenId;
}
