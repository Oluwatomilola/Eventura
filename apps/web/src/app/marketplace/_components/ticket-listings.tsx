'use client';

import { useAccount, useReadContract } from 'wagmi';
import { TicketMarketplaceABI } from '@/config/abis/TicketMarketplace';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TICKET_MARKETPLACE_ADDRESS } from '@/config/contracts';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';

type TicketListing = {
  id: bigint;
  seller: string;
  nft: string;
  tokenId: bigint;
  eventId: bigint;
  price: bigint;
  originalPrice: bigint;
  active: boolean;
  listedAt: bigint;
};

type EventData = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  organizer: string;
  ticketPrice: string;
  maxTickets: number;
  category: string;
};

export function TicketListings({ filter = 'all' }: { filter?: string }) {
  const { address } = useAccount();
  const router = useRouter();

  // Fetch active listings from the smart contract
  const { data: listingIds, isLoading } = useReadContract({
    address: TICKET_MARKETPLACE_ADDRESS,
    abi: TicketMarketplaceABI,
    functionName: 'getActiveListings',
  });

  // Fetch details for each listing
  const { data: listings = [] } = useReadContract({
    address: TICKET_MARKETPLACE_ADDRESS,
    abi: TicketMarketplaceABI,
    functionName: 'getListingDetails',
    args: (listingIds as any)?.map((id: any) => id) || [],
    query: {
      enabled: !!(listingIds as any)?.length,
    },
  }) as { data: TicketListing[] | undefined };

  // Mock event data - in a real app, this would come from your API
  const mockEvents: Record<string, EventData> = {
    '1': {
      id: '1',
      title: 'Blockchain Conference 2024',
      description: 'The biggest blockchain event of the year',
      date: '2024-06-15T18:00:00Z',
      location: 'Convention Center, San Francisco',
      image: '/images/blockchain-conference.jpg',
      organizer: '0x123...abc',
      ticketPrice: '0.1',
      maxTickets: 1000,
      category: 'Conference',
    },
    '2': {
      id: '2',
      title: 'Jazz Night Live',
      description: 'An evening of smooth jazz and cocktails',
      date: '2024-05-20T20:00:00Z',
      location: 'Blue Note Jazz Club, New York',
      image: '/images/jazz-night.jpg',
      organizer: '0x456...def',
      ticketPrice: '0.05',
      maxTickets: 200,
      category: 'Music',
    },
  };

  const handleBuyTicket = (listingId: bigint, price: bigint) => {
    // In a real app, this would trigger the buy transaction
    console.log(`Buying ticket ${listingId} for ${formatEther(price)} ETH`);
    // router.push(`/checkout?listingId=${listingId}`);
  };

  const filteredListings = listings?.filter((listing) => {
    if (!listing.active) return false;
    
    const event = mockEvents[listing.eventId.toString()];
    if (!event) return false;
    
    const eventDate = new Date(event.date);
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return eventDate > now;
      case 'recent':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return new Date(Number(listing.listedAt) * 1000) > sevenDaysAgo;
      case 'ending':
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(now.getDate() + 7);
        return eventDate > now && eventDate < oneWeekFromNow;
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-96 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!filteredListings?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-muted-foreground"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">No listings found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          There are currently no tickets available that match your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {filteredListings.map((listing) => {
        const event = mockEvents[listing.eventId.toString()] || {
          title: 'Unknown Event',
          date: new Date().toISOString(),
          location: 'Location not available',
          image: '/images/placeholder-event.jpg',
          category: 'Other',
        };
        
        const isOwnListing = address?.toLowerCase() === listing.seller.toLowerCase();
        const discount = Number(
          ((Number(listing.originalPrice) - Number(listing.price)) / Number(listing.originalPrice)) * 100
        ).toFixed(0);
        
        return (
          <Card key={listing.id.toString()} className="overflow-hidden group">
            <div className="relative aspect-video bg-muted">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {discount > '0' && (
                <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">
                  {discount}% OFF
                </Badge>
              )}
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold line-clamp-1">
                    {event.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(event.date), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
                <Badge variant="outline" className="ml-2">
                  {event.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {event.location}
              </p>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold">
                    {formatEther(listing.price)} ETH
                  </span>
                  {listing.price < listing.originalPrice && (
                    <span className="ml-2 text-sm text-muted-foreground line-through">
                      {formatEther(listing.originalPrice)} ETH
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {isOwnListing ? 'Your listing' : `Listed by ${listing.seller.slice(0, 6)}...${listing.seller.slice(-4)}`}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                disabled={isOwnListing}
                onClick={() => handleBuyTicket(listing.id, listing.price)}
              >
                {isOwnListing ? 'Your Ticket' : 'Buy Ticket'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
