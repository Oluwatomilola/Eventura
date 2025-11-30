/**
 * Event Details API
 * GET - Get event details with metadata and social info
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
    const wallet = searchParams.get('wallet')?.toLowerCase()

    const supabase = createServerClient()

    // TODO: Fetch event data from blockchain when contracts are deployed
    // For now, return mock data structure

    // Fetch attendee count with personas
    const { count: attendeeCount } = await supabase
      .from('event_personas')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .in('visibility', ['public', 'attendees'])

    // If wallet provided, get user's connection count for this event
    let connectionCount = 0
    if (wallet) {
      const { count } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .or(`from_wallet.eq.${wallet},to_wallet.eq.${wallet}`)
        .eq('status', 'accepted')

      connectionCount = count || 0
    }

    // Mock event data (replace with blockchain data when available)
    const eventData = {
      id: eventId,
      title: 'Sample Event',
      description: 'This is a sample event description',
      coverImage: '/placeholder-event.jpg',
      category: 'Technology',
      startTime: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
      endTime: Math.floor(Date.now() / 1000) + 93600,
      location: 'Virtual',
      ticketPrice: '0.1',
      maxTickets: 500,
      ticketsSold: 127,
      organizer: {
        name: 'Event Organizer',
        address: '0x0000000000000000000000000000000000000000'
      },
      metadata: {
        highlights: ['Feature 1', 'Feature 2', 'Feature 3'],
        refundPolicy: 'Full refund before event starts'
      },
      // Social data
      attendeeCount: attendeeCount || 0,
      userConnectionCount: connectionCount,
      userOwnsTicket: false, // TODO: Check blockchain
      userHasPersona: false // Will be checked separately
    }

    return NextResponse.json({ success: true, data: eventData })
  } catch (error: any) {
    console.error('Event fetch error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
