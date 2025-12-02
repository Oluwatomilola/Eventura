import { ethers } from 'ethers';
import * as DOMPurify from 'isomorphic-dompurify';

export class InputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InputValidationError';
  }
}

export function validateWalletAddress(address: string): string {
  if (!ethers.isAddress(address)) {
    throw new InputValidationError('Invalid wallet address');
  }
  return ethers.getAddress(address); // Convert to checksum address
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

export function sanitizeText(text: string): string {
  // Remove any HTML tags and trim whitespace
  return text.replace(/<[^>]*>?/gm, '').trim();
}

export function validateEventId(eventId: string): string {
  // Basic validation for event ID (adjust according to your ID format)
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(eventId)) {
    throw new InputValidationError('Invalid event ID format');
  }
  return eventId;
}

export function validateDisplayName(displayName: string): string {
  const sanitized = sanitizeText(displayName).trim();
  if (sanitized.length < 2 || sanitized.length > 50) {
    throw new InputValidationError('Display name must be between 2 and 50 characters');
  }
  return sanitized;
}

export function validateBio(bio: string | null): string | null {
  if (!bio) return null;
  const sanitized = sanitizeText(bio).trim();
  if (sanitized.length > 500) {
    throw new InputValidationError('Bio cannot exceed 500 characters');
  }
  return sanitized;
}

export function validateInterests(interests: string[]): string[] {
  if (!Array.isArray(interests)) {
    throw new InputValidationError('Interests must be an array');
  }

  return interests.map(interest => {
    const sanitized = sanitizeText(interest).trim();
    if (sanitized.length < 2 || sanitized.length > 50) {
      throw new InputValidationError('Each interest must be between 2 and 50 characters');
    }
    return sanitized;
  });
}

export function validateVisibility(visibility: string): 'public' | 'attendees' | 'connections' | 'private' {
  if (!['public', 'attendees', 'connections', 'private'].includes(visibility)) {
    throw new InputValidationError('Invalid visibility setting');
  }
  return visibility as any;
}

export function validateMessageContent(content: string): string {
  const sanitized = sanitizeText(content).trim();
  if (sanitized.length === 0 || sanitized.length > 2000) {
    throw new InputValidationError('Message must be between 1 and 2000 characters');
  }
  return sanitized;
}
