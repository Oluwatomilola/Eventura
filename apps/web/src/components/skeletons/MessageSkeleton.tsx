'use client'

import { motion } from 'framer-motion'

interface MessageSkeletonProps {
  type?: 'conversation' | 'chat' | 'list'
  count?: number
}

export function MessageSkeleton({ type = 'list', count = 1 }: MessageSkeletonProps) {
  if (type === 'conversation') {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
            
            {/* Message content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="h-16 bg-white/5 rounded-lg animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (type === 'chat') {
    return (
      <div className="space-y-4 max-w-2xl">
        {[...Array(count)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${index % 2 === 0 ? 'order-2' : 'order-1'}`}>
              <div className="h-4 w-16 bg-white/10 rounded mb-1 animate-pulse" />
              <div className={`h-12 rounded-lg p-3 ${index % 2 === 0 ? 'bg-white/5' : 'bg-blue-500/20'}`}>
                <div className="space-y-1">
                  <div className="h-3 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full bg-white/10 animate-pulse ${index % 2 === 0 ? 'order-1 mr-3' : 'order-2 ml-3'}`} />
          </motion.div>
        ))}
      </div>
    )
  }

  // List type (conversations list)
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className="flex items-center gap-3 p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
        >
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-12 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
          </div>
          
          {/* Unread indicator */}
          <div className="w-2 h-2 bg-white/20 rounded-full animate-pulse" />
        </motion.div>
      ))}
    </div>
  )
}