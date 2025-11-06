// TODO: Define Event type in src/types/event.ts

interface EventCardProps {
  // TODO: Add event properties
}

export function EventCard(props: EventCardProps) {
  return (
    <div className="flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all">
      <div className="p-4 xs:p-5 md:p-6">
        <h3 className="text-lg xs:text-xl md:text-2xl font-semibold text-white mb-2">Event Title</h3>
        <p className="text-sm xs:text-base text-gray-300 line-clamp-2 mb-4">Event details...</p>
        
        <div className="flex flex-col xs:flex-row gap-3 xs:items-center xs:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Available tickets: 0/0</span>
          </div>
          <button className="w-full xs:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Buy Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
