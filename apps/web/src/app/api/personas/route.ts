/**
 * Personas API Routes
 * POST - Create a new persona for an event
 * GET - Get personas for an event (with query params)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { verifyWalletSignature, verifyTimestamp } from '@/lib/auth/verify'
import { validatePersona, sanitizePersona } from '@/lib/validation/persona'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      wallet_address,
      event_id,
      display_name,
      bio,
      interests,
      looking_for,
      visibility,
      signature,
      message
    } = body

    // Rate limiting (30 requests per hour per wallet)
    const rateLimitResult = checkRateLimit(`persona:create:${wallet_address}`, 30)
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
    const validationResult = validatePersona({
      wallet_address,
      event_id,
      display_name,
      bio,
      interests,
      looking_for,
      visibility
    })

    if (!validationResult.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validationResult.errors },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedInput = sanitizePersona({
      wallet_address,
      event_id,
      display_name,
      bio,
      interests,
      looking_for,
      visibility
    })

    const supabase = createServerClient()

    // TODO: Verify user owns a ticket for this event
    // This will be implemented when the ticketing contract integration is complete
    // Example:
    // const hasTicket = await verifyTicketOwnership(wallet_address, event_id)
    // if (!hasTicket) {
    //   return NextResponse.json(
    //     { success: false, error: 'You must own a ticket to create a persona for this event' },
    //     { status: 403 }
    //   )
    // }

    // Check if user already has a persona for this event
    const { data: existingPersona } = await supabase
      .from('event_personas')
      .select('id')
      .eq('wallet_address', sanitizedInput.wallet_address)
      .eq('event_id', sanitizedInput.event_id)
      .single()

    if (existingPersona) {
      return NextResponse.json(
        { success: false, error: 'You already have a persona for this event. Use PATCH to update it.' },
        { status: 409 }
      )
    }

    // Create persona in database
    const { data, error } = await (supabase as any)
      .from('event_personas')
      .insert({
        wallet_address: sanitizedInput.wallet_address,
        event_id: sanitizedInput.event_id,
        display_name: sanitizedInput.display_name,
        bio: sanitizedInput.bio,
        interests: sanitizedInput.interests || [],
        looking_for: sanitizedInput.looking_for || [],
        visibility: sanitizedInput.visibility || 'attendees',
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create persona' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201, headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error: any) {
    console.error('Persona creation error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    const walletAddress = searchParams.get('wallet')

    const supabase = createServerClient()

    // Get personas for a specific event
    if (eventId) {
      const query = supabase
        .from('event_personas')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      // Filter by wallet if provided
      if (walletAddress) {
        query.eq('wallet_address', walletAddress.toLowerCase())
      }

      const { data, error } = await query

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch personas' },
          { status: 500 }
        )
      }

      // Filter by visibility
      // TODO: Apply proper visibility rules based on requesting user's relationship
      // For now, we return all non-private personas
      const filteredData = (data as any[]).filter((persona: any) => persona.visibility !== 'private')

      return NextResponse.json({ success: true, data: filteredData })
    }

    // If no eventId, return error
    return NextResponse.json(
      { success: false, error: 'eventId query parameter is required' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Personas fetch error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
