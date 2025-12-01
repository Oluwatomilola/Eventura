/**
 * Cancel Event API
 * POST - Cancel an event and refund all attendees
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
    const { walletAddress, chainId } = body

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
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

    if (eventData.organizer.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Not the event organizer' },
        { status: 403 }
      )
    }

    if (eventData.cancelled) {
      return NextResponse.json(
        { success: false, error: 'Event is already cancelled' },
        { status: 400 }
      )
    }

    // Get event metadata
    let eventTitle = `Event #${eventId}`
    try {
      const { fetchFromIPFS } = await import('@/utils/ipfs')
      const metadata = await fetchFromIPFS(eventData.metadataURI)
      eventTitle = metadata.title || eventTitle
    } catch (error) {
      console.error('Failed to fetch event metadata:', error)
    }

    // Generate transaction data for frontend to execute
    // The actual cancellation happens on-chain via the contract
    const transactionData = {
      to: contractAddress,
      data: (await import('viem')).encodeFunctionData({
        abi: EventTicketingABI,
        functionName: 'cancelEvent',
        args: [BigInt(eventId)],
      }),
    }

    // Get all attendees to notify
    const supabase = createServerClient()
    const { data: attendees } = await supabase
      .from('event_personas')
      .select('wallet_address, display_name')
      .eq('event_id', eventId)

    // Create cancellation notifications
    if (attendees && attendees.length > 0) {
      const notifications = attendees.map((attendee) => ({
        user_wallet: attendee.wallet_address,
        type: 'event_cancelled',
        title: 'Event Cancelled',
        message: `${eventTitle} has been cancelled. All ticket holders will receive refunds.`,
        link: `/events/${eventId}`,
        metadata: {
          event_id: eventId,
          organizer: walletAddress,
        },
      }))

      await supabase.from('notifications').insert(notifications)
    }

    return NextResponse.json({
      success: true,
      data: {
        transactionData,
        message: 'Event cancellation transaction ready. Please execute it from your wallet.',
        attendeesNotified: attendees?.length || 0,
      },
    })
  } catch (error: any) {
    console.error('Cancel event error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

