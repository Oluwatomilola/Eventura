'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, TrendingUp, Zap, Clock, Eye, Gauge } from 'lucide-react'

interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([])
  const [averages, setAverages] = useState<Record<string, number>>({})

  useEffect(() => {
    // Load metrics from sessionStorage
    const loadMetrics = () => {
      try {
        const stored = sessionStorage.getItem('web-vitals')
        if (stored) {
          const parsed: WebVitalMetric[] = JSON.parse(stored)
          setMetrics(parsed)

          // Calculate averages
          const avgs: Record<string, { sum: number; count: number }> = {}
          parsed.forEach((metric) => {
            if (!avgs[metric.name]) {
              avgs[metric.name] = { sum: 0, count: 0 }
            }
            avgs[metric.name].sum += metric.value
            avgs[metric.name].count += 1
          })

          const averageValues: Record<string, number> = {}
          Object.entries(avgs).forEach(([name, data]) => {
            averageValues[name] = data.sum / data.count
          })
          setAverages(averageValues)
        }
      } catch (error) {
        console.error('Error loading metrics:', error)
      }
    }

    loadMetrics()

    // Refresh every 5 seconds
    const interval = setInterval(loadMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const getMetricInfo = (name: string) => {
    const info = {
      CLS: {
        icon: Activity,
        label: 'Cumulative Layout Shift',
        threshold: 0.1,
        unit: '',
        description: 'Visual stability - measures unexpected layout shifts',
      },
      FID: {
        icon: Zap,
        label: 'First Input Delay',
        threshold: 100,
        unit: 'ms',
        description: 'Responsiveness - time until the page responds to first interaction',
      },
      FCP: {
        icon: Eye,
        label: 'First Contentful Paint',
        threshold: 1500,
        unit: 'ms',
        description: 'Speed - time until first content renders',
      },
      LCP: {
        icon: Clock,
        label: 'Largest Contentful Paint',
        threshold: 2500,
        unit: 'ms',
        description: 'Loading performance - time until largest content renders',
      },
      TTFB: {
        icon: TrendingUp,
        label: 'Time to First Byte',
        threshold: 600,
        unit: 'ms',
        description: 'Server response - time until first byte received',
      },
      INP: {
        icon: Gauge,
        label: 'Interaction to Next Paint',
        threshold: 200,
        unit: 'ms',
        description: 'Responsiveness - time between interaction and visual update',
      },
    }
    return info[name as keyof typeof info] || {
      icon: Activity,
      label: name,
      threshold: 0,
      unit: '',
      description: 'Unknown metric',
    }
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'needs-improvement':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'poor':
        return 'text-red-400 bg-red-500/10 border-red-500/20'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const uniqueMetricNames = Array.from(new Set(metrics.map((m) => m.name)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gauge className="w-12 h-12 text-blue-400" />
            <h1 className="text-5xl font-bold text-white">Performance Dashboard</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Monitor Core Web Vitals and application performance metrics
          </p>
        </motion.div>

        {/* Performance Targets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Performance Targets</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
              <div>
                <p className="font-semibold text-green-400">✓ Lighthouse Score: &gt;90</p>
                <p className="text-sm">Excellent performance</p>
              </div>
              <div>
                <p className="font-semibold text-green-400">✓ LCP: &lt;2.5s</p>
                <p className="text-sm">Fast loading</p>
              </div>
              <div>
                <p className="font-semibold text-green-400">✓ CLS: &lt;0.1</p>
                <p className="text-sm">Stable layout</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        {uniqueMetricNames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueMetricNames.map((metricName, index) => {
              const info = getMetricInfo(metricName)
              const Icon = info.icon
              const avg = averages[metricName] || 0
              const latest = metrics.filter((m) => m.name === metricName).slice(-1)[0]
              const rating = latest?.rating || 'good'

              return (
                <motion.div
                  key={metricName}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${getRatingColor(
                    rating
                  )} backdrop-blur-sm border rounded-lg p-6`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-8 h-8" />
                    <span className="px-3 py-1 text-xs font-semibold uppercase rounded-full bg-white/10">
                      {rating}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{info.label}</h3>
                  <div className="text-3xl font-bold mb-2">
                    {avg.toFixed(metricName === 'CLS' ? 3 : 0)}
                    <span className="text-sm font-normal ml-1">{info.unit}</span>
                  </div>
                  <p className="text-sm opacity-80 mb-3">{info.description}</p>
                  <div className="flex items-center justify-between text-xs opacity-60">
                    <span>Target: &lt;{info.threshold}{info.unit}</span>
                    <span>{metrics.filter((m) => m.name === metricName).length} samples</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-12 text-center"
          >
            <Gauge className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">No Metrics Yet</h3>
            <p className="text-gray-300">
              Navigate through the app to collect performance metrics. Web Vitals data will appear
              here automatically.
            </p>
          </motion.div>
        )}

        {/* Optimization Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Implemented Optimizations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-300">
              <p>✅ Web Vitals monitoring enabled</p>
              <p>✅ Code splitting for large components</p>
              <p>✅ Next.js Image optimization</p>
              <p>✅ Bundle analyzer configured</p>
              <p>✅ Optimized package imports (lucide-react, framer-motion)</p>
              <p>✅ Performance budgets configured</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
