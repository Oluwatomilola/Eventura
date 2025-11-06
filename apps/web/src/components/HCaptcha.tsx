'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertCircle } from 'lucide-react'

declare global {
  interface Window {
    hcaptcha: any
  }
}

interface HCaptchaProps {
  siteKey: string
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: (error: string) => void
  theme?: 'light' | 'dark'
  size?: 'normal' | 'compact' | 'invisible'
  required?: boolean
}

export function HCaptcha({
  siteKey,
  onVerify,
  onExpire,
  onError,
  theme = 'dark',
  size = 'normal',
  required = false,
}: HCaptchaProps) {
  const captchaRef = useRef<HTMLDivElement>(null)
  const [widgetId, setWidgetId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load hCaptcha script
    if (!document.getElementById('hcaptcha-script')) {
      const script = document.createElement('script')
      script.id = 'hcaptcha-script'
      script.src = 'https://js.hcaptcha.com/1/api.js'
      script.async = true
      script.defer = true
      document.body.appendChild(script)

      script.onload = () => {
        setLoaded(true)
      }

      script.onerror = () => {
        setError('Failed to load CAPTCHA')
        onError?.('Failed to load CAPTCHA script')
      }
    } else if (window.hcaptcha) {
      setLoaded(true)
    }
  }, [onError])

  useEffect(() => {
    if (loaded && captchaRef.current && !widgetId) {
      try {
        const id = window.hcaptcha.render(captchaRef.current, {
          sitekey: siteKey,
          theme,
          size,
          callback: (token: string) => {
            onVerify(token)
          },
          'expired-callback': () => {
            onExpire?.()
          },
          'error-callback': (err: string) => {
            setError('CAPTCHA error occurred')
            onError?.(err)
          },
        })
        setWidgetId(id)
      } catch (err) {
        console.error('hCaptcha render error:', err)
        setError('Failed to render CAPTCHA')
        onError?.('Failed to render CAPTCHA widget')
      }
    }

    return () => {
      if (widgetId && window.hcaptcha) {
        try {
          window.hcaptcha.remove(widgetId)
        } catch (err) {
          console.error('hCaptcha remove error:', err)
        }
      }
    }
  }, [loaded, siteKey, theme, size, onVerify, onExpire, onError, widgetId])

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {required && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Shield className="w-4 h-4" />
          <span>Complete CAPTCHA verification to continue</span>
        </div>
      )}
      <div ref={captchaRef} className="flex justify-center" />
    </div>
  )
}

/**
 * Invisible CAPTCHA wrapper for programmatic execution
 */
export function InvisibleHCaptcha({
  siteKey,
  onVerify,
  onError,
  children,
  disabled = false,
}: {
  siteKey: string
  onVerify: (token: string) => void
  onError?: (error: string) => void
  children: React.ReactNode
  disabled?: boolean
}) {
  const [executing, setExecuting] = useState(false)
  const [widgetId, setWidgetId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load hCaptcha script
    if (!document.getElementById('hcaptcha-script')) {
      const script = document.createElement('script')
      script.id = 'hcaptcha-script'
      script.src = 'https://js.hcaptcha.com/1/api.js'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }
  }, [])

  useEffect(() => {
    if (window.hcaptcha && containerRef.current && !widgetId) {
      const id = window.hcaptcha.render(containerRef.current, {
        sitekey: siteKey,
        size: 'invisible',
        callback: (token: string) => {
          setExecuting(false)
          onVerify(token)
        },
        'error-callback': (err: string) => {
          setExecuting(false)
          onError?.(err)
        },
      })
      setWidgetId(id)
    }
  }, [siteKey, onVerify, onError, widgetId])

  const handleExecute = () => {
    if (disabled || executing || !widgetId) return

    setExecuting(true)
    try {
      window.hcaptcha.execute(widgetId)
    } catch (err) {
      console.error('hCaptcha execute error:', err)
      setExecuting(false)
      onError?.('Failed to execute CAPTCHA')
    }
  }

  return (
    <>
      <div ref={containerRef} style={{ display: 'none' }} />
      <div onClick={handleExecute}>
        {typeof children === 'function'
          ? children({ executing })
          : children}
      </div>
    </>
  )
}
