import { ethers, upgrades } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { expect } from 'chai';
import { BaseContract, ContractTransactionResponse } from 'ethers';

// Type definitions for our contracts
interface EventFactory extends BaseContract {
  grantRole(role: string, account: string): Promise<ContractTransactionResponse>;
  ORGANIZER_ROLE(): Promise<string>;
  TICKETING_ROLE(): Promise<string>;
  createEvent(
    metadataURI: string,
    startTime: number,
    endTime: number,
    ticketPrice: bigint,
    maxTickets: number
  ): Promise<ContractTransactionResponse>;
  updateEvent(
    eventId: number,
    metadataURI: string,
    startTime: number,
    endTime: number
  ): Promise<ContractTransactionResponse>;
  cancelEvent(eventId: number): Promise<ContractTransactionResponse>;
  events(eventId: number): Promise<{
    id: bigint;
    organizer: string;
    metadataURI: string;
    startTime: bigint;
    endTime: bigint;
    ticketPrice: bigint;
    maxTickets: number;
    ticketsSold: number;
    active: boolean;
    cancelled: boolean;
  }>;
  getOrganizerEvents(organizer: string): Promise<bigint[]>;
}

interface EventTicketing extends BaseContract {
  mintTicket(eventId: number, options: { value: bigint }): Promise<ContractTransactionResponse>;
  ownerOf(tokenId: bigint): Promise<string>;
  approve(to: string, tokenId: bigint): Promise<ContractTransactionResponse>;
  markTicketUsed(tokenId: bigint, used: boolean): Promise<ContractTransactionResponse>;
  requestRefund(tokenId: bigint): Promise<ContractTransactionResponse>;
  events(eventId: number): Promise<{
    id: bigint;
    organizer: string;
    metadataURI: string;
    startTime: bigint;
    endTime: bigint;
    ticketPrice: bigint;
    maxTickets: number;
    ticketsSold: number;
    active: boolean;
    cancelled: boolean;
  }>;
  tickets(tokenId: bigint): Promise<{
    eventId: bigint;
    owner: string;
    used: boolean;
  }>;
  filters: {
    TicketUsed(tokenId: bigint, used: boolean | null): any;
  };
  queryFilter(event: any): Promise<any[]>;
  name(): Promise<string>;
  symbol(): Promise<string>;
  ORGANIZER_ROLE(): Promise<string>;
  DEFAULT_ADMIN_ROLE(): Promise<string>;
  hasRole(role: string, account: string): Promise<boolean>;
}

