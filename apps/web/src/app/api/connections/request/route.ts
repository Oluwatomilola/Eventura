import { NextResponse } from 'next/server';
import { db } from '@eventura/db';
import { connections } from '@eventura/db/schema';
import { getCurrentUser } from '@/lib/session';
import { validateConnectionRequest, DatabaseError } from '@/lib/db-utils';

interface RequestBody {
  toWallet: string;
  eventId?: string;
  message?: string;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { toWallet, eventId, message } = (await request.json()) as RequestBody;

    if (!toWallet) {
      return NextResponse.json(
        { error: 'Recipient wallet address is required' },
        { status: 400 }
      );
    }

    // Validate the connection request
    await validateConnectionRequest(user.walletAddress, toWallet, eventId);

    // Create the connection request
    const [connection] = await db
      .insert(connections)
      .values({
        fromWallet: user.walletAddress,
        toWallet,
        eventId: eventId || null,
        status: 'pending',
        message: message || null,
        isGlobal: !eventId,
      })
      .returning();

    // TODO: Send notification to the recipient

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    console.error('[CONNECTION_REQUEST_ERROR]', error);
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
