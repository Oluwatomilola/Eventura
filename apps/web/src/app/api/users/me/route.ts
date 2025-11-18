/**
 * GET Current User Profile
 * Authenticated endpoint - requires wallet signature
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { verifyWalletSignature, verifyTimestamp } from '@/lib/auth/verify'

export async function GET(req: NextRequest) {
  try {
    // Get authentication from headers
    const walletAddress = req.headers.get('x-wallet-address')
    const signature = req.headers.get('x-signature')
    const message = req.headers.get('x-message')

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Include x-wallet-address, x-signature, and x-message headers.' },
        { status: 401 }
      )
    }

    // Verify timestamp
    if (!verifyTimestamp(message)) {
      return NextResponse.json(
        { success: false, error: 'Signature expired. Please sign again.' },
        { status: 401 }
      )
    }

    // Verify signature
    const verificationResult = await verifyWalletSignature(walletAddress, message, signature)
    if (!verificationResult.isValid) {
      return NextResponse.json(
        { success: false, error: verificationResult.error || 'Invalid signature' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Profile not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
