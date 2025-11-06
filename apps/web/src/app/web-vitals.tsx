'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', metric)
    }

    // Send to analytics in production
    // You can send to your analytics service here
    // Example: analytics.track('Web Vitals', metric)

    // For now, we'll use the performance API
    if (typeof window !== 'undefined' && window.performance) {
      // Store metric for dashboard
      const vitals = JSON.parse(
        sessionStorage.getItem('web-vitals') || '[]'
      )
      vitals.push({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
      })
      sessionStorage.setItem('web-vitals', JSON.stringify(vitals))
    }

    // Track performance thresholds
    const thresholds = {
      CLS: 0.1,   // Cumulative Layout Shift
      FID: 100,   // First Input Delay (ms)
      FCP: 1500,  // First Contentful Paint (ms)
      LCP: 2500,  // Largest Contentful Paint (ms)
      TTFB: 600,  // Time to First Byte (ms)
      INP: 200,   // Interaction to Next Paint (ms)
    }

    const threshold = thresholds[metric.name as keyof typeof thresholds]
    if (threshold && metric.value > threshold) {
      console.warn(
        `[Performance Warning] ${metric.name} exceeded threshold:`,
        `${metric.value} > ${threshold}`
      )
    }
  })

  return null
}
