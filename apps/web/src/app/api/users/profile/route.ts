/**
 * User Profile API Routes
 * POST - Create or update user profile
 * PATCH - Update user profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { verifyWalletSignature, verifyTimestamp } from '@/lib/auth/verify'
import { validateUserProfile, sanitizeUserProfile } from '@/lib/validation/user'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { wallet_address, display_name, global_bio, avatar_ipfs_hash, signature, message } = body

    // Rate limiting (60 requests per hour per wallet)
    const rateLimitResult = checkRateLimit(`profile:${wallet_address}`, 60)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    // Verify wallet signature
    if (!signature || !message) {
      return NextResponse.json(
        { success: false, error: 'Signature and message are required for authentication' },
        { status: 401 }
      )
    }

    // Verify timestamp to prevent replay attacks
    if (!verifyTimestamp(message)) {
      return NextResponse.json(
        { success: false, error: 'Signature expired. Please sign again.' },
        { status: 401 }
      )
    }

    // Verify signature
    const verificationResult = await verifyWalletSignature(wallet_address, message, signature)
    if (!verificationResult.isValid) {
      return NextResponse.json(
        { success: false, error: verificationResult.error || 'Invalid signature' },
        { status: 401 }
      )
    }

    // Validate input
    const validationResult = validateUserProfile({
      wallet_address,
      display_name,
      global_bio,
      avatar_ipfs_hash
    })

    if (!validationResult.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validationResult.errors },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedInput = sanitizeUserProfile({
      wallet_address,
      display_name,
      global_bio,
      avatar_ipfs_hash
    })

    // Create or update profile in database
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('users')
      .upsert({
        wallet_address: sanitizedInput.wallet_address,
        display_name: sanitizedInput.display_name,
        global_bio: sanitizedInput.global_bio,
        avatar_ipfs_hash: sanitizedInput.avatar_ipfs_hash,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'wallet_address'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error: any) {
    console.error('Profile creation error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { wallet_address, display_name, global_bio, avatar_ipfs_hash, signature, message } = body

    // Rate limiting (60 requests per hour per wallet)
    const rateLimitResult = checkRateLimit(`profile:${wallet_address}`, 60)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    // Verify wallet signature
    if (!signature || !message) {
      return NextResponse.json(
        { success: false, error: 'Signature and message are required for authentication' },
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
    const verificationResult = await verifyWalletSignature(wallet_address, message, signature)
    if (!verificationResult.isValid) {
      return NextResponse.json(
        { success: false, error: verificationResult.error || 'Invalid signature' },
        { status: 401 }
      )
    }

    // Build update object (only include provided fields)
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (display_name !== undefined) {
      updateData.display_name = display_name
    }
    if (global_bio !== undefined) {
      updateData.global_bio = global_bio
    }
    if (avatar_ipfs_hash !== undefined) {
      updateData.avatar_ipfs_hash = avatar_ipfs_hash
    }

    // Validate partial input
    const validationResult = validateUserProfile({
      wallet_address,
      ...updateData
    })

    if (!validationResult.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validationResult.errors },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedData: any = {}
    if (display_name !== undefined) {
      sanitizedData.display_name = display_name.trim()
    }
    if (global_bio !== undefined) {
      sanitizedData.global_bio = global_bio.trim()
    }
    if (avatar_ipfs_hash !== undefined) {
      sanitizedData.avatar_ipfs_hash = avatar_ipfs_hash.trim()
    }

    // Update profile in database
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('users')
      .update({
        ...sanitizedData,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', wallet_address.toLowerCase())
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
