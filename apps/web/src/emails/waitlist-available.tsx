import * as React from 'react';
import { EmailLayout } from './components/email-layout';
import { Button, Text } from '@react-email/components';

interface WaitlistAvailableEmailProps {
  eventName: string;
  eventId?: string;
}

export function WaitlistAvailableEmail({ eventName, eventId }: WaitlistAvailableEmailProps) {
  const eventUrl = eventId ? `https://eventura.xyz/events/${eventId}` : 'https://eventura.xyz';

  return (
    <EmailLayout>
      <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#10b981' }}>
        🎟️ Ticket Available: {eventName}
      </Text>
      
      <Text style={{ marginBottom: '16px' }}>
        Great news! A ticket for <strong>{eventName}</strong> is now available.
      </Text>
      
      <div style={{ 
        backgroundColor: '#f0fdf4',
        borderLeft: '4px solid #10b981',
        padding: '16px',
        margin: '16px 0',
      }}>
        <Text style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Act fast!</Text>
        <Text style={{ margin: '4px 0' }}>
          Tickets are limited and available on a first-come, first-served basis.
        </Text>
        <Text style={{ margin: '4px 0 0 0' }}>
          This ticket may be claimed by someone else if you don't act quickly.
        </Text>
      </div>
      
      <div style={{ margin: '24px 0' }}>
        <Button
          href={eventUrl}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: '600',
          }}
        >
          Claim Ticket Now
        </Button>
      </div>
      
      <Text style={{ color: '#6b7280', fontSize: '14px', marginTop: '24px' }}>
        This opportunity is available for a limited time. Don't miss out!
      </Text>
    </EmailLayout>
  );
}

