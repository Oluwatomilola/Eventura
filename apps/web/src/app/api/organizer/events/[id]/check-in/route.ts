/**
 * Check-in API
 * POST - Check in an attendee by ticket ID or wallet address
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { EventTicketingABI, getContractAddresses } from '@/lib/contracts'
import { createServerClient } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    const body = await req.json()
    const { ticketId, walletAddress, organizerWallet, chainId } = body

    if (!organizerWallet) {
      return NextResponse.json(
        { success: false, error: 'Organizer wallet address is required' },
        { status: 400 }
      )
    }

    if (!ticketId && !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Either ticketId or walletAddress is required' },
        { status: 400 }
      )
    }

    const contractAddresses = getContractAddresses(chainId || 84532)
    const contractAddress = contractAddresses.EventTicketing

    if (!contractAddress || contractAddress.length !== 42) {
      return NextResponse.json(
        { success: false, error: 'Contract not deployed on this chain' },
        { status: 400 }
      )
    }

    const chain = (chainId || 84532) === 8453 ? base : baseSepolia
    const rpcUrl = (chainId || 84532) === 8453
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

    if (eventData.organizer.toLowerCase() !== organizerWallet.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Not the event organizer' },
        { status: 403 }
      )
    }

    // If ticketId provided, verify ticket ownership
    let attendeeWallet = walletAddress?.toLowerCase()
    if (ticketId) {
      // In production, query the contract to get ticket owner
      // For now, we'll use the walletAddress if provided, or require it
      if (!attendeeWallet) {
        // TODO: Query contract for ticket owner
        // const ticketOwner = await publicClient.readContract({...})
        // attendeeWallet = ticketOwner.toLowerCase()
        return NextResponse.json(
          { success: false, error: 'Wallet address required when using ticket ID' },
          { status: 400 }
        )
      }
    }

    if (!attendeeWallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Check if already checked in
    const { data: existingCheckIn } = await supabase
      .from('check_ins')
      .select('*')
      .eq('event_id', eventId)
      .eq('wallet_address', attendeeWallet)
      .single()

    if (existingCheckIn) {
      return NextResponse.json({
        success: true,
        data: {
          alreadyCheckedIn: true,
          checkedInAt: existingCheckIn.checked_in_at,
        },
      })
    }

    // Create check-in record
    const { data: checkIn, error } = await supabase
      .from('check_ins')
      .insert({
        event_id: eventId,
        ticket_id: ticketId ? BigInt(ticketId).toString() : null,
        wallet_address: attendeeWallet,
        checked_in_by: organizerWallet,
      })
      .select()
      .single()

    if (error) {
      console.error('Check-in error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create check-in record' },
        { status: 500 }
      )
    }

    // Get attendee persona info if available
    const { data: persona } = await supabase
      .from('event_personas')
      .select('display_name, interests, looking_for')
      .eq('event_id', eventId)
      .eq('wallet_address', attendeeWallet)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        checkIn,
        attendee: {
          wallet_address: attendeeWallet,
          persona_name: persona?.display_name,
          interests: persona?.interests || [],
          looking_for: persona?.looking_for || [],
        },
      },
    })
  } catch (error: any) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

