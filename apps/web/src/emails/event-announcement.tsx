import * as React from 'react';
import { EmailLayout } from './components/email-layout';
import { Button, Text } from '@react-email/components';

interface EventAnnouncementEmailProps {
  eventName: string;
  title: string;
  message: string;
  eventId?: string;
}

export function EventAnnouncementEmail({ 
  eventName, 
  title, 
  message,
  eventId 
}: EventAnnouncementEmailProps) {
  const eventUrl = eventId ? `https://eventura.xyz/events/${eventId}` : 'https://eventura.xyz';

  return (
    <EmailLayout>
      <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        📢 {title}
      </Text>
      
      <Text style={{ marginBottom: '16px', fontSize: '18px', color: '#6b7280' }}>
        From: <strong>{eventName}</strong>
      </Text>
      
      <div style={{ 
        backgroundColor: '#f8fafc',
        borderLeft: '4px solid #06b6d4',
        padding: '16px',
        margin: '16px 0',
      }}>
        <Text style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
          {message}
        </Text>
      </div>
      
      <div style={{ margin: '24px 0' }}>
        <Button
          href={eventUrl}
          style={{
            backgroundColor: '#06b6d4',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: '600',
          }}
        >
          View Event
        </Button>
      </div>
      
      <Text style={{ color: '#6b7280', fontSize: '14px', marginTop: '24px' }}>
        You're receiving this because you have a ticket for this event.
      </Text>
    </EmailLayout>
  );
}

