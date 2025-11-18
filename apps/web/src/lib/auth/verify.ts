/**
 * Wallet signature verification utilities
 * Uses viem for signature verification (part of REOWN/WalletConnect ecosystem)
 */

import { verifyMessage } from 'viem'

export interface SignatureVerificationResult {
  isValid: boolean
  walletAddress?: string
  error?: string
}

/**
 * Verify a wallet signature
 *
 * @param walletAddress - The wallet address claiming to sign the message
 * @param message - The message that was signed
 * @param signature - The signature from the wallet
 * @returns Verification result
 */
export async function verifyWalletSignature(
  walletAddress: string,
  message: string,
  signature: string
): Promise<SignatureVerificationResult> {
  try {
    // Validate inputs
    if (!walletAddress || !message || !signature) {
      return {
        isValid: false,
        error: 'Missing required parameters'
      }
    }

    // Validate wallet address format
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return {
        isValid: false,
        error: 'Invalid wallet address format'
      }
    }

    // Verify signature using viem
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    })

    if (!isValid) {
      return {
        isValid: false,
        error: 'Invalid signature'
      }
    }

    return {
      isValid: true,
      walletAddress: walletAddress.toLowerCase()
    }
  } catch (error) {
    console.error('Signature verification error:', error)
    return {
      isValid: false,
      error: 'Signature verification failed'
    }
  }
}

/**
 * Generate a message for wallet signing
 * This should be used on the frontend before calling the API
 *
 * @param walletAddress - The wallet address
 * @returns Message to sign
 */
export function generateSignMessage(walletAddress: string): string {
  const timestamp = Date.now()
  return `Sign this message to authenticate with Eventura\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nThis signature will not trigger any blockchain transaction or cost any gas fees.`
}

/**
 * Verify timestamp to prevent replay attacks
 *
 * @param message - The signed message
 * @param maxAgeMs - Maximum age in milliseconds (default: 5 minutes)
 * @returns Whether the timestamp is valid
 */
export function verifyTimestamp(message: string, maxAgeMs: number = 5 * 60 * 1000): boolean {
  try {
    const timestampMatch = message.match(/Timestamp: (\d+)/)
    if (!timestampMatch) {
      return false
    }

    const timestamp = parseInt(timestampMatch[1], 10)
    const now = Date.now()
    const age = now - timestamp

    return age >= 0 && age <= maxAgeMs
  } catch {
    return false
  }
}