interface TicketMarketplace extends BaseContract {
  listTicket(
    nft: string,
    tokenId: bigint,
    price: bigint
  ): Promise<ContractTransactionResponse>;
  cancelListing(
    nft: string,
    tokenId: bigint
  ): Promise<ContractTransactionResponse>;
  buyTicket(
    nft: string,
    tokenId: bigint,
    options: { value: bigint }
  ): Promise<ContractTransactionResponse>;
  makeOffer(
    nft: string,
    tokenId: bigint,
    options: { value: bigint }
  ): Promise<ContractTransactionResponse>;
  acceptOffer(
    nft: string,
    tokenId: bigint,
    offerer: string
  ): Promise<ContractTransactionResponse>;
  cancelOffer(
    nft: string,
    tokenId: bigint
  ): Promise<ContractTransactionResponse>;
  setFeeRecipient(recipient: string): Promise<ContractTransactionResponse>;
  setFeeBasisPoints(basisPoints: number): Promise<ContractTransactionResponse>;
  feeRecipient(): Promise<string>;
  feeBasisPoints(): Promise<number>;
  listings(
    nft: string,
    tokenId: bigint
  ): Promise<{
    seller: string;
    price: bigint;
    active: boolean;
  }>;
  offers(
    nft: string,
    tokenId: bigint,
    offerer: string
  ): Promise<{
    offerer: string;
    amount: bigint;
  }>;
  filters: {
    TicketListed(nft?: string, tokenId?: bigint, seller?: string): any;
    TicketSold(nft?: string, tokenId?: bigint, seller?: string, buyer?: string, price?: bigint): any;
  };
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export interface DeployedContracts {
  deployer: SignerWithAddress;
  organizer: SignerWithAddress;
  attendee1: SignerWithAddress;
  attendee2: SignerWithAddress;
  feeRecipient: SignerWithAddress;
  eventFactory: EventFactory;
  eventTicketing: EventTicketing;
  ticketMarketplace: TicketMarketplace;
}

export async function deployContracts(): Promise<DeployedContracts> {
  const [deployer, organizer, attendee1, attendee2, feeRecipient] = await ethers.getSigners();
  
  // Deploy EventFactory
  const EventFactory = await ethers.getContractFactory('EventFactory');
  const eventFactory = await upgrades.deployProxy(EventFactory, [], { initializer: 'initialize' }) as unknown as EventFactory;
  await eventFactory.waitForDeployment();

  // Deploy TicketMarketplace
  const TicketMarketplace = await ethers.getContractFactory('TicketMarketplace');
  const ticketMarketplace = await TicketMarketplace.deploy(feeRecipient.address, 250) as unknown as TicketMarketplace; // 2.5% fee
  await ticketMarketplace.waitForDeployment();

  // Deploy EventTicketing
  const EventTicketing = await ethers.getContractFactory('EventTicketing');
  const eventTicketing = await upgrades.deployProxy(
    EventTicketing,
    [
      'Eventura Tickets',
      'TICKET',
      await eventFactory.getAddress(),
      await ticketMarketplace.getAddress(),
      feeRecipient.address
    ],
    { initializer: 'initialize' }
  ) as unknown as EventTicketing;
  await eventTicketing.waitForDeployment();

  // Grant roles
  await eventFactory.grantRole(await eventFactory.ORGANIZER_ROLE(), organizer.address);
  await eventFactory.grantRole(await eventFactory.TICKETING_ROLE(), await eventTicketing.getAddress());

  return {
    deployer,
    organizer,
    attendee1,
    attendee2,
    feeRecipient,
    eventFactory,
    eventTicketing,
    ticketMarketplace
  };
}

export interface EventData {
  eventId: bigint;
  startTime: number;
  endTime: number;
  ticketPrice: bigint;
  maxTickets: number;
}

export async function createEvent(
  eventFactory: EventFactory,
  organizer: SignerWithAddress,
  startTimeOffset = 3600, // 1 hour from now
  duration = 7200, // 2 hours
  ticketPrice = ethers.parseEther('0.1'),
  maxTickets = 100
): Promise<EventData> {
  const now = Math.floor(Date.now() / 1000);
  const startTime = now + startTimeOffset;
  const endTime = startTime + duration;
  
  const tx = await eventFactory.connect(organizer).createEvent(
    'ipfs://event-metadata',
    startTime,
    endTime,
    ticketPrice,
    maxTickets
  );
  
  const receipt = await tx.wait();
  const event = receipt.logs.find(
    (log: any) => log.fragment?.name === 'EventCreated'
  );
  
  return {
    eventId: event.args[0],
    startTime,
    endTime,
    ticketPrice,
    maxTickets
  };
}

export async function mintTicket(
  eventTicketing: EventTicketing,
  eventId: number,
  to: SignerWithAddress,
  value: bigint
): Promise<bigint> {
  const tx = await eventTicketing.connect(to).mintTicket(eventId, { value });
  const receipt = await tx.wait();
  const transferEvent = receipt.logs.find(
    (log: any) => log.fragment?.name === 'Transfer'
  );
  return transferEvent.args[2]; // tokenId
}

export async function mintAndListTicket(
  eventTicketing: EventTicketing,
  ticketMarketplace: TicketMarketplace,
  eventId: number,
  owner: SignerWithAddress,
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
