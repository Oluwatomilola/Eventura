/**
 * Multi-language event types for IPFS metadata
 * Supports internationalization of event information
 */

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ar' | 'pt';

export interface EventTranslation {
  name: string;
  description: string;
  location: string;
  venue: string;
  category: string;
  tags?: string[];
}

export interface EventMedia {
  coverImage?: string;
  bannerImage?: string;
  gallery?: string[];
}

export interface EventOrganizer {
  name: string;
  website?: string;
  social?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
}

export interface EventMetadata {
  version: string;
  defaultLanguage: LanguageCode;
  translations: Partial<Record<LanguageCode, EventTranslation>>;
  media?: EventMedia;
  organizer?: EventOrganizer;
}

export interface Event {
  id: bigint;
  organizer: string;
  metadataURI: string;
  startTime: bigint;
  endTime: bigint;
  ticketPrice: bigint;
  maxTickets: bigint;
  ticketsSold: bigint;
  active: boolean;
  createdAt: bigint;
}

export interface EventWithMetadata extends Event {
  metadata: EventMetadata;
}

export const SUPPORTED_LANGUAGES: Record<LanguageCode, { name: string; nativeName: string; rtl: boolean }> = {
  en: { name: 'English', nativeName: 'English', rtl: false },
  es: { name: 'Spanish', nativeName: 'Español', rtl: false },
  fr: { name: 'French', nativeName: 'Français', rtl: false },
  de: { name: 'German', nativeName: 'Deutsch', rtl: false },
  ja: { name: 'Japanese', nativeName: '日本語', rtl: false },
  zh: { name: 'Chinese', nativeName: '中文', rtl: false },
  ar: { name: 'Arabic', nativeName: 'العربية', rtl: true },
  pt: { name: 'Portuguese', nativeName: 'Português', rtl: false },
};
