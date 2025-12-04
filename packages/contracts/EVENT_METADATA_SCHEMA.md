# Event Metadata Schema for Multi-Language Support

This document defines the IPFS metadata structure for events with multi-language support.

## Schema Structure

The metadata JSON stored on IPFS should follow this structure:

```json
{
  "version": "1.0",
  "defaultLanguage": "en",
  "translations": {
    "en": {
      "name": "Summer Music Festival 2025",
      "description": "Join us for the biggest music festival of the summer featuring top artists from around the world.",
      "location": "Central Park, New York",
      "venue": "Main Stage Area",
      "category": "Music & Concerts",
      "tags": ["music", "festival", "outdoor", "summer"]
    },
    "es": {
      "name": "Festival de Música de Verano 2025",
      "description": "Únete a nosotros para el festival de música más grande del verano con los mejores artistas de todo el mundo.",
      "location": "Central Park, Nueva York",
      "venue": "Área del Escenario Principal",
      "category": "Música y Conciertos",
      "tags": ["música", "festival", "aire libre", "verano"]
    },
    "fr": {
      "name": "Festival de Musique d'Été 2025",
      "description": "Rejoignez-nous pour le plus grand festival de musique de l'été avec les meilleurs artistes du monde entier.",
      "location": "Central Park, New York",
      "venue": "Zone de la Scène Principale",
      "category": "Musique et Concerts",
      "tags": ["musique", "festival", "plein air", "été"]
    },
    "de": {
      "name": "Sommermusikfestival 2025",
      "description": "Begleiten Sie uns zum größten Musikfestival des Sommers mit Top-Künstlern aus der ganzen Welt.",
      "location": "Central Park, New York",
      "venue": "Hauptbühnenbereich",
      "category": "Musik & Konzerte",
      "tags": ["musik", "festival", "draußen", "sommer"]
    },
    "ja": {
      "name": "サマーミュージックフェスティバル2025",
      "description": "世界中のトップアーティストが出演する夏最大の音楽フェスティバルにご参加ください。",
      "location": "セントラルパーク、ニューヨーク",
      "venue": "メインステージエリア",
      "category": "音楽・コンサート",
      "tags": ["音楽", "フェスティバル", "アウトドア", "夏"]
    },
    "zh": {
      "name": "2025夏季音乐节",
      "description": "加入我们，参加夏季最大的音乐节，汇聚世界各地的顶级艺术家。",
      "location": "中央公园，纽约",
      "venue": "主舞台区",
      "category": "音乐与演唱会",
      "tags": ["音乐", "节日", "户外", "夏天"]
    },
    "ar": {
      "name": "مهرجان الموسيقى الصيفي 2025",
      "description": "انضم إلينا في أكبر مهرجان موسيقي صيفي يضم أفضل الفنانين من جميع أنحاء العالم.",
      "location": "سنترال بارك، نيويورك",
      "venue": "منطقة المسرح الرئيسي",
      "category": "الموسيقى والحفلات الموسيقية",
      "tags": ["موسيقى", "مهرجان", "في الهواء الطلق", "صيف"]
    },
    "pt": {
      "name": "Festival de Música de Verão 2025",
      "description": "Junte-se a nós para o maior festival de música do verão com os melhores artistas de todo o mundo.",
      "location": "Central Park, Nova York",
      "venue": "Área do Palco Principal",
      "category": "Música e Concertos",
      "tags": ["música", "festival", "ao ar livre", "verão"]
    }
  },
  "media": {
    "coverImage": "ipfs://QmExample123.../cover.jpg",
    "bannerImage": "ipfs://QmExample123.../banner.jpg",
    "gallery": [
      "ipfs://QmExample123.../image1.jpg",
      "ipfs://QmExample123.../image2.jpg"
    ]
  },
  "organizer": {
    "name": "Global Events Co.",
    "website": "https://globalevents.com",
    "social": {
      "twitter": "@globalevents",
      "discord": "https://discord.gg/globalevents"
    }
  }
}
```

## Language Codes (ISO 639-1)

- `en` - English (default)
- `es` - Spanish
- `fr` - French
- `de` - German
- `ja` - Japanese
- `zh` - Chinese
- `ar` - Arabic
- `pt` - Portuguese

## Translation Fields

Each language translation must include:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Event name/title |
| `description` | string | Yes | Full event description |
| `location` | string | Yes | Event location |
| `venue` | string | Yes | Specific venue name |
| `category` | string | Yes | Event category |
| `tags` | string[] | No | Search tags in that language |

## Frontend Implementation

### Fallback Logic

1. Try to load user's preferred language
2. If translation doesn't exist, fall back to `defaultLanguage` (usually `en`)
3. If default language also doesn't exist, show first available translation

### Example Usage

```typescript
interface EventMetadata {
  version: string;
  defaultLanguage: string;
  translations: Record<string, EventTranslation>;
  media: EventMedia;
  organizer: EventOrganizer;
}

interface EventTranslation {
  name: string;
  description: string;
  location: string;
  venue: string;
  category: string;
  tags?: string[];
}

function getTranslation(
  metadata: EventMetadata,
  preferredLanguage: string
): EventTranslation {
  // Try preferred language
  if (metadata.translations[preferredLanguage]) {
    return metadata.translations[preferredLanguage];
  }

  // Fall back to default
  if (metadata.translations[metadata.defaultLanguage]) {
    return metadata.translations[metadata.defaultLanguage];
  }

  // Fall back to first available
  const firstLang = Object.keys(metadata.translations)[0];
  return metadata.translations[firstLang];
}
```

## IPFS Upload Example

```typescript
import { create as ipfsHttpClient } from 'ipfs-http-client';

const client = ipfsHttpClient({ url: 'https://ipfs.infura.io:5001' });

async function uploadEventMetadata(metadata: EventMetadata): Promise<string> {
  const { cid } = await client.add(JSON.stringify(metadata));
  return `ipfs://${cid}`;
}
```

## RTL Language Support

For RTL languages (Arabic, Hebrew):
- Set `dir="rtl"` on container elements
- Use CSS logical properties (`margin-inline-start` instead of `margin-left`)
- Mirror UI elements appropriately

## Validation

Ensure all translations include required fields:
- `name` (max 200 characters)
- `description` (max 5000 characters)
- `location` (max 200 characters)
- `venue` (max 200 characters)
- `category` (max 100 characters)
