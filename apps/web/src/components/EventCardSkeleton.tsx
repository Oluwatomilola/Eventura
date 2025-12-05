import { Skeleton, SkeletonImage, SkeletonText } from '@/components/ui/skeleton'

type EventCardSkeletonProps = {
  compact?: boolean
}

export function EventCardSkeleton({ compact = false }: EventCardSkeletonProps) {
  return (
    <div className={`flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden ${compact ? '' : 'h-full'}`}>
      {/* Image Skeleton */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <SkeletonImage className="h-full w-full" />
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 md:p-6 flex-1 flex flex-col">
        {/* Title */}
        <Skeleton className="h-7 w-3/4 mb-3" />
        
        {/* Description */}
        <SkeletonText lines={2} className="mb-4" />

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Ticket Availability */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="w-full h-2 rounded-full" />
        </div>

        {/* Price and Actions */}
        <div className="mt-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <Skeleton className="h-4 w-12 mb-1" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-12 w-32 rounded-lg" />
            <Skeleton className="h-12 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function EventCardSkeletonList({ count = 4, compact = false }: { count?: number, compact?: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} compact={compact} />
      ))}
    </>
  )
}
