import * as React from 'react';
import { EmailLayout } from './components/email-layout';
import { Button, Text } from '@react-email/components';

interface EventCancelledEmailProps {
  eventName: string;
  eventId?: string;
}

export function EventCancelledEmail({ eventName, eventId }: EventCancelledEmailProps) {
  const eventUrl = eventId ? `https://eventura.xyz/events/${eventId}` : 'https://eventura.xyz';

  return (
    <EmailLayout>
      <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#dc2626' }}>
        ❌ Event Cancelled: {eventName}
      </Text>
      
      <Text style={{ marginBottom: '16px' }}>
        We're sorry to inform you that <strong>{eventName}</strong> has been cancelled by the organizer.
      </Text>
      
      <div style={{ 
        backgroundColor: '#fef2f2',
        borderLeft: '4px solid #dc2626',
        padding: '16px',
        margin: '16px 0',
      }}>
        <Text style={{ margin: '0 0 8px 0', fontWeight: '600' }}>What happens next:</Text>
        <Text style={{ margin: '4px 0' }}>✅ You will receive a full refund automatically</Text>
        <Text style={{ margin: '4px 0' }}>💰 Refunds will be processed within 5-7 business days</Text>
        <Text style={{ margin: '4px 0 0 0' }}>📧 You'll receive a confirmation email once the refund is processed</Text>
      </div>
      
      <div style={{ margin: '24px 0' }}>
        <Button
          href={eventUrl}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: '600',
          }}
        >
          View Event Details
        </Button>
      </div>
      
      <Text style={{ color: '#6b7280', fontSize: '14px', marginTop: '24px' }}>
        If you have any questions, please contact the event organizer or our support team.
      </Text>
    </EmailLayout>
  );
}

