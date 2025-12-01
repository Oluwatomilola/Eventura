import { Resend } from 'resend';
import * as React from 'react';
import { ConnectionRequestEmail } from '@/emails/connection-request';
import { ConnectionAcceptedEmail } from '@/emails/connection-accepted';
import { NewMessageEmail } from '@/emails/new-message';
import { EventReminderEmail } from '@/emails/event-reminder';
import { WaitlistAvailableEmail } from '@/emails/waitlist-available';
import { EventCancelledEmail } from '@/emails/event-cancelled';
import { EventAnnouncementEmail } from '@/emails/event-announcement';
import { WaitlistAvailableEmail } from '@/emails/waitlist-available';
import { WelcomeEmail } from '@/emails/welcome';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailTemplate = {
  subject: string;
  react: React.ReactElement;
};

export async function sendEmail(to: string, template: EmailTemplate) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, email not sent');
    return { error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Eventura <notifications@eventura.xyz>',
      to,
      ...template,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { error };
  }
}

export const emailTemplates = {
  connectionRequest: (fromName: string, eventName: string, message?: string) => ({
    subject: `[Eventura] ${fromName} wants to connect with you${eventName ? ` at ${eventName}` : ''}`,
    react: <ConnectionRequestEmail fromName={fromName} eventName={eventName} message={message} />,
  }),
  
  connectionAccepted: (fromName: string) => ({
    subject: `[Eventura] ${fromName} accepted your connection request!`,
    react: <ConnectionAcceptedEmail fromName={fromName} />,
  }),
  
  newMessage: (fromName: string, messagePreview: string) => ({
    subject: `[Eventura] New message from ${fromName}`,
    react: <NewMessageEmail fromName={fromName} messagePreview={messagePreview} />,
  }),
  
  eventReminder: (eventName: string, timeUntil: string) => ({
    subject: `[Eventura] ${eventName} starts ${timeUntil}`,
    react: <EventReminderEmail eventName={eventName} timeUntil={timeUntil} />,
  }),
  
  waitlistAvailable: (eventName: string) => ({
    subject: `[Eventura] A ticket is now available for ${eventName}!`,
    react: <WaitlistAvailableEmail eventName={eventName} />,
  }),
  
  eventCancelled: (eventName: string) => ({
    subject: `[Eventura] ${eventName} has been cancelled`,
    react: <EventCancelledEmail eventName={eventName} />,
  }),
  
  eventAnnouncement: (eventName: string, title: string, message: string, eventId?: string) => ({
    subject: `[Eventura] ${eventName}: ${title}`,
    react: <EventAnnouncementEmail eventName={eventName} title={title} message={message} eventId={eventId} />,
  }),
  
  welcome: (userName: string) => ({
    subject: 'Welcome to Eventura - Let\'s get started!',
    react: <WelcomeEmail userName={userName} />,
  }),
};
