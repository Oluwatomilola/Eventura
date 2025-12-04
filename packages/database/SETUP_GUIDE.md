# Supabase Setup Guide for Eventura

This guide will walk you through setting up Supabase for Eventura's social features.

## Prerequisites

- A Supabase account (free tier is sufficient for development)
- Access to your Eventura codebase
- Node.js and npm installed

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: eventura (or eventura-dev for development)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free (sufficient for development)
4. Click **"Create new project"**
5. Wait 1-2 minutes for project creation

## Step 2: Run the Database Schema

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `packages/database/schema.sql` in your code editor
4. Copy the **entire contents** of the file
5. Paste into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl/Cmd + Enter)
7. You should see: "Success. No rows returned"

### Verify Schema Creation

1. Click **"Table Editor"** in the left sidebar
2. You should see 5 tables:
   - users
   - event_personas
   - connections
   - messages
   - notifications
3. Click on each table to verify columns are correct

## Step 3: Get Your API Credentials

1. In Supabase dashboard, go to **Settings** (gear icon) > **API**
2. You'll see two important sections:

### Project URL
- Copy the **URL** (e.g., `https://abcdefgh.supabase.co`)
- This is your `NEXT_PUBLIC_SUPABASE_URL`

### API Keys
- **anon/public key**: Copy this (starts with `eyJ...`)
  - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Safe to use in browser
- **service_role key**: Copy this (starts with `eyJ...`)
  - This is your `SUPABASE_SERVICE_KEY`
  - **NEVER expose this publicly!** Server-side only!

## Step 4: Configure Environment Variables

1. In your Eventura project root, create `.env.local` (if it doesn't exist)
2. Add the following:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Replace the values with your actual credentials from Step 3
4. Save the file

**Important**:
- `.env.local` should be in `.gitignore` (already done)
- Never commit `SUPABASE_SERVICE_KEY` to git
- Use different Supabase projects for dev/staging/production

## Step 5: Test the Connection

1. Start your development server:
```bash
npm run dev
```

2. Create a test file to verify connection:

```typescript
// test-supabase.ts
import { createClient } from '@/lib/supabase'

async function testConnection() {
  const supabase = createClient()

  // Test: Fetch from users table
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Success! Connection working.')
    console.log('Data:', data)
  }
}

testConnection()
```

3. If you see "Success! Connection working." - you're all set!

## Step 6: Enable Realtime (Optional but Recommended)

Real-time subscriptions are needed for instant messaging and notifications.

1. In Supabase dashboard, go to **Database** > **Replication**
2. Find the **Realtime** section
3. Enable replication for these tables:
   - ✅ messages
   - ✅ notifications
   - ✅ connections (optional, for live connection updates)
4. Click **Save**

## Common Issues and Solutions

### Issue: "Missing Supabase environment variables"

**Solution**: Make sure all three variables are in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`

Restart your dev server after adding them.

### Issue: "relation 'users' does not exist"

**Solution**: The schema wasn't created. Go back to Step 2 and run `schema.sql`.

### Issue: "row-level security policy violation"

**Solution**:
1. RLS is enabled (this is good!)
2. Make sure you're authenticated (wallet connected)
3. Check that you're using the correct wallet address
4. Verify RLS policies in Supabase: **Authentication** > **Policies**

### Issue: "Failed to fetch"

**Solution**:
1. Check your `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check your internet connection
3. Verify Supabase project is not paused (free tier pauses after 1 week of inactivity)

## Next Steps

Now that Supabase is set up, you can:

1. **Create your first user profile** (see SCHEMA.md for examples)
2. **Build the persona creation UI** (issue #124)
3. **Implement attendee discovery** (issue #125)
4. **Add messaging** (issue #128)

## Production Checklist

Before deploying to production:

- [ ] Create a separate Supabase project for production
- [ ] Run `schema.sql` on production database
- [ ] Update production environment variables
- [ ] Enable Point-in-Time Recovery (PITR) for backups
- [ ] Set up monitoring and alerts
- [ ] Review and test all RLS policies
- [ ] Enable email notifications (optional)
- [ ] Set up database backups
- [ ] Consider upgrading to Pro tier for better performance

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

## Getting Help

- **Supabase Issues**: [supabase.com/support](https://supabase.com/support)
- **Eventura Issues**: [GitHub Issues](https://github.com/Imploitchain/Eventura/issues)
- **Database Questions**: See [SCHEMA.md](./SCHEMA.md)
