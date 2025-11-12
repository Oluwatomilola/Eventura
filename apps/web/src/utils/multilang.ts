/**
 * Utility functions for multi-language event handling
 */

import type { EventMetadata, EventTranslation, LanguageCode } from '@/types/multilang-event';

/**
 * Get translation for preferred language with fallback logic
 * 1. Try preferred language
 * 2. Fall back to default language
 * 3. Fall back to first available translation
 */
export function getTranslation(
  metadata: EventMetadata,
  preferredLanguage: LanguageCode
): EventTranslation {
  // Try preferred language
  if (metadata.translations[preferredLanguage]) {
    return metadata.translations[preferredLanguage]!;
  }

  // Fall back to default language
  if (metadata.translations[metadata.defaultLanguage]) {
    return metadata.translations[metadata.defaultLanguage]!;
  }

  // Fall back to first available translation
  const firstLang = Object.keys(metadata.translations)[0] as LanguageCode;
  return metadata.translations[firstLang]!;
}

/**
 * Get available languages for an event
 */
export function getAvailableLanguages(metadata: EventMetadata): LanguageCode[] {
  return Object.keys(metadata.translations) as LanguageCode[];
}

/**
 * Check if a specific language is available
 */
export function isLanguageAvailable(
  metadata: EventMetadata,
  language: LanguageCode
): boolean {
  return !!metadata.translations[language];
}

/**
 * Fetch and parse event metadata from IPFS
 */
export async function fetchEventMetadata(metadataURI: string): Promise<EventMetadata> {
  try {
    // Convert ipfs:// to HTTP gateway URL
    const url = metadataURI.replace('ipfs://', 'https://ipfs.io/ipfs/');

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }

    const metadata: EventMetadata = await response.json();

    // Validate metadata structure
    if (!metadata.version || !metadata.defaultLanguage || !metadata.translations) {
      throw new Error('Invalid metadata structure');
    }

    return metadata;
  } catch (error) {
    console.error('Error fetching event metadata:', error);
    throw error;
  }
}

/**
 * Detect user's preferred language from browser
 */
export function detectUserLanguage(): LanguageCode {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages: LanguageCode[] = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ar', 'pt'];

  if (supportedLanguages.includes(browserLang as LanguageCode)) {
    return browserLang as LanguageCode;
  }

  return 'en'; // Default fallback
}

/**
 * Format date based on language locale
 */
export function formatEventDate(
  timestamp: bigint,
  language: LanguageCode
): string {
  const date = new Date(Number(timestamp) * 1000);

  const localeMap: Record<LanguageCode, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ja: 'ja-JP',
    zh: 'zh-CN',
    ar: 'ar-SA',
    pt: 'pt-PT',
  };

  return new Intl.DateTimeFormat(localeMap[language], {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
}

/**
 * Format price based on language locale
 */
export function formatPrice(
  priceInWei: bigint,
  language: LanguageCode
): string {
  const priceInEth = Number(priceInWei) / 1e18;

  return `${priceInEth.toFixed(4)} ETH`;
}

/**
 * Get text direction for language (LTR or RTL)
 */
export function getTextDirection(language: LanguageCode): 'ltr' | 'rtl' {
  return language === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Create example metadata for testing
 */
export function createExampleMetadata(): EventMetadata {
  return {
    version: '1.0',
    defaultLanguage: 'en',
    translations: {
      en: {
        name: 'Base Builder Summit 2025',
        description: 'Join the largest gathering of Base builders, creators, and innovators. Learn about the latest developments in Base L2, connect with the community, and shape the future of decentralized applications.',
        location: 'San Francisco, CA',
        venue: 'Moscone Center',
        category: 'Technology & Conference',
        tags: ['blockchain', 'base', 'web3', 'ethereum', 'l2'],
      },
      es: {
        name: 'Cumbre de Constructores de Base 2025',
        description: 'Únete a la reunión más grande de constructores, creadores e innovadores de Base. Aprende sobre los últimos desarrollos en Base L2, conecta con la comunidad y da forma al futuro de las aplicaciones descentralizadas.',
        location: 'San Francisco, CA',
        venue: 'Centro Moscone',
        category: 'Tecnología y Conferencia',
        tags: ['blockchain', 'base', 'web3', 'ethereum', 'l2'],
      },
      fr: {
        name: 'Sommet des Constructeurs Base 2025',
        description: 'Rejoignez le plus grand rassemblement de constructeurs, créateurs et innovateurs Base. Découvrez les derniers développements de Base L2, connectez-vous avec la communauté et façonnez l\'avenir des applications décentralisées.',
        location: 'San Francisco, CA',
        venue: 'Centre Moscone',
        category: 'Technologie et Conférence',
        tags: ['blockchain', 'base', 'web3', 'ethereum', 'l2'],
      },
    },
    media: {
      coverImage: 'ipfs://example/cover.jpg',
      bannerImage: 'ipfs://example/banner.jpg',
    },
    organizer: {
      name: 'Base Foundation',
      website: 'https://base.org',
      social: {
        twitter: '@base',
        discord: 'https://discord.gg/base',
      },
    },
  };
}
