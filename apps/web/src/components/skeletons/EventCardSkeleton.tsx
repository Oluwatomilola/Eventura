'use client'

import { motion } from 'framer-motion'

interface EventCardSkeletonProps {
  compact?: boolean
  count?: number
}

export function EventCardSkeleton({ compact = false, count = 1 }: EventCardSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden ${compact ? '' : 'h-full'}`}
        >
          {/* Event Image Skeleton */}
          <div className="relative h-48 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-700/50 to-gray-800/50 animate-pulse" />
            
            {/* Status Badge Skeleton */}
            <div className="absolute top-3 right-3">
              <div className="h-6 w-20 bg-gray-600/50 rounded-full animate-pulse" />
            </div>
            
            {/* Category Badge Skeleton */}
            <div className="absolute top-3 left-3">
              <div className="h-6 w-16 bg-gray-600/50 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Event Content Skeleton */}
          <div className="p-4 md:p-6 flex-1 flex flex-col">
            {/* Title Skeleton */}
            <div className="space-y-2 mb-4">
              <div className="h-6 bg-white/10 rounded animate-pulse" />
              <div className="h-6 bg-white/10 rounded w-3/4 animate-pulse" />
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-white/10 rounded animate-pulse" />
              <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse" />
            </div>

            {/* Event Details Skeleton */}
            <div className="space-y-2 mb-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 bg-white/10 rounded w-32 animate-pulse" />
                </div>
              ))}
            </div>

            {/* Ticket Availability Skeleton */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 bg-white/10 rounded w-28 animate-pulse" />
                </div>
                <div className="h-4 bg-white/10 rounded w-16 animate-pulse" />
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white/20 rounded animate-pulse" />
              </div>
            </div>

            {/* Price and Actions Skeleton */}
            <div className="mt-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <div className="h-3 bg-white/10 rounded w-12 mb-1 animate-pulse" />
                <div className="h-8 bg-white/10 rounded w-24 animate-pulse" />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="h-10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg animate-pulse" />
                <div className="h-10 bg-white/10 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  )
}