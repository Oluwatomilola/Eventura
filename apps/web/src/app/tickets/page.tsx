import { TicketCard } from '@/components/TicketCard';

export default function TicketsPage() {
  // In a real app, you would fetch the user's tickets here
  const tickets: any[] = [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
      
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-600 mb-4">No tickets yet</h2>
          <p className="text-gray-500">Your purchased tickets will appear here</p>
          <div className="mt-6">
            <a 
              href="/events" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Events
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
