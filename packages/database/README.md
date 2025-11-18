# Eventura Database Package

Database schema and utilities for Eventura's social connection features.

## Quick Start

### 1. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run `schema.sql` in the SQL Editor
3. Get your API credentials from Settings > API
4. Add credentials to `.env.local` (see `.env.example`)

### 2. Use in your code

```typescript
// Client-side (in components)
import { createClient } from '@/lib/supabase'

const supabase = createClient()
const { data } = await supabase.from('users').select('*')

// Server-side (in API routes)
import { createServerClient } from '@/lib/supabase'

const supabase = createServerClient()
const { data } = await supabase.from('users').select('*')
```

## Files

- `schema.sql` - Complete database schema with RLS policies
- `SCHEMA.md` - Comprehensive schema documentation
- `README.md` - This file

## Documentation

See [SCHEMA.md](./SCHEMA.md) for complete documentation including:
- Table descriptions
- Usage examples
- Row Level Security policies
- Real-time subscriptions
- Performance tips
- Troubleshooting

## Support

For issues related to the database schema, please open an issue on GitHub.
