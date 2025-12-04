/**
 * Mark message as read
 * PATCH /api/messages/[id]/read
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase/db'
import type { ApiResponse } from '@/lib/supabase/api.types'

const createErrorResponse = (error: string, status: number): NextResponse<ApiResponse> => {
  return NextResponse.json({ success: false, error }, { status })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const messageId = params.id
    const { searchParams } = new URL(req.url)
    const wallet = searchParams.get('wallet')?.toLowerCase()

    if (!wallet) {
      return createErrorResponse('Wallet address is required', 400)
    }

    // Get message to verify ownership
    const message = await db.messages.getById(messageId)

    if (!message) {
      return createErrorResponse('Message not found', 404)
    }

    // Only recipient can mark as read
    if (message.to_wallet !== wallet) {
      return createErrorResponse('You can only mark your own messages as read', 403)
    }

    // Skip if already read
    if (message.read_at) {
      return NextResponse.json({ 
        success: true, 
        data: { message: 'Message already marked as read' } 
      })
    }

    // Update read status
    const updatedMessage = await db.messages.markAsRead(messageId)

    if (!updatedMessage) {
      return createErrorResponse('Failed to update message', 500)
    }

    return NextResponse.json({ 
      success: true, 
      data: { message: 'Message marked as read' } 
    })
  } catch (error) {
    console.error('Error in PATCH /api/messages/[id]/read:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
