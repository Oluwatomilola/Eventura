/**
 * Bot Detection Utilities
 * Comprehensive bot detection mechanisms
 */

export interface BotDetectionResult {
  isBot: boolean
  confidence: number // 0-100
  reasons: string[]
  score: number
}

export interface BrowserFingerprint {
  userAgent: string
  language: string
  platform: string
  screenResolution: string
  timezone: number
  plugins: number
  canvas: string
  webgl: string
}

/**
 * Generate browser fingerprint for tracking
 */
export function generateFingerprint(): BrowserFingerprint {
  if (typeof window === 'undefined') {
    return {
      userAgent: '',
      language: '',
      platform: '',
      screenResolution: '',
      timezone: 0,
      plugins: 0,
      canvas: '',
      webgl: '',
    }
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: new Date().getTimezoneOffset(),
    plugins: navigator.plugins.length,
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
  }
}

/**
 * Canvas fingerprinting for bot detection
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('BrowserFingerprint', 2, 15)

    return canvas.toDataURL()
  } catch (e) {
    return ''
  }
}

/**
 * WebGL fingerprinting
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return ''

    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return ''

    return (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
  } catch (e) {
    return ''
  }
}

/**
 * Detect headless browser (common in bots)
 */
export function detectHeadlessBrowser(): { isHeadless: boolean; reasons: string[] } {
  if (typeof window === 'undefined') {
    return { isHeadless: false, reasons: [] }
  }

  const reasons: string[] = []

  // Check for common headless browser indicators
  if ((navigator as any).webdriver) {
    reasons.push('WebDriver detected')
  }

  if ((window as any).__nightmare) {
    reasons.push('Nightmare.js detected')
  }

  if ((window as any)._phantom || (window as any).phantom) {
    reasons.push('PhantomJS detected')
  }

  if ((navigator as any).userAgent.includes('HeadlessChrome')) {
    reasons.push('Headless Chrome detected')
  }

  // Check for missing properties that real browsers have
  if (!(window as any).chrome && navigator.userAgent.includes('Chrome')) {
    reasons.push('Missing chrome object')
  }

  if (navigator.plugins.length === 0) {
    reasons.push('No plugins detected')
  }

  return {
    isHeadless: reasons.length > 0,
    reasons,
  }
}

/**
 * Detect automation tools
 */
export function detectAutomation(): { detected: boolean; tools: string[] } {
  if (typeof window === 'undefined') {
    return { detected: false, tools: [] }
  }

  const tools: string[] = []

  // Selenium
  if ((window as any).document.documentElement.getAttribute('selenium')) {
    tools.push('Selenium')
  }

  if ((window as any).document.documentElement.getAttribute('webdriver')) {
    tools.push('WebDriver')
  }

  if ((window as any).document.documentElement.getAttribute('driver')) {
    tools.push('Driver')
  }

  // Puppeteer
  if ((navigator as any).webdriver) {
    tools.push('Puppeteer')
  }

  return {
    detected: tools.length > 0,
    tools,
  }
}

/**
 * Comprehensive bot detection check
 */
export function detectBot(): BotDetectionResult {
  if (typeof window === 'undefined') {
    return {
      isBot: false,
      confidence: 0,
      reasons: [],
      score: 0,
    }
  }

  const reasons: string[] = []
  let score = 0

  // Check for headless browser (40 points)
  const headless = detectHeadlessBrowser()
  if (headless.isHeadless) {
    score += 40
    reasons.push(...headless.reasons)
  }

  // Check for automation tools (40 points)
  const automation = detectAutomation()
  if (automation.detected) {
    score += 40
    reasons.push(...automation.tools)
  }

  // Check user agent (10 points)
  const ua = navigator.userAgent.toLowerCase()
  if (
    ua.includes('bot') ||
    ua.includes('crawler') ||
    ua.includes('spider') ||
    ua.includes('scraper')
  ) {
    score += 10
    reasons.push('Bot detected in user agent')
  }

  // Check for missing features (5 points each)
  if (!(window as any).chrome && ua.includes('chrome')) {
    score += 5
    reasons.push('Missing Chrome object')
  }

  if (!navigator.languages || navigator.languages.length === 0) {
    score += 5
    reasons.push('No languages detected')
  }

  if (!document.hasFocus && !document.hidden) {
    score += 5
    reasons.push('Suspicious focus state')
  }

  // Confidence calculation
  const confidence = Math.min(score, 100)
  const isBot = confidence >= 50

  return {
    isBot,
    confidence,
    reasons,
    score,
  }
}

/**
 * Check if browser supports required features
 */
export function checkBrowserSupport(): {
  supported: boolean
  missing: string[]
} {
  if (typeof window === 'undefined') {
    return { supported: true, missing: [] }
  }

  const missing: string[] = []

  if (!window.localStorage) missing.push('localStorage')
  if (!window.sessionStorage) missing.push('sessionStorage')
  if (!window.WebSocket) missing.push('WebSocket')
  if (!window.fetch) missing.push('fetch')
  if (!window.Promise) missing.push('Promise')

  return {
    supported: missing.length === 0,
    missing,
  }
}

/**
 * Validate wallet interaction patterns
 */
export function validateWalletBehavior(data: {
  connectionAttempts: number
  successfulConnections: number
  failedAttempts: number
  transactionAttempts: number
  timeRange: number // in milliseconds
}): { suspicious: boolean; reason?: string } {
  // Too many connection attempts in short time
  if (data.connectionAttempts > 10 && data.timeRange < 60000) {
    return {
      suspicious: true,
      reason: 'Too many wallet connection attempts',
    }
  }

  // High failure rate
  const failureRate = data.failedAttempts / (data.connectionAttempts || 1)
  if (failureRate > 0.8 && data.connectionAttempts > 5) {
    return {
      suspicious: true,
      reason: 'Unusually high connection failure rate',
    }
  }

  // Too many transactions in short time
  if (data.transactionAttempts > 5 && data.timeRange < 10000) {
    return {
      suspicious: true,
      reason: 'Too many transaction attempts',
    }
  }

  return { suspicious: false }
}

/**
 * Analyze user interaction quality
 */
export function analyzeUserInteraction(data: {
  mouseMovements: number
  clicks: number
  scrollEvents: number
  keyPresses: number
  sessionDuration: number
}): { quality: 'high' | 'medium' | 'low' | 'suspicious'; score: number } {
  let score = 0

  // Natural mouse movement
  if (data.mouseMovements > 50) score += 25
  else if (data.mouseMovements > 20) score += 15
  else if (data.mouseMovements > 5) score += 5

  // Click patterns
  if (data.clicks > 10) score += 20
  else if (data.clicks > 5) score += 10

  // Scroll behavior
  if (data.scrollEvents > 10) score += 20
  else if (data.scrollEvents > 3) score += 10

  // Keyboard interaction
  if (data.keyPresses > 20) score += 20
  else if (data.keyPresses > 5) score += 10

  // Session duration (not too short, not too long)
  const duration = data.sessionDuration / 1000 // convert to seconds
  if (duration > 10 && duration < 3600) score += 15
  else if (duration > 5) score += 5

  let quality: 'high' | 'medium' | 'low' | 'suspicious'
  if (score >= 80) quality = 'high'
  else if (score >= 50) quality = 'medium'
  else if (score >= 20) quality = 'low'
  else quality = 'suspicious'

  return { quality, score }
}
