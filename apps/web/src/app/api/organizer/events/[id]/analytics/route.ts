/**
 * Event Analytics API
 * GET - Get comprehensive analytics for an event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { EventTicketingABI, getContractAddresses } from '@/lib/contracts'
import { fetchFromIPFS } from '@/utils/ipfs'
import { formatEther } from 'viem'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
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

    // Get event data
    const eventData = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: EventTicketingABI,
      functionName: 'getEvent',
      args: [BigInt(eventId)],
    })

    // Verify organizer
    if (eventData.organizer.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Not the event organizer' },
        { status: 403 }
      )
    }

    // Get waitlist count
    const waitlistCount = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: EventTicketingABI,
      functionName: 'getWaitlistCount',
      args: [BigInt(eventId)],
    })

    const supabase = createServerClient()

    // Get ticket purchase events from blockchain (simplified - in production, use event logs)
    // For now, we'll estimate based on ticketsSold
    const ticketsSold = Number(eventData.ticketsSold)
    const ticketPrice = formatEther(eventData.ticketPrice)
    const totalRevenueEth = formatEther(eventData.ticketPrice * eventData.ticketsSold)

    // Estimate USD (should use price oracle)
    const ethPriceUSD = 2500
    const totalRevenueUSD = parseFloat(totalRevenueEth) * ethPriceUSD

    // Get attendees with personas
    const { data: personas } = await supabase
      .from('event_personas')
      .select('interests, looking_for, wallet_address, created_at')
      .eq('event_id', eventId)

    // Aggregate interests and looking_for
    const interestsCount: Record<string, number> = {}
    const lookingForCount: Record<string, number> = {}

    personas?.forEach((persona) => {
      persona.interests?.forEach((interest: string) => {
        interestsCount[interest] = (interestsCount[interest] || 0) + 1
      })
      persona.looking_for?.forEach((item: string) => {
        lookingForCount[item] = (lookingForCount[item] || 0) + 1
      })
    })

    // Get connections for this event
    const { data: connections } = await supabase
      .from('connections')
      .select('from_wallet, to_wallet')
      .eq('event_id', eventId)
      .eq('status', 'accepted')

    const totalConnections = connections?.length || 0
    const attendeesWithPersonas = personas?.length || 0
    const avgConnectionsPerAttendee =
      attendeesWithPersonas > 0 ? totalConnections / attendeesWithPersonas : 0

    // Get check-ins
    const { count: checkInCount } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    // Generate sales over time (daily breakdown) - simplified
    // In production, query blockchain events for actual purchase times
    const salesOverTime = []
    const eventStart = Number(eventData.createdAt) * 1000
    const now = Date.now()
    const daysSinceCreation = Math.ceil((now - eventStart) / (1000 * 60 * 60 * 24))

    for (let i = 0; i <= daysSinceCreation; i++) {
      const date = new Date(eventStart + i * 24 * 60 * 60 * 1000)
      // Simplified: distribute sales evenly (in production, use actual event logs)
      const dailySales = i === 0 ? ticketsSold : 0
      salesOverTime.push({
        date: date.toISOString().split('T')[0],
        ticketsSold: dailySales,
        revenue: parseFloat(ticketPrice) * dailySales,
      })
    }

    // Top interests and looking_for
    const topInterests = Object.entries(interestsCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([interest, count]) => ({ interest, count }))

    const topLookingFor = Object.entries(lookingForCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([item, count]) => ({ item, count }))

    return NextResponse.json({
      success: true,
      data: {
        totalTicketsSold: ticketsSold,
        totalRevenue: {
          eth: totalRevenueEth,
          usd: Math.round(totalRevenueUSD * 100) / 100,
        },
        salesOverTime,
        attendeeDemographics: {
          totalAttendees: ticketsSold,
          attendeesWithPersonas,
          topInterests,
          topLookingFor,
        },
        connectionStats: {
          totalConnections,
          avgConnectionsPerAttendee: Math.round(avgConnectionsPerAttendee * 100) / 100,
        },
        waitlistCount: Number(waitlistCount),
        checkInCount: checkInCount || 0,
      },
    })
  } catch (error: any) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

