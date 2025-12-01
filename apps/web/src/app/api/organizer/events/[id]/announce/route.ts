/**
 * Event Announcement API
 * POST - Send announcement to all ticket holders
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { EventTicketingABI, getContractAddresses } from '@/lib/contracts'
import { createServerClient } from '@/lib/supabase'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    const body = await req.json()
    const { title, message, walletAddress, chainId } = body

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'Title and message are required' },
        { status: 400 }
      )
    }

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

    const supabase = createServerClient()

    // Get all ticket holders (from personas - they must have a ticket to create a persona)
    // In production, query the contract for all ticket owners
    const { data: attendees } = await supabase
      .from('event_personas')
      .select('wallet_address, display_name')
      .eq('event_id', eventId)

    if (!attendees || attendees.length === 0) {
      return NextResponse.json({
        success: true,
        data: { notificationsSent: 0, emailsSent: 0 },
        message: 'No attendees found to notify',
      })
    }

    // Get event metadata for email
    let eventTitle = `Event #${eventId}`
    try {
      const { fetchFromIPFS } = await import('@/utils/ipfs')
      const metadata = await fetchFromIPFS(eventData.metadataURI)
      eventTitle = metadata.title || eventTitle
    } catch (error) {
      console.error('Failed to fetch event metadata:', error)
    }

    // Create notifications for all attendees
    const notifications = attendees.map((attendee) => ({
      user_wallet: attendee.wallet_address,
      type: 'event_announcement',
      title,
      message,
      link: `/events/${eventId}`,
      metadata: {
        event_id: eventId,
        organizer: walletAddress,
      },
    }))

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications)

    if (notificationError) {
      console.error('Error creating notifications:', notificationError)
    }

    // Send emails (if email addresses are available)
    // Note: In production, you'd need to store email addresses separately
    // For now, we'll just log that emails would be sent
    let emailsSent = 0
    // TODO: Implement email sending when email addresses are available
    // for (const attendee of attendees) {
    //   const email = await getEmailForWallet(attendee.wallet_address)
    //   if (email) {
    //     await sendEmail(email, {
    //       subject: `[${eventTitle}] ${title}`,
    //       react: <EventAnnouncementEmail eventName={eventTitle} title={title} message={message} />,
    //     })
    //   }
    // }

    return NextResponse.json({
      success: true,
      data: {
        notificationsSent: notifications.length,
        emailsSent,
        totalAttendees: attendees.length,
      },
    })
  } catch (error: any) {
    console.error('Announcement error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

