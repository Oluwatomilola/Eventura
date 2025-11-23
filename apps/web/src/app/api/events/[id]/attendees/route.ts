/**
 * Event Attendees API
 * GET - Get attendees for an event with filtering, search, and sorting
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    const { searchParams } = new URL(req.url)

    // Query parameters
    const search = searchParams.get('search')?.trim() || ''
    const interests = searchParams.get('interests')?.split(',').filter(Boolean) || []
    const lookingFor = searchParams.get('lookingFor')?.split(',').filter(Boolean) || []
    const sort = searchParams.get('sort') || 'relevance'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const requestingWallet = searchParams.get('wallet')?.toLowerCase()

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    const offset = (page - 1) * limit

    const supabase = createServerClient()

    // TODO: Verify requesting user has a ticket for this event
    // This will be implemented when the ticketing contract integration is complete
    // Example:
    // if (requestingWallet) {
    //   const hasTicket = await verifyTicketOwnership(requestingWallet, eventId)
    //   if (!hasTicket) {
    //     return NextResponse.json(
    //       { success: false, error: 'You must have a ticket to view attendees' },
    //       { status: 403 }
    //     )
    //   }
    // }

    // Fetch attendees with visible personas
    let query = supabase
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

    // Apply search filter (search in display_name and bio)
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,bio.ilike.%${search}%`)
    }

    // Apply interests filter (attendee has any of the specified interests)
    if (interests.length > 0) {
      query = query.overlaps('interests', interests)
    }

    // Apply looking_for filter
    if (lookingFor.length > 0) {
      query = query.overlaps('looking_for', lookingFor)
    }

    const { data: personas, error, count } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch attendees' },
        { status: 500 }
      )
    }

    if (!personas || personas.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      })
    }

    // Calculate shared interests for relevance sorting
    const requestingPersona = requestingWallet
      ? await supabase
          .from('event_personas')
          .select('interests, looking_for')
          .eq('event_id', eventId)
          .eq('wallet_address', requestingWallet)
          .single()
      : null

    const requestingInterests = (requestingPersona?.data as any)?.interests || []
    const requestingLookingFor = (requestingPersona?.data as any)?.looking_for || []

    // Map personas and calculate shared interests
    const attendees = personas.map((persona: any) => {
      const sharedInterests = requestingInterests.filter((interest: string) =>
        persona.interests.includes(interest)
      )
      const sharedLookingFor = requestingLookingFor.filter((item: string) =>
        persona.looking_for.includes(item)
      )

      return {
        id: persona.id,
        wallet_address: persona.wallet_address,
        display_name: persona.display_name,
        bio: persona.bio,
        interests: persona.interests,
        looking_for: persona.looking_for,
        visibility: persona.visibility,
        avatar_ipfs_hash: persona.users?.avatar_ipfs_hash,
        created_at: persona.created_at,
        shared_interests_count: sharedInterests.length,
        shared_looking_for_count: sharedLookingFor.length,
        match_score: sharedInterests.length + sharedLookingFor.length
      }
    })

    // Apply sorting
    let sortedAttendees = [...attendees]
    switch (sort) {
      case 'relevance':
        // Sort by match score (shared interests + shared looking_for)
        sortedAttendees.sort((a, b) => b.match_score - a.match_score)
        break
      case 'recent':
        // Sort by created_at (newest first)
        sortedAttendees.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case 'alphabetical':
        // Sort by display_name (A-Z)
        sortedAttendees.sort((a, b) => a.display_name.localeCompare(b.display_name))
        break
      default:
        // Default to relevance
        sortedAttendees.sort((a, b) => b.match_score - a.match_score)
    }

    // Apply pagination
    const paginatedAttendees = sortedAttendees.slice(offset, offset + limit)
    const totalAttendees = sortedAttendees.length

    return NextResponse.json({
      success: true,
      data: paginatedAttendees,
      pagination: {
        page,
        limit,
        total: totalAttendees,
        totalPages: Math.ceil(totalAttendees / limit)
      }
    })
  } catch (error: any) {
    console.error('Attendees fetch error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
