# Eventura Database Schema Documentation

This document describes the database schema for Eventura's social connection features.

## Overview

Eventura uses **Supabase** (PostgreSQL) to store user profiles, event personas, connections, messages, and notifications. This enables the core social features that differentiate Eventura from traditional event platforms.

## Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project name (e.g., "eventura")
5. Enter a strong database password
6. Choose a region (closest to your users)
7. Click "Create new project"

### 2. Run the Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `schema.sql`
3. Paste into the SQL Editor
4. Click "Run" to execute the schema
5. Verify all tables were created (check the Table Editor)

### 3. Configure Environment Variables

1. In Supabase dashboard, go to Settings > API
2. Copy your **Project URL** (e.g., `https://abcdefghij.supabase.co`)
3. Copy your **anon/public key** (starts with `eyJ...`)
4. Copy your **service_role key** (starts with `eyJ...`) - **Keep this secret!**
5. Add to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**: Never commit `SUPABASE_SERVICE_KEY` to git. It bypasses Row Level Security!

## Database Tables

### 1. `users`

Stores global user profile information.

| Column | Type | Description |
|--------|------|-------------|
| `wallet_address` | TEXT (PK) | User's wallet address (0x...) |
| `display_name` | TEXT | User's display name |
| `global_bio` | TEXT | User's bio (used as default for personas) |
| `avatar_ipfs_hash` | TEXT | IPFS hash of user's avatar image |
| `joined_at` | TIMESTAMP | When user created their profile |
| `updated_at` | TIMESTAMP | When profile was last updated |

**Indexes**:
- `idx_users_joined_at` on `joined_at DESC`

**Example**:
```sql
INSERT INTO users (wallet_address, display_name, global_bio, avatar_ipfs_hash)
VALUES (
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  'Alice Chen',
  'Full-stack developer passionate about Web3',
  'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX'
);
```

### 2. `event_personas`

**CORE DIFFERENTIATOR**: Event-specific personas allow users to present different versions of themselves for different events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique persona ID |
| `wallet_address` | TEXT (FK) | User who owns this persona |
| `event_id` | BIGINT | Event this persona is for (from blockchain) |
| `display_name` | TEXT | Display name for this event (can differ from global) |
| `bio` | TEXT | Bio tailored to this event |
| `interests` | TEXT[] | Array of interest tags (e.g., ["Solidity", "DeFi"]) |
| `looking_for` | TEXT[] | Array of what user is looking for (e.g., ["Co-founder", "Mentorship"]) |
| `visibility` | TEXT | Who can see this persona: `public`, `attendees`, `connections`, `private` |
| `created_at` | TIMESTAMP | When persona was created |
| `updated_at` | TIMESTAMP | When persona was last updated |

**Constraints**:
- `UNIQUE(wallet_address, event_id)` - One persona per user per event

**Indexes**:
- `idx_personas_event` on `event_id`
- `idx_personas_wallet` on `wallet_address`
- `idx_personas_visibility` on `visibility`
- `idx_personas_created_at` on `created_at DESC`
- `idx_personas_interests` GIN index on `interests` (for array searches)
- `idx_personas_looking_for` GIN index on `looking_for` (for array searches)

**Example**:
```sql
INSERT INTO event_personas (wallet_address, event_id, display_name, bio, interests, looking_for, visibility)
VALUES (
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  12345,
  'Alice Chen',
  'Senior Solidity dev looking to connect with other builders in the DeFi space',
  ARRAY['Solidity', 'DeFi', 'Smart Contract Security'],
  ARRAY['Co-founder', 'Technical Co-founder', 'Networking'],
  'attendees'
);
```

### 3. `connections`

Stores connection requests and accepted connections between users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique connection ID |
| `from_wallet` | TEXT (FK) | User who sent the connection request |
| `to_wallet` | TEXT (FK) | User who received the connection request |
| `event_id` | BIGINT | Event where they're connecting |
| `status` | TEXT | `pending`, `accepted`, `rejected`, `blocked`, `removed` |
| `message` | TEXT | Optional message with connection request |
| `is_global` | BOOLEAN | Whether connection extends beyond the event |
| `created_at` | TIMESTAMP | When connection request was sent |
| `updated_at` | TIMESTAMP | When connection status last changed |

**Constraints**:
- `UNIQUE(from_wallet, to_wallet, event_id)` - Prevent duplicate requests

**Indexes**:
- `idx_connections_from` on `from_wallet`
- `idx_connections_to` on `to_wallet`
- `idx_connections_event` on `event_id`
- `idx_connections_status` on `status`
- `idx_connections_created_at` on `created_at DESC`
- `idx_connections_user_event` on `(from_wallet, event_id, status)`
- `idx_connections_recipient_event` on `(to_wallet, event_id, status)`

**Example**:
```sql
INSERT INTO connections (from_wallet, to_wallet, event_id, message, status)
VALUES (
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
  12345,
  'Hi! I saw we both are interested in DeFi. Would love to connect at the conference!',
  'pending'
);
```

