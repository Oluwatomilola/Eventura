import { Suspense } from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { TicketListings } from './_components/ticket-listings';
import { FilterSidebar } from './_components/filter-sidebar';

export const metadata: Metadata = {
  title: 'Secondary Ticket Marketplace | Eventura',
  description: 'Buy and sell event tickets on the secondary market',
};

export default function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Ticket Marketplace</h1>
        <p className="text-muted-foreground mt-2">
          Find great deals on tickets for upcoming events or sell your own
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <FilterSidebar />
        </div>

        <div className="flex-1">
          <Card className="mb-6
          ">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search events, artists, or venues..."
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
                <Button variant="outline" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Sort</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Listings</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger value="recent">Recently Added</TabsTrigger>
              <TabsTrigger value="ending">Ending Soon</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Suspense fallback={<MarketplaceSkeleton />}>
                <TicketListings />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="upcoming" className="space-y-4">
              <Suspense fallback={<MarketplaceSkeleton />}>
                <TicketListings filter="upcoming" />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="recent" className="space-y-4">
              <Suspense fallback={<MarketplaceSkeleton />}>
                <TicketListings filter="recent" />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="ending" className="space-y-4">
              <Suspense fallback={<MarketplaceSkeleton />}>
                <TicketListings filter="ending" />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function MarketplaceSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-video bg-muted animate-pulse" />
          <CardHeader>
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse mb-4" />
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
