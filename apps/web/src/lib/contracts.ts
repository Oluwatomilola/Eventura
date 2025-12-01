// Contract addresses resolved from environment variables per chain
// Base Mainnet (8453)
const MAINNET_ADDRESSES = {
  EventTicketing: process.env.NEXT_PUBLIC_EVENT_TICKETING_ADDRESS_MAINNET || '',
  EventFactory: process.env.NEXT_PUBLIC_EVENT_FACTORY_ADDRESS_MAINNET || '',
  TicketMarketplace: process.env.NEXT_PUBLIC_TICKET_MARKETPLACE_ADDRESS_MAINNET || '',
};

// Base Sepolia (84532)
const SEPOLIA_ADDRESSES = {
  EventTicketing: process.env.NEXT_PUBLIC_EVENT_TICKETING_ADDRESS_SEPOLIA || '',
  EventFactory: process.env.NEXT_PUBLIC_EVENT_FACTORY_ADDRESS_SEPOLIA || '',
  TicketMarketplace: process.env.NEXT_PUBLIC_TICKET_MARKETPLACE_ADDRESS_SEPOLIA || '',
};

export function getContractAddresses(chainId: number) {
  if (chainId === 8453) return MAINNET_ADDRESSES;
  if (chainId === 84532) return SEPOLIA_ADDRESSES;
  return { EventTicketing: '', EventFactory: '', TicketMarketplace: '' };
}

// Minimal ABIs for used functions (expand as needed)
export const EventTicketingABI = [
  // createEvent(string metadataURI, uint256 startTime, uint256 endTime, uint256 ticketPrice, uint256 maxTickets)
  {
    type: 'function',
    name: 'createEvent',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'metadataURI', type: 'string' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'ticketPrice', type: 'uint256' },
      { name: 'maxTickets', type: 'uint256' },
    ],
    outputs: [{ name: 'eventId', type: 'uint256' }],
  },
  // purchaseTicket(uint256 eventId) payable
  {
    type: 'function',
    name: 'purchaseTicket',
    stateMutability: 'payable',
    inputs: [{ name: 'eventId', type: 'uint256' }],
    outputs: [{ name: 'ticketId', type: 'uint256' }],
  },
  // refundTicket(uint256 ticketId)
  {
    type: 'function',
    name: 'refundTicket',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'ticketId', type: 'uint256' }],
    outputs: [],
  },
  // joinWaitlist(uint256 eventId)
  { type: 'function', name: 'joinWaitlist', stateMutability: 'nonpayable', inputs: [{ name: 'eventId', type: 'uint256' }], outputs: [] },
  // leaveWaitlist(uint256 eventId)
  { type: 'function', name: 'leaveWaitlist', stateMutability: 'nonpayable', inputs: [{ name: 'eventId', type: 'uint256' }], outputs: [] },
  // getEvent(uint256 eventId) returns (Event)
  {
    type: 'function',
    name: 'getEvent',
    stateMutability: 'view',
    inputs: [{ name: 'eventId', type: 'uint256' }],
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'organizer', type: 'address' },
          { name: 'metadataURI', type: 'string' },
          { name: 'startTime', type: 'uint256' },
          { name: 'endTime', type: 'uint256' },
          { name: 'ticketPrice', type: 'uint256' },
          { name: 'maxTickets', type: 'uint256' },
          { name: 'ticketsSold', type: 'uint256' },
          { name: 'active', type: 'bool' },
          { name: 'cancelled', type: 'bool' },
          { name: 'createdAt', type: 'uint256' },
        ],
        name: 'event',
        type: 'tuple',
      },
    ],
  },
  // isSoldOut(uint256 eventId)
  { type: 'function', name: 'isSoldOut', stateMutability: 'view', inputs: [{ name: 'eventId', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  // getAvailableTickets(uint256 eventId)
  { type: 'function', name: 'getAvailableTickets', stateMutability: 'view', inputs: [{ name: 'eventId', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  // getOrganizerEvents(address organizer)
  { type: 'function', name: 'getOrganizerEvents', stateMutability: 'view', inputs: [{ name: 'organizer', type: 'address' }], outputs: [{ type: 'uint256[]' }] },
  // cancelEvent(uint256 eventId)
  { type: 'function', name: 'cancelEvent', stateMutability: 'nonpayable', inputs: [{ name: 'eventId', type: 'uint256' }], outputs: [] },
  // getWaitlistCount(uint256 eventId)
  { type: 'function', name: 'getWaitlistCount', stateMutability: 'view', inputs: [{ name: 'eventId', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
] as const;

export const EventFactoryABI = [
  // createEvent(string, uint256, uint256, uint256, uint256)
  {
    type: 'function',
    name: 'createEvent',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'metadataURI', type: 'string' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'ticketPrice', type: 'uint256' },
      { name: 'maxTickets', type: 'uint256' },
    ],
    outputs: [{ name: 'eventId', type: 'uint256' }],
  },
  // updateEventMetadata(uint256, string)
  {
    type: 'function',
    name: 'updateEventMetadata',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'newMetadataURI', type: 'string' },
    ],
    outputs: [],
  },
  // setEventStatus(uint256, bool)
  {
    type: 'function',
    name: 'setEventStatus',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'active', type: 'bool' },
    ],
    outputs: [],
  },
  // getEvent(uint256)
  {
    type: 'function',
    name: 'getEvent',
    stateMutability: 'view',
    inputs: [{ name: 'eventId', type: 'uint256' }],
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'organizer', type: 'address' },
          { name: 'metadataURI', type: 'string' },
          { name: 'startTime', type: 'uint256' },
          { name: 'endTime', type: 'uint256' },
          { name: 'ticketPrice', type: 'uint256' },
          { name: 'maxTickets', type: 'uint256' },
          { name: 'ticketsSold', type: 'uint256' },
          { name: 'active', type: 'bool' },
          { name: 'createdAt', type: 'uint256' },
        ],
        name: 'event',
        type: 'tuple',
      },
    ],
  },
  // getTotalEvents() view returns (uint256)
  { type: 'function', name: 'getTotalEvents', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  // getOrganizerEvents(address organizer)
  { type: 'function', name: 'getOrganizerEvents', stateMutability: 'view', inputs: [{ name: 'organizer', type: 'address' }], outputs: [{ type: 'uint256[]' }] },
] as const;
