/**
 * Calendar utilities for event management
 * Supports ICS generation and calendar export
 */

import { format } from 'date-fns';
import type { EventWithMetadata } from '@/types/multilang-event';
import { getTranslation } from './multilang';
import type { LanguageCode } from '@/types/multilang-event';

/**
 * Convert BigInt timestamp to Date
 */
export function timestampToDate(timestamp: bigint): Date {
  return new Date(Number(timestamp) * 1000);
}

export function formatEventDate(timestamp: bigint, language: LanguageCode = 'en'): string {
  const date = timestampToDate(timestamp);
  try {
    return new Intl.DateTimeFormat(language, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return format(date, "EEE, MMM dd, yyyy, HH:mm");
  }
}

/**
 * Generate ICS file content for calendar export
 * Compatible with Google Calendar, Apple Calendar, Outlook
 */
export function generateICSFile(
  event: EventWithMetadata,
  language: LanguageCode = 'en'
): string {
  const translation = getTranslation(event.metadata, language);
  const startDate = timestampToDate(event.startTime);
  const endDate = timestampToDate(event.endTime);

  // Format dates for ICS (YYYYMMDDTHHMMSSZ format)
  const formatICSDate = (date: Date): string => {
    return format(date, "yyyyMMdd'T'HHmmss'Z'");
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eventura//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:eventura-${event.id}@eventura.app`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${translation.name}`,
    `DESCRIPTION:${translation.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${translation.location}, ${translation.venue}`,
    `CATEGORIES:${translation.category}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    // Add alarm 1 day before event
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${translation.name}`,
    'END:VALARM',
    // Add alarm 1 hour before event
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Event starting soon: ${translation.name}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
}

/**
 * Download ICS file
 */
export function downloadICSFile(
  event: EventWithMetadata,
  language: LanguageCode = 'en'
): void {
  const translation = getTranslation(event.metadata, language);
  const icsContent = generateICSFile(event, language);

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${translation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(link.href);
}

/**
 * Generate Google Calendar URL
 */
export function getGoogleCalendarURL(
  event: EventWithMetadata,
  language: LanguageCode = 'en'
): string {
  const translation = getTranslation(event.metadata, language);
  const startDate = timestampToDate(event.startTime);
  const endDate = timestampToDate(event.endTime);

  // Format dates for Google Calendar (YYYYMMDDTHHmmssZ)
  const formatGoogleDate = (date: Date): string => {
    return format(date, "yyyyMMdd'T'HHmmss'Z'");
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: translation.name,
    details: translation.description,
    location: `${translation.location}, ${translation.venue}`,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar URL
 */
export function getOutlookCalendarURL(
  event: EventWithMetadata,
  language: LanguageCode = 'en'
): string {
  const translation = getTranslation(event.metadata, language);
  const startDate = timestampToDate(event.startTime);
  const endDate = timestampToDate(event.endTime);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: translation.name,
    body: translation.description,
    location: `${translation.location}, ${translation.venue}`,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Convert events to calendar format for react-big-calendar
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: EventWithMetadata;
  allDay: boolean;
}

export function eventsToCalendarFormat(
  events: EventWithMetadata[],
  language: LanguageCode = 'en'
): CalendarEvent[] {
  return events.map((event) => {
    const translation = getTranslation(event.metadata, language);

    return {
      id: event.id.toString(),
      title: translation.name,
      start: timestampToDate(event.startTime),
      end: timestampToDate(event.endTime),
      resource: event,
      allDay: false,
    };
  });
}

/**
 * Group events by date
 */
export function groupEventsByDate(
  events: EventWithMetadata[]
): Map<string, EventWithMetadata[]> {
  const grouped = new Map<string, EventWithMetadata[]>();

  events.forEach((event) => {
    const dateKey = format(timestampToDate(event.startTime), 'yyyy-MM-dd');

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }

    grouped.get(dateKey)!.push(event);
  });

  return grouped;
}

/**
 * Filter events by date range
 */
export function filterEventsByDateRange(
  events: EventWithMetadata[],
  startDate: Date,
  endDate: Date
): EventWithMetadata[] {
  return events.filter((event) => {
    const eventStart = timestampToDate(event.startTime);
    return eventStart >= startDate && eventStart <= endDate;
  });
}

/**
 * Get events for a specific month
 */
export function getEventsForMonth(
  events: EventWithMetadata[],
  year: number,
  month: number
): EventWithMetadata[] {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  return filterEventsByDateRange(events, startDate, endDate);
}

/**
 * Check if event is happening today
 */
export function isEventToday(event: EventWithMetadata): boolean {
  const today = format(new Date(), 'yyyy-MM-dd');
  const eventDate = format(timestampToDate(event.startTime), 'yyyy-MM-dd');

  return today === eventDate;
}

/**
 * Check if event is upcoming (within next 7 days)
 */
export function isEventUpcoming(event: EventWithMetadata): boolean {
  const now = new Date();
  const eventDate = timestampToDate(event.startTime);
  const daysDifference = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  return daysDifference >= 0 && daysDifference <= 7;
}

/**
 * Sort events by start time
 */
export function sortEventsByDate(events: EventWithMetadata[]): EventWithMetadata[] {
  return [...events].sort((a, b) => {
    return Number(a.startTime) - Number(b.startTime);
  });
}