### 4. `messages`

Stores direct messages between connected users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique message ID |
| `from_wallet` | TEXT (FK) | User who sent the message |
| `to_wallet` | TEXT (FK) | User who received the message |
| `event_id` | BIGINT | Event context (NULL for global connections) |
| `content` | TEXT | Message content (max 2000 chars) |
| `read_at` | TIMESTAMP | When message was read (NULL if unread) |
| `created_at` | TIMESTAMP | When message was sent |

**Constraints**:
- `message_not_empty` CHECK constraint (length > 0)
- `message_length` CHECK constraint (length <= 2000)

**Indexes**:
- `idx_messages_from` on `from_wallet`
- `idx_messages_to` on `to_wallet`
- `idx_messages_event` on `event_id`
- `idx_messages_created_at` on `created_at DESC`
- `idx_messages_read_at` on `read_at WHERE read_at IS NULL`
- `idx_messages_conversation` on `(from_wallet, to_wallet, created_at DESC)`

**Example**:
```sql
INSERT INTO messages (from_wallet, to_wallet, event_id, content)
VALUES (
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
  12345,
  'Looking forward to meeting you at the conference!'
);
```

### 5. `notifications`

Stores in-app notifications for users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique notification ID |
| `user_wallet` | TEXT (FK) | User who receives this notification |
| `type` | TEXT | Notification type (see below) |
| `title` | TEXT | Notification title |
| `message` | TEXT | Notification message |
| `link` | TEXT | Link to relevant page (e.g., `/dashboard/connections`) |
| `metadata` | JSONB | Additional data (e.g., sender wallet, event ID) |
| `read_at` | TIMESTAMP | When notification was read (NULL if unread) |
| `created_at` | TIMESTAMP | When notification was created |

**Notification Types**:
- `connection_request` - Someone wants to connect
- `connection_accepted` - Connection request was accepted
- `connection_rejected` - Connection request was rejected
- `new_message` - New message received
- `event_reminder` - Event is starting soon
- `waitlist_available` - Ticket available from waitlist
- `event_cancelled` - Event was cancelled
- `system` - System notifications

**Indexes**:
- `idx_notifications_user` on `user_wallet`
- `idx_notifications_type` on `type`
- `idx_notifications_read_at` on `read_at WHERE read_at IS NULL`
- `idx_notifications_created_at` on `created_at DESC`
- `idx_notifications_user_unread` on `(user_wallet, created_at DESC) WHERE read_at IS NULL`

**Example**:
```sql
INSERT INTO notifications (user_wallet, type, title, message, link, metadata)
VALUES (
  '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
  'connection_request',
  'New connection request',
  'Alice Chen wants to connect with you at ETH Global',
  '/dashboard/connections',
  '{"from_wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "event_id": 12345}'::jsonb
);
```

## Database Views

### `active_connections`

Shows only accepted connections.

```sql
SELECT * FROM active_connections
WHERE from_wallet = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
```

### `unread_messages_count`

Shows unread message count per user.

```sql
SELECT * FROM unread_messages_count
WHERE user_wallet = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
```

### `unread_notifications_count`

Shows unread notification count per user.

```sql
SELECT * FROM unread_notifications_count
WHERE user_wallet = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
```

## Row Level Security (RLS)

All tables have Row Level Security enabled to ensure users can only access their own data.

### Users Table

- **View**: Anyone can view all profiles (for discovery)
- **Insert**: Users can only create their own profile
- **Update**: Users can only update their own profile
- **Delete**: Users can only delete their own profile

### Event Personas Table

- **View**: Based on visibility setting:
  - `public`: Anyone can view
  - `attendees`: Only users with personas for the same event
  - `connections`: Only accepted connections
  - `private`: Only the owner
- **Insert/Update/Delete**: Only the owner

### Connections Table

- **View**: Users can view connections they're part of (sent or received)
- **Insert**: Users can create connection requests
- **Update**: Both parties can update connection status
- **Delete**: Sender can delete their request

### Messages Table

- **View**: Users can view messages they sent or received
- **Insert**: Users can send messages
- **Update**: Recipients can mark as read
- **Delete**: Senders can delete their messages

### Notifications Table

- **View**: Users can only view their own notifications
- **Insert**: Only service role can create (server-side)
- **Update**: Users can mark their notifications as read
- **Delete**: Users can delete their own notifications

## Authentication

Eventura uses **wallet-based authentication**. When a user connects their wallet:

1. User connects wallet (e.g., MetaMask)
2. User signs a message to prove ownership
3. Frontend verifies signature
4. Frontend calls API with wallet address
5. API creates/updates user session
6. Supabase uses wallet address as `auth.uid()`

**Important**: In RLS policies, `auth.uid()::text` is the user's wallet address.

## Usage Examples

