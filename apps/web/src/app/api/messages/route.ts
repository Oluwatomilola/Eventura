/**
 * Messages API Routes
 * POST - Send a new message
 * GET - Get messages for a connection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { verifyWalletSignature, verifyTimestamp } from '@/lib/auth/verify'
import { validateMessage, sanitizeMessage } from '@/lib/validation/message'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      from_wallet,
      to_wallet,
      event_id,
      content,
      signature,
      message
    } = body

    // Rate limiting (100 messages per hour per user)
    const rateLimitResult = checkRateLimit(`messages:send:${from_wallet}`, 100)
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

    // Verify timestamp
    if (!verifyTimestamp(message)) {
      return NextResponse.json(
        { success: false, error: 'Signature expired. Please sign again.' },
        { status: 401 }
      )
    }

    // Verify signature
    const verificationResult = await verifyWalletSignature(from_wallet, message, signature)
    if (!verificationResult.isValid) {
      return NextResponse.json(
        { success: false, error: verificationResult.error || 'Invalid signature' },
        { status: 401 }
      )
    }

    // Validate input
    const validationResult = validateMessage({
      from_wallet,
      to_wallet,
      event_id,
      content
    })

    if (!validationResult.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validationResult.errors },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedInput = sanitizeMessage({
      from_wallet,
      to_wallet,
      event_id,
      content
    })

    const supabase = createServerClient()

    // Check if users are connected
    const { data: connection } = await supabase
      .from('connections')
      .select('status')
      .or(`and(from_wallet.eq.${sanitizedInput.from_wallet},to_wallet.eq.${sanitizedInput.to_wallet}),and(from_wallet.eq.${sanitizedInput.to_wallet},to_wallet.eq.${sanitizedInput.from_wallet})`)
      .eq('status', 'accepted')
      .single()

    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'You can only message accepted connections' },
        { status: 403 }
      )
    }

    // Check if sender is blocked
    const { data: blockedConnection } = await supabase
      .from('connections')
      .select('status')
      .or(`and(from_wallet.eq.${sanitizedInput.from_wallet},to_wallet.eq.${sanitizedInput.to_wallet}),and(from_wallet.eq.${sanitizedInput.to_wallet},to_wallet.eq.${sanitizedInput.from_wallet})`)
      .eq('status', 'blocked')
      .single()

    if (blockedConnection) {
      return NextResponse.json(
        { success: false, error: 'Cannot send messages to this user' },
        { status: 403 }
      )
    }

    // Insert message
    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert({
        from_wallet: sanitizedInput.from_wallet,
        to_wallet: sanitizedInput.to_wallet,
        event_id: sanitizedInput.event_id || null,
        content: sanitizedInput.content
      })
      .select(`
        id,
        from_wallet,
        to_wallet,
        event_id,
        content,
        read_at,
        created_at
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to send message' },
        { status: 500 }
      )
    }

    // Create notification for recipient
    await supabase
      .from('notifications')
      .insert({
        user_wallet: sanitizedInput.to_wallet,
        type: 'new_message',
        title: 'New Message',
        message: `You have a new message`,
        metadata: {
          message_id: newMessage.id,
          from_wallet: sanitizedInput.from_wallet
        }
      })

    return NextResponse.json(
      { success: true, data: newMessage },
      { status: 201, headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error: any) {
    console.error('Message send error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const connectionId = searchParams.get('connectionId')
    const wallet = searchParams.get('wallet')?.toLowerCase()
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    if (!connectionId) {
      return NextResponse.json(
        { success: false, error: 'Connection ID is required' },
        { status: 400 }
      )
    }

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    const offset = (page - 1) * limit

    const supabase = createServerClient()

    // Get connection to find the other user
    const { data: connection } = await supabase
      .from('connections')
      .select('from_wallet, to_wallet')
      .eq('id', connectionId)
      .single()

    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      )
    }

    // Determine the other user's wallet
    const otherWallet = connection.from_wallet === wallet
      ? connection.to_wallet
      : connection.from_wallet

    // Fetch messages between these two users
    const { data: messages, error, count } = await supabase
      .from('messages')
      .select(`
        id,
        from_wallet,
        to_wallet,
        event_id,
        content,
        read_at,
        created_at,
        sender:from_wallet (
          display_name,
          avatar_ipfs_hash
        )
      `, { count: 'exact' })
      .or(`and(from_wallet.eq.${wallet},to_wallet.eq.${otherWallet}),and(from_wallet.eq.${otherWallet},to_wallet.eq.${wallet})`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    // Mark unread messages as read
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('to_wallet', wallet)
      .eq('from_wallet', otherWallet)
      .is('read_at', null)

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    console.error('Messages fetch error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
