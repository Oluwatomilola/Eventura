/**
 * Mark message as read
 * PATCH /api/messages/[id]/read
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id
    const { searchParams } = new URL(req.url)
    const wallet = searchParams.get('wallet')?.toLowerCase()

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get message to verify ownership
    const { data: message } = await supabase
      .from('messages')
      .select('id, to_wallet, read_at')
      .eq('id', messageId)
      .single()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    // Only recipient can mark as read
    if (message.to_wallet !== wallet) {
      return NextResponse.json(
        { success: false, error: 'You can only mark your own messages as read' },
        { status: 403 }
      )
    }

    // Update read status
    const { data, error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Message update error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
