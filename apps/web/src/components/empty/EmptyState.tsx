'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import Link from 'next/link'

interface EmptyStateProps {
  illustration: ReactNode
  heading: string
  message: string
  ctaText?: string
  ctaLink?: string
  onCtaClick?: () => void
  children?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  illustration,
  heading,
  message,
  ctaText,
  ctaLink,
  onCtaClick,
  children,
  className = '',
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'p-8',
      illustration: 'w-12 h-12',
      heading: 'text-lg',
      message: 'text-sm'
    },
    md: {
      container: 'p-12',
      illustration: 'w-16 h-16',
      heading: 'text-xl',
      message: 'text-sm'
    },
    lg: {
      container: 'p-16',
      illustration: 'w-20 h-20',
      heading: 'text-2xl',
      message: 'text-base'
    }
  }

  const classes = sizeClasses[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-center ${classes.container} ${className}`}
    >
      {/* Illustration */}
      <div className="flex justify-center mb-6">
        <div className={`${classes.illustration} text-white/40`}>
          {illustration}
        </div>
      </div>

      {/* Heading */}
      <h3 className={`font-semibold text-white mb-3 ${classes.heading}`}>
        {heading}
      </h3>

      {/* Message */}
      <p className={`text-gray-400 mb-6 max-w-md mx-auto leading-relaxed ${classes.message}`}>
        {message}
      </p>

      {/* Children (additional content) */}
      {children && (
        <div className="mb-6">
          {children}
        </div>
      )}

      {/* CTA Button */}
      {ctaText && (
        <div className="flex justify-center">
          {ctaLink ? (
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {ctaText}
            </Link>
          ) : onCtaClick ? (
            <button
              onClick={onCtaClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {ctaText}
            </button>
          ) : null}
        </div>
      )}
    </motion.div>
  )
}