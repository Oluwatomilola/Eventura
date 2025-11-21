'use client'

import { motion } from 'framer-motion'

interface ProfileSkeletonProps {
  type?: 'compact' | 'full' | 'form'
  count?: number
}

export function ProfileSkeleton({ type = 'full', count = 1 }: ProfileSkeletonProps) {
  if (type === 'form') {
    return (
      <div className="space-y-6">
        {/* Profile Completeness Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-8 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-white/20 rounded animate-pulse" />
          </div>
          <div className="h-3 w-48 bg-white/5 rounded mt-2 animate-pulse" />
        </motion.div>

        {/* Form Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-6"
        >
          {/* Avatar Upload Skeleton */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-white/10 animate-pulse" />
            <div className="h-10 w-32 bg-white/10 rounded animate-pulse" />
          </div>

          {/* Wallet Address Skeleton */}
          <div>
            <div className="h-4 w-32 bg-white/10 rounded mb-2 animate-pulse" />
            <div className="h-12 w-full bg-white/5 rounded animate-pulse" />
          </div>

          {/* Display Name Skeleton */}
          <div>
            <div className="h-4 w-32 bg-white/10 rounded mb-2 animate-pulse" />
            <div className="h-12 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-3 w-20 bg-white/5 rounded mt-1 animate-pulse" />
          </div>

          {/* Bio Skeleton */}
          <div>
            <div className="h-4 w-20 bg-white/10 rounded mb-2 animate-pulse" />
            <div className="h-24 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-3 w-16 bg-white/5 rounded mt-1 animate-pulse" />
          </div>

          {/* Submit Button Skeleton */}
          <div className="h-12 w-full bg-white/10 rounded animate-pulse" />
        </motion.div>
      </div>
    )
  }

  if (type === 'compact') {
    return (
      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
        <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse" />
        <div className="flex-1">
          <div className="h-6 w-32 bg-white/10 rounded mb-2 animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="h-10 w-20 bg-white/10 rounded animate-pulse" />
      </div>
    )
  }

  // Full profile type
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
        >
          {/* Header Section */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center text-center md:text-left">
                <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse mb-4" />
                <div className="h-8 w-40 bg-white/10 rounded mb-2 animate-pulse" />
                <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
              </div>

              {/* Stats */}
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="h-8 w-12 bg-white/10 rounded mx-auto mb-1 animate-pulse" />
                  <div className="h-3 w-16 bg-white/5 rounded mx-auto animate-pulse" />
                </div>
                <div className="text-center">
                  <div className="h-8 w-12 bg-white/10 rounded mx-auto mb-1 animate-pulse" />
                  <div className="h-3 w-20 bg-white/5 rounded mx-auto animate-pulse" />
                </div>
                <div className="text-center">
                  <div className="h-8 w-12 bg-white/10 rounded mx-auto mb-1 animate-pulse" />
                  <div className="h-3 w-14 bg-white/5 rounded mx-auto animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="px-8 pb-4">
            <div className="h-5 w-12 bg-white/10 rounded mb-3 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-3/5 bg-white/5 rounded animate-pulse" />
            </div>
          </div>

          {/* Interests Section */}
          <div className="px-8 pb-6">
            <div className="h-5 w-20 bg-white/10 rounded mb-3 animate-pulse" />
            <div className="flex flex-wrap gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}