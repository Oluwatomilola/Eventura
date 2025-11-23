/**
 * Individual Persona API Routes
 * PATCH - Update a persona
 * DELETE - Delete a persona
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { verifyWalletSignature, verifyTimestamp } from '@/lib/auth/verify'
import { validatePersona, sanitizePersona, sanitizeText } from '@/lib/validation/persona'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const personaId = params.id
    const body = await req.json()
    const {
      wallet_address,
      display_name,
      bio,
      interests,
      looking_for,
      visibility,
      signature,
      message
    } = body

    // Rate limiting (30 requests per hour per wallet)
    const rateLimitResult = checkRateLimit(`persona:update:${wallet_address}`, 30)
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

    const supabase = createServerClient()

    // Check if persona exists and belongs to user
    const { data: existingPersona, error: fetchError } = await supabase
      .from('event_personas')
      .select('*')
      .eq('id', personaId)
      .single()

    if (fetchError || !existingPersona) {
      return NextResponse.json(
        { success: false, error: 'Persona not found' },
        { status: 404 }
      )
    }

    if ((existingPersona as any).wallet_address !== wallet_address.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'You can only update your own personas' },
        { status: 403 }
      )
    }

    // Build update object (only include provided fields)
    type PersonaUpdate = {
      display_name?: string;
      bio?: string | null;
      interests?: string[];
      looking_for?: string[];
      visibility?: 'public' | 'attendees' | 'connections' | 'private';
      updated_at?: string;
    }
    
    const updateData: PersonaUpdate = {
      updated_at: new Date().toISOString()
    }

    if (display_name !== undefined) {
      if (!display_name || display_name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Display name cannot be empty' },
          { status: 400 }
        )
      }
      if (display_name.length > 50) {
        return NextResponse.json(
          { success: false, error: 'Display name must be 50 characters or less' },
          { status: 400 }
        )
      }
      updateData.display_name = sanitizeText(display_name)
    }

    if (bio !== undefined) {
      if (bio.length < 50 && bio.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Bio must be at least 50 characters or empty' },
          { status: 400 }
        )
      }
      if (bio.length > 300) {
        return NextResponse.json(
          { success: false, error: 'Bio must be 300 characters or less' },
          { status: 400 }
        )
      }
      updateData.bio = bio ? sanitizeText(bio) : null
    }

    if (interests !== undefined) {
      if (!Array.isArray(interests)) {
        return NextResponse.json(
          { success: false, error: 'Interests must be an array' },
          { status: 400 }
        )
      }
      if (interests.length > 10) {
        return NextResponse.json(
          { success: false, error: 'Maximum 10 interests allowed' },
          { status: 400 }
        )
      }
      updateData.interests = interests.map(tag => sanitizeText(tag))
    }

    if (looking_for !== undefined) {
      if (!Array.isArray(looking_for)) {
        return NextResponse.json(
          { success: false, error: 'Looking for must be an array' },
          { status: 400 }
        )
      }
      if (looking_for.length > 10) {
        return NextResponse.json(
          { success: false, error: 'Maximum 10 looking for tags allowed' },
          { status: 400 }
        )
      }
      updateData.looking_for = looking_for.map(tag => sanitizeText(tag))
    }

    if (visibility !== undefined) {
      if (!['public', 'attendees', 'connections', 'private'].includes(visibility)) {
        return NextResponse.json(
          { success: false, error: 'Invalid visibility setting' },
          { status: 400 }
        )
      }
      updateData.visibility = visibility
    }

    // Update persona in database
    const { data, error } = await (supabase as any)
      .from('event_personas')
      .update(updateData)
      .eq('id', personaId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update persona' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error: any) {
    console.error('Persona update error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const personaId = params.id

    // Get wallet address and signature from headers
    const walletAddress = req.headers.get('x-wallet-address')
    const signature = req.headers.get('x-signature')
    const message = req.headers.get('x-message')

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Provide wallet address, signature, and message in headers.' },
        { status: 401 }
      )
    }

    // Rate limiting (20 requests per hour per wallet)
    const rateLimitResult = checkRateLimit(`persona:delete:${walletAddress}`, 20)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
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

    // Check if persona exists and belongs to user
    const { data: existingPersona, error: fetchError } = await supabase
      .from('event_personas')
      .select('*')
      .eq('id', personaId)
      .single()

    if (fetchError || !existingPersona) {
      return NextResponse.json(
        { success: false, error: 'Persona not found' },
        { status: 404 }
      )
    }

    if ((existingPersona as any).wallet_address !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own personas' },
        { status: 403 }
      )
    }

    // Delete persona from database
    const { error } = await (supabase as any)
      .from('event_personas')
      .delete()
      .eq('id', personaId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete persona' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Persona deleted successfully' },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error: any) {
    console.error('Persona deletion error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
