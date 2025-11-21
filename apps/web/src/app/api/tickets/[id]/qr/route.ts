import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import QRCode from 'qrcode';
import { db } from '@/lib/db';

// Generate a signature for the ticket data
function signTicketData(ticketId: string, eventId: string, walletAddress: string) {
  const privateKey = process.env.QR_CODE_SIGNER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('QR_CODE_SIGNER_PRIVATE_KEY is not set');
  }
  
  const message = `${ticketId}:${eventId}:${walletAddress}`;
  const wallet = new ethers.Wallet(privateKey);
  return wallet.signMessage(message);
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get ticket details from database
    const ticket = await db.ticket.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Generate signature for the ticket
    const signature = await signTicketData(
      ticket.id,
      ticket.eventId,
      ticket.ownerAddress
    );

    // Create QR code data
    const qrData = JSON.stringify({
      ticketId: ticket.id,
      eventId: ticket.eventId,
      walletAddress: ticket.ownerAddress,
      signature,
      timestamp: Date.now(),
    });

    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H', // High error correction
      margin: 2,
      scale: 10,
    });

    return NextResponse.json({
      qrCodeUrl,
      ticket: {
        id: ticket.id,
        eventName: ticket.event.title,
        eventDate: ticket.event.startTime,
        ownerAddress: ticket.ownerAddress,
        status: ticket.status,
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
