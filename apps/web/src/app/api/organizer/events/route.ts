/**
 * Organizer Events API
 * GET - Get all events created by the connected wallet
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { EventTicketingABI, getContractAddresses } from '@/lib/contracts'
import { fetchFromIPFS } from '@/utils/ipfs'
import { formatEther } from 'viem'

interface EventWithStats {
  id: string
  title: string
  coverImageUrl?: string
  startDateTime: string
  endDateTime: string
  ticketPrice: string
  capacity: number
  ticketsSold: number
  revenue: string
  revenueUSD: number
  attendeeCount: number
  status: 'upcoming' | 'ongoing' | 'past' | 'cancelled'
  createdAt: string
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get('wallet')?.toLowerCase()
    const chainId = parseInt(searchParams.get('chainId') || '84532', 10)

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

    // Get organizer's event IDs
    const eventIds = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: EventTicketingABI,
      functionName: 'getOrganizerEvents',
      args: [walletAddress as `0x${string}`],
    })

    if (!eventIds || eventIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Fetch event details and metadata
    const events = await Promise.all(
      eventIds.map(async (eventId) => {
        try {
          const eventData = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: EventTicketingABI,
            functionName: 'getEvent',
            args: [eventId],
          })

          // Fetch metadata from IPFS
          let metadata: any = {}
          try {
            metadata = await fetchFromIPFS(eventData.metadataURI)
          } catch (error) {
            console.error(`Failed to fetch metadata for event ${eventId}:`, error)
          }

          const now = Date.now()
          const startTime = Number(eventData.startTime) * 1000
          const endTime = Number(eventData.endTime) * 1000

          let status: 'upcoming' | 'ongoing' | 'past' | 'cancelled' = 'upcoming'
          if (eventData.cancelled) {
            status = 'cancelled'
          } else if (now > endTime) {
            status = 'past'
          } else if (now >= startTime && now <= endTime) {
            status = 'ongoing'
          }

          const ticketPriceEth = formatEther(eventData.ticketPrice)
          const revenueEth = formatEther(
            eventData.ticketPrice * eventData.ticketsSold
          )

          // Estimate USD value (simplified - in production, use a price oracle)
          const ethPriceUSD = 2500 // Placeholder - should fetch from oracle
          const revenueUSD = parseFloat(revenueEth) * ethPriceUSD

          // Get attendee count from personas table
          const { createServerClient } = await import('@/lib/supabase')
          const supabase = createServerClient()
          const { count: attendeeCount } = await supabase
            .from('event_personas')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId.toString())

          return {
            id: eventId.toString(),
            title: metadata.title || `Event #${eventId}`,
            coverImageUrl: metadata.media?.coverImageUrl,
            startDateTime: new Date(startTime).toISOString(),
            endDateTime: new Date(endTime).toISOString(),
            ticketPrice: ticketPriceEth,
            capacity: Number(eventData.maxTickets),
            ticketsSold: Number(eventData.ticketsSold),
            revenue: revenueEth,
            revenueUSD: Math.round(revenueUSD * 100) / 100,
            attendeeCount: attendeeCount || 0,
            status,
            createdAt: new Date(Number(eventData.createdAt) * 1000).toISOString(),
          } as EventWithStats
        } catch (error) {
          console.error(`Error fetching event ${eventId}:`, error)
          return null
        }
      })
    )

    const validEvents = events.filter((e) => e !== null) as EventWithStats[]

    return NextResponse.json({
      success: true,
      data: validEvents,
    })
  } catch (error: any) {
    console.error('Organizer events fetch error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

