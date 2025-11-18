/**
 * Suggested Connections API
 * GET - Get intelligent connection suggestions for a user at an event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getSuggestedConnections, type Persona } from '@/lib/matching/algorithm'

// In-memory cache for suggestions (1 hour TTL)
interface CacheEntry {
  data: any
  timestamp: number
}

const suggestionCache = new Map<string, CacheEntry>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

function getCacheKey(eventId: string, wallet: string): string {
  return `${eventId}:${wallet.toLowerCase()}`
}

function getCachedSuggestions(eventId: string, wallet: string): any | null {
  const key = getCacheKey(eventId, wallet)
  const entry = suggestionCache.get(key)

  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > CACHE_TTL) {
    // Cache expired, remove it
    suggestionCache.delete(key)
    return null
  }

  return entry.data
}

function setCachedSuggestions(eventId: string, wallet: string, data: any): void {
  const key = getCacheKey(eventId, wallet)
  suggestionCache.set(key, {
    data,
    timestamp: Date.now()
  })

  // Clean up expired entries periodically (1% chance per request)
  if (Math.random() < 0.01) {
    cleanupExpiredCache()
  }
}

function cleanupExpiredCache(): void {
  const now = Date.now()
  for (const [key, entry] of suggestionCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      suggestionCache.delete(key)
    }
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    const { searchParams } = new URL(req.url)

    const wallet = searchParams.get('wallet')?.toLowerCase()
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Validate limit
    if (limit < 1 || limit > 20) {
      return NextResponse.json(
        { success: false, error: 'Limit must be between 1 and 20' },
        { status: 400 }
      )
    }

    // Check cache first
    const cached = getCachedSuggestions(eventId, wallet)
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached.slice(0, limit),
        cached: true
      })
    }

    const supabase = createServerClient()

    // Fetch user's persona for this event
    const { data: userPersona, error: userError } = await supabase
      .from('event_personas')
      .select(`
        id,
        wallet_address,
        display_name,
        bio,
        interests,
        looking_for,
        created_at,
        users!inner (
          avatar_ipfs_hash
        )
      `)
      .eq('event_id', eventId)
      .eq('wallet_address', wallet)
      .single()

    if (userError || !userPersona) {
      return NextResponse.json(
        { success: false, error: 'You must create a persona for this event to see suggestions' },
        { status: 404 }
      )
    }

    // Fetch all visible attendees for this event
    const { data: attendees, error: attendeesError } = await supabase
      .from('event_personas')
      .select(`
        id,
        wallet_address,
        display_name,
        bio,
        interests,
        looking_for,
        visibility,
        created_at,
        users!inner (
          avatar_ipfs_hash
        )
      `)
      .eq('event_id', eventId)
      .in('visibility', ['public', 'attendees'])
      .neq('wallet_address', wallet) // Exclude self

    if (attendeesError) {
      console.error('Database error:', attendeesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch attendees' },
        { status: 500 }
      )
    }

    if (!attendees || attendees.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No other attendees found for suggestions'
      })
    }

    // Transform data to Persona format
    const userPersonaData: Persona = {
      id: userPersona.id,
      wallet_address: userPersona.wallet_address,
      display_name: userPersona.display_name,
      bio: userPersona.bio,
      interests: userPersona.interests || [],
      looking_for: userPersona.looking_for || [],
      avatar_ipfs_hash: userPersona.users?.avatar_ipfs_hash,
      created_at: userPersona.created_at
    }

    const allAttendees: Persona[] = attendees.map((attendee: any) => ({
      id: attendee.id,
      wallet_address: attendee.wallet_address,
      display_name: attendee.display_name,
      bio: attendee.bio,
      interests: attendee.interests || [],
      looking_for: attendee.looking_for || [],
      avatar_ipfs_hash: attendee.users?.avatar_ipfs_hash,
      created_at: attendee.created_at
    }))

    // Calculate suggestions using the matching algorithm
    const suggestions = getSuggestedConnections(userPersonaData, allAttendees, 20)

    // Cache the results
    setCachedSuggestions(eventId, wallet, suggestions)

    // Return top N suggestions
    return NextResponse.json({
      success: true,
      data: suggestions.slice(0, limit),
      cached: false
    })
  } catch (error: any) {
    console.error('Suggestions fetch error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
