'use client'

import { motion } from 'framer-motion'

interface AttendeeCardSkeletonProps {
  count?: number
}

export function AttendeeCardSkeleton({ count = 1 }: AttendeeCardSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
        >
          {/* Header with Avatar and Name */}
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar Skeleton */}
              <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse" />

              {/* Name and Badges Skeleton */}
              <div className="flex-1 min-w-0">
                <div className="h-6 bg-white/10 rounded w-3/4 mb-2 animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-6 w-32 bg-purple-500/20 rounded-full animate-pulse" />
                  <div className="h-6 w-24 bg-green-500/20 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Bio Skeleton */}
            <div className="mb-4">
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded animate-pulse" />
                <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse" />
              </div>
            </div>

            {/* Interests Skeleton */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-white/10 rounded animate-pulse" />
                <div className="h-4 bg-white/10 rounded w-20 animate-pulse" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-6 w-16 bg-purple-500/20 rounded-full animate-pulse" />
                ))}
                <div className="h-6 w-8 bg-white/10 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Looking For Skeleton */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-white/10 rounded animate-pulse" />
                <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 w-20 bg-blue-500/20 rounded-full animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* Footer with Connect Button */}
          <div className="px-6 pb-6">
            <div className="h-11 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg animate-pulse" />
          </div>
        </motion.div>
      ))}
    </>
  )
}