/**
 * Organizer Attendees API
 * GET - Get all ticket holders for an event (organizer view)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { EventTicketingABI, getContractAddresses } from '@/lib/contracts'
import { createServerClient } from '@/lib/supabase'

interface Attendee {
  wallet_address: string
  ticket_id?: string
  persona_name?: string
  purchase_date?: string
  checked_in: boolean
  checked_in_at?: string
  interests?: string[]
  looking_for?: string[]
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get('wallet')?.toLowerCase()
    const chainId = parseInt(searchParams.get('chainId') || '84532', 10)
    const format = searchParams.get('format') // 'json' or 'csv'

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const contractAddresses = getContractAddresses(chainId)
    const contractAddress = contractAddresses.EventTicketing

    if (!contractAddress || contractAddress.length !== 42) {
      return NextResponse.json(
        { success: false, error: 'Contract not deployed on this chain' },
        { status: 400 }
      )
    }

    const chain = chainId === 8453 ? base : baseSepolia
    const rpcUrl = chainId === 8453
      ? process.env.NEXT_PUBLIC_BASE_RPC_URL
      : process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL

    if (!rpcUrl) {
      return NextResponse.json(
        { success: false, error: 'RPC URL not configured' },
        { status: 500 }
      )
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    })

    // Get event data and verify organizer
    const eventData = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: EventTicketingABI,
      functionName: 'getEvent',
      args: [BigInt(eventId)],
    })

    if (eventData.organizer.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Not the event organizer' },
        { status: 403 }
      )
    }

    const supabase = createServerClient()

    // Get all personas (attendees who created personas)
    const { data: personas } = await supabase
      .from('event_personas')
      .select('wallet_address, display_name, interests, looking_for, created_at')
      .eq('event_id', eventId)

    // Get check-ins
    const { data: checkIns } = await supabase
      .from('check_ins')
      .select('wallet_address, ticket_id, checked_in_at')
      .eq('event_id', eventId)

    const checkInMap = new Map<string, { ticket_id?: string; checked_in_at?: string }>()
    checkIns?.forEach((checkIn) => {
      checkInMap.set(checkIn.wallet_address.toLowerCase(), {
        ticket_id: checkIn.ticket_id?.toString(),
        checked_in_at: checkIn.checked_in_at,
      })
    })

    // Build attendees list
    // Note: In production, you'd query the contract for all ticket owners
    // For now, we use personas as a proxy (they must have tickets to create personas)
    const attendees: Attendee[] = (personas || []).map((persona) => {
      const checkIn = checkInMap.get(persona.wallet_address.toLowerCase())
      return {
        wallet_address: persona.wallet_address,
        ticket_id: checkIn?.ticket_id,
        persona_name: persona.display_name,
        purchase_date: persona.created_at,
        checked_in: !!checkIn,
        checked_in_at: checkIn?.checked_in_at,
        interests: persona.interests || [],
        looking_for: persona.looking_for || [],
      }
    })

    // If CSV format requested
    if (format === 'csv') {
      const csvHeaders = [
        'Wallet Address',
        'Persona Name',
        'Ticket ID',
        'Purchase Date',
        'Checked In',
        'Checked In At',
        'Interests',
        'Looking For',
      ]

      const csvRows = attendees.map((attendee) => [
        attendee.wallet_address,
        attendee.persona_name || '',
        attendee.ticket_id || '',
        attendee.purchase_date || '',
        attendee.checked_in ? 'Yes' : 'No',
        attendee.checked_in_at || '',
        (attendee.interests || []).join('; '),
        (attendee.looking_for || []).join('; '),
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="event-${eventId}-attendees.csv"`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: attendees,
      total: attendees.length,
    })
  } catch (error: any) {
    console.error('Attendees fetch error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