### Create a User Profile

```typescript
import { createClient } from '@/lib/supabase'

const supabase = createClient()

const { data, error } = await supabase
  .from('users')
  .insert({
    wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    display_name: 'Alice Chen',
    global_bio: 'Full-stack developer passionate about Web3',
    avatar_ipfs_hash: 'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX'
  })
```

### Create an Event Persona

```typescript
const { data, error } = await supabase
  .from('event_personas')
  .insert({
    wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    event_id: 12345,
    display_name: 'Alice Chen',
    bio: 'Senior Solidity dev looking to connect with other builders',
    interests: ['Solidity', 'DeFi', 'Smart Contract Security'],
    looking_for: ['Co-founder', 'Networking'],
    visibility: 'attendees'
  })
```

### Get Attendees for an Event

```typescript
const { data, error } = await supabase
  .from('event_personas')
  .select('*')
  .eq('event_id', 12345)
  .in('visibility', ['public', 'attendees'])
```

### Send a Connection Request

```typescript
const { data, error } = await supabase
  .from('connections')
  .insert({
    from_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to_wallet: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    event_id: 12345,
    message: 'Hi! Would love to connect at the conference!',
    status: 'pending'
  })
```

### Accept a Connection Request

```typescript
const { data, error } = await supabase
  .from('connections')
  .update({ status: 'accepted' })
  .eq('id', connectionId)
```

### Send a Message

```typescript
const { data, error } = await supabase
  .from('messages')
  .insert({
    from_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to_wallet: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    event_id: 12345,
    content: 'Looking forward to meeting you!'
  })
```

### Get Unread Message Count

```typescript
const { data, error } = await supabase
  .from('unread_messages_count')
  .select('*')
  .eq('user_wallet', walletAddress)
  .single()

console.log(`You have ${data?.unread_count || 0} unread messages`)
```

## Real-Time Subscriptions

Supabase supports real-time updates via WebSockets. This is perfect for messaging and notifications.

### Subscribe to New Messages

```typescript
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `to_wallet=eq.${walletAddress}`
    },
    (payload) => {
      console.log('New message:', payload.new)
      // Update UI with new message
    }
  )
  .subscribe()
```

### Subscribe to New Notifications

```typescript
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_wallet=eq.${walletAddress}`
    },
    (payload) => {
      console.log('New notification:', payload.new)
      // Show toast notification
    }
  )
  .subscribe()
```

## Database Migrations

When you need to update the schema:

1. Make changes to `schema.sql`
2. Create a migration file in `packages/database/migrations/`
3. Name it with timestamp: `YYYYMMDD_description.sql`
4. Run migration in Supabase SQL Editor
5. Commit both `schema.sql` and migration file

Example migration:
```sql
-- Migration: Add email_preferences to users table
-- Date: 2025-01-18

ALTER TABLE users
ADD COLUMN email_preferences JSONB DEFAULT '{
  "connection_requests": true,
  "new_messages": true,
  "event_reminders": true
}'::jsonb;
```

## Backup and Recovery

Supabase provides automatic daily backups. To restore:

1. Go to Supabase Dashboard > Database > Backups
2. Select the backup you want to restore
3. Click "Restore"

**Recommendation**: For production, enable Point-in-Time Recovery (PITR) for granular recovery.

## Performance Tips

1. **Use indexes**: All foreign keys and frequently queried columns are indexed
2. **Use GIN indexes for arrays**: `interests` and `looking_for` use GIN indexes for fast array searches
3. **Limit result sets**: Always use `.limit()` for large queries
4. **Use pagination**: Don't fetch all records at once
5. **Use `.select()` wisely**: Only fetch columns you need
6. **Use views for common queries**: `active_connections`, `unread_messages_count`, etc.

## Troubleshooting

### "Missing Supabase environment variables"

Make sure you've added all three variables to `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`

### "row-level security policy violation"

Check that:
1. User is authenticated (wallet connected)
2. RLS policies allow the operation
3. You're using the correct wallet address

### "relation 'users' does not exist"

Run the `schema.sql` file in your Supabase SQL Editor.

### Slow queries

1. Check query execution plan in Supabase
2. Ensure indexes are being used
3. Add missing indexes if needed
4. Consider using database functions for complex queries

## Security Best Practices

1. **Never expose `SUPABASE_SERVICE_KEY`** - Only use on server-side
2. **Always use RLS** - Never disable Row Level Security
3. **Validate user input** - Both client and server-side
4. **Sanitize content** - Prevent XSS in user bios and messages
5. **Rate limit API calls** - Prevent abuse
6. **Use prepared statements** - Supabase client handles this
7. **Rotate keys regularly** - Especially if compromised

## Support

For questions or issues:
- [Supabase Documentation](https://supabase.com/docs)
- [Eventura GitHub Issues](https://github.com/Imploitchain/Eventura/issues)
- Supabase Dashboard: Settings > Support
