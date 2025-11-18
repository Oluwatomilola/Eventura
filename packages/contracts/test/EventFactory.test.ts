import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import { deployContracts, createEvent, ZERO_ADDRESS } from './helpers';

describe('EventFactory', function () {
  it('should deploy and initialize correctly', async function () {
    const { eventFactory, organizer, eventTicketing } = await deployContracts();
    
    // Check roles
    expect(await eventFactory.hasRole(await eventFactory.ORGANIZER_ROLE(), organizer.address)).to.be.true;
    expect(await eventFactory.hasRole(await eventFactory.TICKETING_ROLE(), await eventTicketing.getAddress())).to.be.true;
    
    // Check owner is the deployer
    expect(await eventFactory.owner()).to.equal(organizer.address);
  });

  describe('createEvent', function () {
    it('should create a new event', async function () {
      const { eventFactory, organizer } = await deployContracts();
      
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 3600; // 1 hour from now
      const endTime = startTime + 7200; // 2 hour duration
      const ticketPrice = ethers.parseEther('0.1');
      const maxTickets = 100;
      
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
      expect(eventCreated.args.organizer).to.equal(organizer.address);
      expect(eventCreated.args.metadataURI).to.equal('ipfs://event-metadata');
      expect(eventCreated.args.startTime).to.equal(startTime);
      expect(eventCreated.args.endTime).to.equal(endTime);
      expect(eventCreated.args.ticketPrice).to.equal(ticketPrice);
      expect(eventCreated.args.maxTickets).to.equal(maxTickets);
      
      // Verify event data
      const event = await eventFactory.events(1);
      expect(event.id).to.equal(1);
      expect(event.organizer).to.equal(organizer.address);
      expect(event.metadataURI).to.equal('ipfs://event-metadata');
      expect(event.startTime).to.equal(startTime);
      expect(event.endTime).to.equal(endTime);
      expect(event.ticketPrice).to.equal(ticketPrice);
      expect(event.maxTickets).to.equal(maxTickets);
      expect(event.active).to.be.true;
    });

    it('should revert if not called by organizer', async function () {
      const { eventFactory, attendee1 } = await deployContracts();
      
      const now = Math.floor(Date.now() / 1000);
      await expect(
        eventFactory.connect(attendee1).createEvent(
          'ipfs://event-metadata',
          now + 3600,
          now + 10800,
          ethers.parseEther('0.1'),
          100
        )
      ).to.be.reverted;
    });

    it('should revert with invalid parameters', async function () {
      const { eventFactory, organizer } = await deployContracts();
      
      const now = Math.floor(Date.now() / 1000);
      
      // Invalid start time (in the past)
      await expect(
        eventFactory.connect(organizer).createEvent(
          'ipfs://event-metadata',
          now - 1000,
          now + 1000,
          ethers.parseEther('0.1'),
          100
        )
      ).to.be.revertedWith('Invalid start time');
      
      // Invalid end time
      await expect(
        eventFactory.connect(organizer).createEvent(
          'ipfs://event-metadata',
          now + 2000,
          now + 1000,
          ethers.parseEther('0.1'),
          100
        )
      ).to.be.revertedWith('End time must be after start time');
      
      // Zero max tickets
      await expect(
        eventFactory.connect(organizer).createEvent(
          'ipfs://event-metadata',
          now + 1000,
          now + 2000,
          ethers.parseEther('0.1'),
          0
        )
      ).to.be.revertedWith('Max tickets must be greater than 0');
    });
  });

  describe('updateEvent', function () {
    it('should update event details', async function () {
      const { eventFactory, organizer } = await deployContracts();
      
      // Create an event first
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
      
      // Verify update
      const event = await eventFactory.events(eventId);
      expect(event.metadataURI).to.equal(newMetadataURI);
      expect(event.startTime).to.equal(newStartTime);
      expect(event.endTime).to.equal(newEndTime);
    });

    it('should revert if not called by organizer', async function () {
      const { eventFactory, organizer, attendee1 } = await deployContracts();
      
      // Create an event first
      const { eventId } = await createEvent(eventFactory, organizer);
      
      // Try to update with non-organizer account
      await expect(
        eventFactory.connect(attendee1).updateEvent(
          eventId,
          'ipfs://hacked',
          Math.floor(Date.now() / 1000) + 1000,
          Math.floor(Date.now() / 1000) + 2000
        )
      ).to.be.reverted;
    });
  });

  describe('cancelEvent', function () {
    it('should cancel an event', async function () {
      const { eventFactory, organizer } = await deployContracts();
      
      // Create an event first
      const { eventId } = await createEvent(eventFactory, organizer);
      
      // Cancel event
      await eventFactory.connect(organizer).cancelEvent(eventId);
      
      // Verify cancellation
      const event = await eventFactory.events(eventId);
      expect(event.active).to.be.false;
      expect(event.cancelled).to.be.true;
    });

    it('should revert if not called by organizer', async function () {
      const { eventFactory, organizer, attendee1 } = await deployContracts();
      
      // Create an event first
      const { eventId } = await createEvent(eventFactory, organizer);
      
      // Try to cancel with non-organizer account
      await expect(
        eventFactory.connect(attendee1).cancelEvent(eventId)
      ).to.be.reverted;
    });
  });

  describe('getOrganizerEvents', function () {
    it('should return events created by organizer', async function () {
      const { eventFactory, organizer } = await deployContracts();
      
      // Create multiple events
      await createEvent(eventFactory, organizer);
      await createEvent(eventFactory, organizer);
      
      // Get organizer events
      const eventIds = await eventFactory.getOrganizerEvents(organizer.address);
      
      expect(eventIds.length).to.equal(2);
      expect(eventIds[0]).to.equal(1);
      expect(eventIds[1]).to.equal(2);
    });
  });
});
