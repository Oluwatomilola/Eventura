import { eq, and, or, isNull, gte } from 'drizzle-orm';
import { db } from '@eventura/db';
import { connections } from '@eventura/db/schema';

export class DatabaseError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = 'DatabaseError';
  }
}

export async function findConnection(fromWallet: string, toWallet: string, eventId?: string) {
  return db.query.connections.findFirst({
    where: and(
      or(
        and(
          eq(connections.fromWallet, fromWallet),
          eq(connections.toWallet, toWallet)
        ),
        and(
          eq(connections.fromWallet, toWallet),
          eq(connections.toWallet, fromWallet)
        )
      ),
      eventId ? eq(connections.eventId, eventId) : isNull(connections.eventId)
    ),
  });
}

export async function validateConnectionRequest(fromWallet: string, toWallet: string, eventId?: string) {
  if (fromWallet === toWallet) {
    throw new DatabaseError('Cannot send connection request to yourself', 400);
  }

  // Check for existing connection or pending request
  const existingConnection = await findConnection(fromWallet, toWallet, eventId);
  
  if (existingConnection) {
    if (existingConnection.status === 'blocked') {
      throw new DatabaseError('You cannot send a connection request to this user', 403);
    }
    if (existingConnection.status && ['pending', 'accepted'].includes(existingConnection.status)) {
      throw new DatabaseError('A connection request already exists', 400);
    }
    if (existingConnection.status === 'rejected' && existingConnection.updatedAt) {
      const cooldownEnd = existingConnection.updatedAt.getTime() + (30 * 24 * 60 * 60 * 1000);
      if (Date.now() < cooldownEnd) {
        const daysLeft = Math.ceil((cooldownEnd - Date.now()) / (1000 * 60 * 60 * 24));
        throw new DatabaseError(`You cannot send another request for ${daysLeft} more days`, 429);
      }
    }
  }

  // Check if the other user has blocked you
  const isBlocked = await db.query.connections.findFirst({
    where: and(
      eq(connections.fromWallet, toWallet),
      eq(connections.toWallet, fromWallet),
      eq(connections.status, 'blocked')
    ),
  });

  if (isBlocked) {
    throw new DatabaseError('You cannot send a connection request to this user', 403);
  }

  return true;
}
