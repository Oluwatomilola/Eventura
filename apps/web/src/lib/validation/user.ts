/**
 * User profile validation utilities
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface UserProfileInput {
  wallet_address: string
  display_name?: string
  global_bio?: string
  avatar_ipfs_hash?: string
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
 * Validate IPFS hash format
 */
export function isValidIpfsHash(hash: string): boolean {
  // Basic validation for IPFS CIDv0 and CIDv1
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}|^[a-z2-7]{59}$/.test(hash)
}

/**
 * Validate user profile input
 */
export function validateUserProfile(input: UserProfileInput): ValidationResult {
  const errors: string[] = []

  // Validate wallet address
  if (!input.wallet_address) {
    errors.push('Wallet address is required')
  } else if (!isValidWalletAddress(input.wallet_address)) {
    errors.push('Invalid wallet address format')
  }

  // Validate display name
  if (input.display_name !== undefined) {
    if (input.display_name.length === 0) {
      errors.push('Display name cannot be empty')
    } else if (input.display_name.length > 50) {
      errors.push('Display name must be 50 characters or less')
    }
  }

  // Validate bio
  if (input.global_bio !== undefined) {
    if (input.global_bio.length > 500) {
      errors.push('Bio must be 500 characters or less')
    }
  }

  // Validate avatar IPFS hash
  if (input.avatar_ipfs_hash !== undefined && input.avatar_ipfs_hash.length > 0) {
    if (!isValidIpfsHash(input.avatar_ipfs_hash)) {
      errors.push('Invalid IPFS hash format')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize user profile input
 */
export function sanitizeUserProfile(input: UserProfileInput): UserProfileInput {
  return {
    wallet_address: input.wallet_address.toLowerCase(),
    display_name: input.display_name ? sanitizeText(input.display_name) : undefined,
    global_bio: input.global_bio ? sanitizeText(input.global_bio) : undefined,
    avatar_ipfs_hash: input.avatar_ipfs_hash?.trim()
  }
}
