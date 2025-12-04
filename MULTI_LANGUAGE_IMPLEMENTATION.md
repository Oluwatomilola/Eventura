# Multi-Language Event Support Implementation

This document describes the implementation of multi-language support for events in the Eventura platform, addressing GitHub Issue #10.

## Overview

This implementation enables event creators to provide event information in multiple languages for international audiences, leveraging Base blockchain and IPFS for decentralized storage.

## Architecture

### Smart Contract Layer

**File:** `packages/contracts/contracts/EventFactory.sol`

The `EventFactory` contract stores minimal on-chain data and references IPFS metadata URIs containing multi-language content.

**Key Features:**
- Events store only IPFS URI on-chain (gas-optimized)
- Role-based access control (ORGANIZER_ROLE)
- Event lifecycle management (create, update metadata, toggle status)
- Ticket tracking integration

**Key Functions:**
```solidity
createEvent(metadataURI, startTime, endTime, ticketPrice, maxTickets)
updateEventMetadata(eventId, newMetadataURI)
getEvent(eventId)
```

### Metadata Layer

**File:** `packages/contracts/EVENT_METADATA_SCHEMA.md`

IPFS metadata follows a structured JSON schema:
```json
{
  "version": "1.0",
  "defaultLanguage": "en",
  "translations": {
    "en": { "name": "...", "description": "...", ... },
    "es": { "name": "...", "description": "...", ... }
  },
  "media": { ... },
  "organizer": { ... }
}
```

**Supported Languages:**
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Japanese (ja)
- Chinese (zh)
- Arabic (ar) - with RTL support
- Portuguese (pt)

### Frontend Layer

#### Type Definitions
**File:** `apps/web/src/types/multilang-event.ts`

Defines TypeScript interfaces for:
- `EventMetadata` - IPFS metadata structure
- `EventTranslation` - Language-specific content
- `Event` - On-chain event data
- `EventWithMetadata` - Combined event data with metadata

#### Utility Functions
**File:** `apps/web/src/utils/multilang.ts`

**Key Functions:**
- `getTranslation()` - Get translation with fallback logic
- `fetchEventMetadata()` - Fetch and parse IPFS metadata
- `detectUserLanguage()` - Detect browser language
- `formatEventDate()` - Locale-aware date formatting
- `getTextDirection()` - LTR/RTL support
- `createExampleMetadata()` - Testing utility

#### React Components

**LanguageSelector** (`apps/web/src/components/LanguageSelector.tsx`)
- Dropdown language switcher with animated menu
- Shows native language names
- Compact mobile version available
- Supports RTL languages

**MultiLangEventCard** (`apps/web/src/components/MultiLangEventCard.tsx`)
- Full event card with language switching
- Auto-detects available languages
- Displays translated content
- RTL support built-in
- Shows available languages indicator

## Integration with Base & REOWN

### Base Blockchain
- Contract deployed on Base L2 for low gas costs
- Event data stored on-chain
- IPFS for off-chain metadata (cost-effective)

### REOWN (WalletConnect)
- Users connect wallets via REOWN
- Create events (requires ORGANIZER_ROLE)
- Update event metadata
- Purchase tickets (future integration)

## Usage Examples

### 1. Creating a Multi-Language Event

```typescript
import { createExampleMetadata } from '@/utils/multilang';
import { EventFactory } from './contracts';

// 1. Prepare metadata
const metadata = {
  version: '1.0',
  defaultLanguage: 'en',
  translations: {
    en: {
      name: "Base Builder Summit 2025",
      description: "...",
      location: "San Francisco, CA",
      // ...
    },
    es: {
      name: "Cumbre de Constructores de Base 2025",
      // ...
    }
  },
  media: { coverImage: "ipfs://..." },
  organizer: { name: "Base Foundation" }
};

// 2. Upload to IPFS
const metadataURI = await uploadToIPFS(metadata);

// 3. Create event on-chain
const tx = await eventFactory.createEvent(
  metadataURI,
  startTime,
  endTime,
  ticketPrice,
  maxTickets
);
```

### 2. Displaying Multi-Language Events

```tsx
import { MultiLangEventCard } from '@/components/MultiLangEventCard';
import { fetchEventMetadata } from '@/utils/multilang';

function EventList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch events from contract
    const onChainEvents = await eventFactory.getEvents();

    // Fetch metadata for each event
    const eventsWithMetadata = await Promise.all(
      onChainEvents.map(async (event) => ({
        ...event,
        metadata: await fetchEventMetadata(event.metadataURI)
      }))
    );

    setEvents(eventsWithMetadata);
  }, []);

  return (
    <div className="grid gap-6">
      {events.map((event) => (
        <MultiLangEventCard
          key={event.id}
          event={event}
          defaultLanguage="en"
        />
      ))}
    </div>
  );
}
```

### 3. Language Fallback Logic

```typescript
import { getTranslation } from '@/utils/multilang';

// Tries: user language → default language → first available
const translation = getTranslation(metadata, userLanguage);
```

## Gas Optimization

- **On-chain:** Only IPFS URI stored (minimal gas)
- **Off-chain:** Full metadata on IPFS (free storage)
- **Updates:** Only metadata URI update needed (low gas)

## RTL Language Support

For Arabic and other RTL languages:
```tsx
<div dir={getTextDirection(language)}>
  {content}
</div>
```

Components automatically handle RTL layout.

## Testing

### Contract Tests
```bash
cd packages/contracts
npm run test
```

### Frontend Testing
Use `createExampleMetadata()` for testing:
```typescript
const mockEvent = {
  ...onChainData,
  metadata: createExampleMetadata()
};
```

## Future Enhancements

1. **On-chain Language Registry**
   - Store available languages on-chain
   - Emit events for new translations

2. **Community Translations**
   - Allow community to propose translations
   - Voting mechanism for translations

3. **Translation Verification**
   - Verify translation quality
   - Flag inappropriate translations

4. **Search Indexing**
   - Index all language versions
   - Multi-language search support

5. **AI Translation**
   - Auto-translate using AI
   - Human review process

## Files Created/Modified

### Smart Contracts
- ✅ `packages/contracts/contracts/EventFactory.sol` - Main contract
- ✅ `packages/contracts/EVENT_METADATA_SCHEMA.md` - Metadata documentation

### Frontend
- ✅ `apps/web/src/types/multilang-event.ts` - TypeScript types
- ✅ `apps/web/src/utils/multilang.ts` - Utility functions
- ✅ `apps/web/src/components/LanguageSelector.tsx` - Language switcher
- ✅ `apps/web/src/components/MultiLangEventCard.tsx` - Event card component

### Documentation
- ✅ `MULTI_LANGUAGE_IMPLEMENTATION.md` - This file

## Deployment

### Smart Contract Deployment
```bash
cd packages/contracts
npm run compile
npm run deploy:base-sepolia  # Testnet
npm run deploy:base          # Mainnet
```

### Frontend Deployment
Components are ready to use - import and integrate into your pages.

## Contributing

This implementation addresses Issue #10. To contribute:

1. Test the implementation
2. Suggest improvements
3. Add more languages
4. Improve UI/UX
5. Optimize gas costs

## Support

For issues or questions:
- Open GitHub issue
- Tag with `multi-language` label
- Reference Issue #10

---

**Implementation Status:** ✅ Complete
**Compatible with:** Base L2, REOWN/WalletConnect, IPFS
**Gas Optimized:** Yes
**Production Ready:** Yes (pending security audit)
