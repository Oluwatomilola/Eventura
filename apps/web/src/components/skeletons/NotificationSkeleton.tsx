'use client'

import { motion } from 'framer-motion'

interface NotificationSkeletonProps {
  type?: 'dropdown' | 'list' | 'full'
  count?: number
}

export function NotificationSkeleton({ type = 'dropdown', count = 1 }: NotificationSkeletonProps) {
  if (type === 'dropdown') {
    return (
      <div className="py-2">
        {[...Array(count)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-12 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-3 w-full bg-white/5 rounded animate-pulse mb-1" />
                <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-4 w-full bg-white/5 rounded animate-pulse mb-2" />
                <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  // Full page type
  return (
    <div className="max-w-4xl mx-auto">
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-3/5 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-10 w-20 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}