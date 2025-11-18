import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import { deployContracts, createEvent, mintTicket, ZERO_ADDRESS } from './helpers';

describe('EventTicketing', function () {
  describe('Deployment', function () {
    it('should deploy and initialize correctly', async function () {
      const { eventTicketing, eventFactory, organizer } = await deployContracts();
      
      // Check basic info
      expect(await eventTicketing.name()).to.equal('Eventura Tickets');
      expect(await eventTicketing.symbol()).to.equal('TICKET');
      
      // Check roles
      expect(await eventTicketing.hasRole(await eventTicketing.ORGANIZER_ROLE(), organizer.address)).to.be.true;
      expect(await eventTicketing.hasRole(await eventTicketing.DEFAULT_ADMIN_ROLE(), organizer.address)).to.be.true;
    });
  });

  describe('Event Management', function () {
    it('should create a new event through factory', async function () {
      const { eventFactory, eventTicketing, organizer } = await deployContracts();
      
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 3600; // 1 hour from now
      const endTime = startTime + 7200; // 2 hour duration
      const ticketPrice = ethers.parseEther('0.1');
      const maxTickets = 100;
      
      // Create event through factory
      const tx = await eventFactory.connect(organizer).createEvent(
        'ipfs://event-metadata',
        startTime,
        endTime,
        ticketPrice,
        maxTickets
      );
      
      const receipt = await tx.wait();
      const eventCreated = receipt.logs.find(
        (log: any) => log.fragment?.name === 'EventCreated'
      );
      
      expect(eventCreated).to.exist;
      
      // Verify event data in EventTicketing contract
      const eventId = eventCreated.args[0];
      const event = await eventTicketing.events(eventId);
      
      expect(event.organizer).to.equal(organizer.address);
      expect(event.metadataURI).to.equal('ipfs://event-metadata');
      expect(event.startTime).to.equal(startTime);
      expect(event.endTime).to.equal(endTime);
      expect(event.ticketPrice).to.equal(ticketPrice);
      expect(event.maxTickets).to.equal(maxTickets);
      expect(event.ticketsSold).to.equal(0);
      expect(event.active).to.be.true;
      expect(event.cancelled).to.be.false;
    });

    it('should allow organizer to update event details', async function () {
      const { eventFactory, eventTicketing, organizer } = await deployContracts();
      
      // Create event first
      const { eventId } = await createEvent(eventFactory, organizer);
      
      // Update event
      const newMetadataURI = 'ipfs://updated-metadata';
      const newStartTime = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now
      const newEndTime = newStartTime + 3600; // 1 hour duration
      
      await eventFactory.connect(organizer).updateEvent(
        eventId,
        newMetadataURI,
        newStartTime,
        newEndTime
      );
      
      // Verify update in EventTicketing
      const event = await eventTicketing.events(eventId);
      expect(event.metadataURI).to.equal(newMetadataURI);
      expect(event.startTime).to.equal(newStartTime);
      expect(event.endTime).to.equal(newEndTime);
    });
  });

  describe('Ticket Minting', function () {
    it('should allow users to mint tickets', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();
      
      // Create event
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      
      // Mint ticket
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Verify ticket ownership
      expect(await eventTicketing.ownerOf(tokenId)).to.equal(attendee1.address);
      
      // Verify event ticket count
      const event = await eventTicketing.events(eventId);
      expect(event.ticketsSold).to.equal(1);
      
      // Verify ticket data
      const ticket = await eventTicketing.tickets(tokenId);
      expect(ticket.eventId).to.equal(eventId);
      expect(ticket.owner).to.equal(attendee1.address);
      expect(ticket.used).to.be.false;
    });

    it('should not allow minting with incorrect payment', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();
      
      // Create event
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      
      // Try to mint with incorrect payment
      await expect(
        eventTicketing.connect(attendee1).mintTicket(eventId, { 
          value: ticketPrice / BigInt(2) // Half the required amount
        })
      ).to.be.revertedWith('Incorrect payment amount');
    });

    it('should not allow minting if event is sold out', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1, attendee2 } = await deployContracts();
      
      // Create event with only 1 ticket
      const { eventId, ticketPrice } = await createEvent(
        eventFactory, 
        organizer,
        3600, // start in 1 hour
        7200, // 2 hour duration
        ethers.parseEther('0.1'),
        1 // max 1 ticket
      );
      
      // Mint one ticket (should succeed)
      await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Try to mint another ticket (should fail)
      await expect(
        eventTicketing.connect(attendee2).mintTicket(eventId, { value: ticketPrice })
      ).to.be.revertedWith('Event sold out');
    });
  });

  describe('Ticket Transfers', function () {
    it('should allow ticket transfers between users', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1, attendee2 } = await deployContracts();
      
      // Create event and mint ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Transfer ticket
      await eventTicketing.connect(attendee1)['safeTransferFrom(address,address,uint256)'](
        attendee1.address,
        attendee2.address,
        tokenId
      );
      
      // Verify new owner
      expect(await eventTicketing.ownerOf(tokenId)).to.equal(attendee2.address);
      
      // Verify ticket data
      const ticket = await eventTicketing.tickets(tokenId);
      expect(ticket.owner).to.equal(attendee2.address);
    });

    it('should prevent transfers after event starts', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1, attendee2 } = await deployContracts();
      
      // Create event that starts immediately
      const now = Math.floor(Date.now() / 1000);
      const { eventId, ticketPrice } = await createEvent(
        eventFactory, 
        organizer,
        0, // starts immediately
        3600 // 1 hour duration
      );
      
      // Mint ticket
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Try to transfer after event starts
      await expect(
        eventTicketing.connect(attendee1)['safeTransferFrom(address,address,uint256)'](
          attendee1.address,
          attendee2.address,
          tokenId
        )
      ).to.be.revertedWith('Transfers not allowed after event starts');
    });
  });

  describe('Ticket Usage', function () {
    it('should allow organizer to mark ticket as used', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();
      
      // Create event and mint ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Mark as used
      await eventTicketing.connect(organizer).markTicketUsed(tokenId, true);
      
      // Verify
      const ticket = await eventTicketing.tickets(tokenId);
      expect(ticket.used).to.be.true;
      
      // Emit event
      const filter = eventTicketing.filters.TicketUsed(tokenId, true);
      const events = await eventTicketing.queryFilter(filter);
      expect(events.length).to.equal(1);
    });

    it('should prevent non-organizers from marking tickets as used', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1, attendee2 } = await deployContracts();
      
      // Create event and mint ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Try to mark as used with non-organizer account
      await expect(
        eventTicketing.connect(attendee2).markTicketUsed(tokenId, true)
      ).to.be.reverted;
    });
  });

  describe('Refunds', function () {
    it('should allow refunds before event starts', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();
      
      // Create event in the future
      const { eventId, ticketPrice } = await createEvent(
        eventFactory,
        organizer,
        3600, // starts in 1 hour
        7200  // 2 hour duration
      );
      
      // Mint ticket
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Get initial balance
      const initialBalance = await ethers.provider.getBalance(attendee1.address);
      
      // Request refund
      const tx = await eventTicketing.connect(attendee1).requestRefund(tokenId);
      const receipt = await tx.wait();
      
      // Calculate gas cost
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      // Check final balance
      const finalBalance = await ethers.provider.getBalance(attendee1.address);
      const expectedBalance = initialBalance + ticketPrice - gasUsed;
      
      // Allow for small difference due to gas estimation
      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther('0.001'));
      
      // Verify ticket is burned
      await expect(eventTicketing.ownerOf(tokenId)).to.be.revertedWith('ERC721: invalid token ID');
    });

    it('should not allow refunds after event starts', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();
      
      // Create event that starts immediately
      const { eventId, ticketPrice } = await createEvent(
        eventFactory,
        organizer,
        0, // starts immediately
        3600 // 1 hour duration
      );
      
      // Mint ticket
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Try to request refund
      await expect(
        eventTicketing.connect(attendee1).requestRefund(tokenId)
      ).to.be.revertedWith('Refund period has ended');
    });
  });
});
