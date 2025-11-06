'use client'

import { useState } from 'react'

/**
 * Honeypot Field Component
 * Invisible field that bots will fill but humans won't see
 * Used to detect and block automated form submissions
 */

interface HoneypotFieldProps {
  name?: string
  onBotDetected?: () => void
}

export function HoneypotField({ name = 'website', onBotDetected }: HoneypotFieldProps) {
  const [value, setValue] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    // If honeypot field is filled, likely a bot
    if (newValue) {
      onBotDetected?.()
    }
  }

  return (
    <input
      type="text"
      name={name}
      value={value}
      onChange={handleChange}
      autoComplete="off"
      tabIndex={-1}
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

/**
 * Multiple Honeypot Fields for extra protection
 */
export function HoneypotFields({ onBotDetected }: { onBotDetected?: () => void }) {
  return (
    <>
      <HoneypotField name="email_confirm" onBotDetected={onBotDetected} />
      <HoneypotField name="website" onBotDetected={onBotDetected} />
      <HoneypotField name="url" onBotDetected={onBotDetected} />
      <HoneypotField name="phone" onBotDetected={onBotDetected} />
    </>
  )
}

/**
 * Time-based bot detection
 * Humans take time to fill forms, bots are instant
 */
export function useFormTiming() {
  const [startTime] = useState(Date.now())

  const checkTiming = (): { tooFast: boolean; duration: number } => {
    const duration = Date.now() - startTime
    const tooFast = duration < 2000 // Less than 2 seconds is suspicious

    return { tooFast, duration }
  }

  return { checkTiming }
}

/**
 * Mouse movement detection
 * Bots typically don't move the mouse naturally
 */
export function useMouseTracking() {
  const [hasMouseMovement, setHasMouseMovement] = useState(false)
  const [mouseEvents, setMouseEvents] = useState(0)

  const trackMouse = () => {
    const handleMouseMove = () => {
      setHasMouseMovement(true)
      setMouseEvents((prev) => prev + 1)
    }

    document.addEventListener('mousemove', handleMouseMove, { once: false })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }

  const isLikelyBot = (): boolean => {
    // No mouse movement or very few events is suspicious
    return !hasMouseMovement || mouseEvents < 5
  }

  return { trackMouse, hasMouseMovement, mouseEvents, isLikelyBot }
}

/**
 * Keystroke dynamics detection
 * Bots type at inhuman speeds
 */
export function useKeystrokeTracking() {
  const [keystrokeTimings, setKeystrokeTimings] = useState<number[]>([])

  const recordKeystroke = () => {
    setKeystrokeTimings((prev) => [...prev, Date.now()])
  }

  const analyzePattern = (): { suspicious: boolean; reason?: string } => {
    if (keystrokeTimings.length < 5) {
      return { suspicious: false }
    }

    // Calculate average time between keystrokes
    const intervals = []
    for (let i = 1; i < keystrokeTimings.length; i++) {
      intervals.push(keystrokeTimings[i] - keystrokeTimings[i - 1])
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const stdDev = Math.sqrt(
      intervals.reduce((sq, n) => sq + Math.pow(n - avgInterval, 2), 0) /
        intervals.length
    )

    // Bots have very consistent timing (low std deviation)
    // or very fast typing (low average interval)
    if (stdDev < 10 && avgInterval < 50) {
      return { suspicious: true, reason: 'Inhuman typing speed and consistency' }
    }

    if (avgInterval < 30) {
      return { suspicious: true, reason: 'Typing too fast' }
    }

    return { suspicious: false }
  }

  return { recordKeystroke, analyzePattern }
}
