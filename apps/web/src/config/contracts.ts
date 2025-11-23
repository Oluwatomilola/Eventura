export const CONTRACTS = {
  TicketMarketplace: (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  EventTicketing: (process.env.NEXT_PUBLIC_TICKETING_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
} as const;

// Export individual addresses for convenience
export const TICKET_MARKETPLACE_ADDRESS = CONTRACTS.TicketMarketplace as `0x${string}`;
export const EVENT_TICKETING_ADDRESS = CONTRACTS.EventTicketing as `0x${string}`;

