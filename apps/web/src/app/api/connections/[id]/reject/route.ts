import { NextResponse } from 'next/server';
import { db } from '@eventura/db';
import { connections, notifications } from '@eventura/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/session';
import { DatabaseError } from '@/lib/db-utils';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Find the connection request
    const [connection] = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.id, id),
          eq(connections.status, 'pending')
        )
      )
      .limit(1);

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection request not found or already processed' },
        { status: 404 }
      );
    }

    // Verify the current user is the recipient
    if (connection.toWallet !== user.walletAddress) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update the connection status to rejected
    const [updatedConnection] = await db
      .update(connections)
      .set({ 
        status: 'rejected',
        updatedAt: new Date()
      })
      .where(eq(connections.id, id))
      .returning();

    // Create a notification for the requester
    await db.insert(notifications).values({
      userWallet: connection.fromWallet,
      type: 'connection_rejected',
      title: 'Connection Declined',
      message: `${user.walletAddress} declined your connection request`,
      link: null,
      metadata: {
        connectionId: connection.id,
        fromWallet: user.walletAddress,
      },
    });

    return NextResponse.json(updatedConnection);
  } catch (error) {
    console.error('[REJECT_CONNECTION_ERROR]', error);
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
