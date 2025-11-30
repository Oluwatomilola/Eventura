/**
 * Message validation utilities
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface MessageInput {
  from_wallet: string
  to_wallet: string
  event_id?: number | string
  content: string
}

/**
 * Sanitize text input to prevent XSS
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Validate wallet address format
 */
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Validate message input
 */
export function validateMessage(input: MessageInput): ValidationResult {
  const errors: string[] = []

  // Validate from wallet
  if (!input.from_wallet) {
    errors.push('Sender wallet address is required')
  } else if (!isValidWalletAddress(input.from_wallet)) {
    errors.push('Invalid sender wallet address format')
  }

  // Validate to wallet
  if (!input.to_wallet) {
    errors.push('Recipient wallet address is required')
  } else if (!isValidWalletAddress(input.to_wallet)) {
    errors.push('Invalid recipient wallet address format')
  }

  // Cannot send message to self
  if (input.from_wallet && input.to_wallet &&
      input.from_wallet.toLowerCase() === input.to_wallet.toLowerCase()) {
    errors.push('Cannot send message to yourself')
  }

  // Validate content
  if (!input.content) {
    errors.push('Message content is required')
  } else if (input.content.trim().length === 0) {
    errors.push('Message content cannot be empty')
  } else if (input.content.length > 2000) {
    errors.push('Message content must be 2000 characters or less')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize message input
 */
export function sanitizeMessage(input: MessageInput): MessageInput {
  return {
    from_wallet: input.from_wallet.toLowerCase(),
    to_wallet: input.to_wallet.toLowerCase(),
    event_id: input.event_id,
    content: sanitizeText(input.content)
  }
}
