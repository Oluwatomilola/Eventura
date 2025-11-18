-- Eventura Database Schema
-- This schema supports the social connection features that make Eventura unique

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- Stores global user profile information
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  wallet_address TEXT PRIMARY KEY,
  display_name TEXT,
  global_bio TEXT,
  avatar_ipfs_hash TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_joined_at ON users(joined_at DESC);

-- ============================================
-- EVENT_PERSONAS TABLE
-- Stores event-specific personas (CORE DIFFERENTIATOR)
-- Users can have different personas for different events
-- ============================================
CREATE TABLE IF NOT EXISTS event_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  event_id BIGINT NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  looking_for TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'attendees' CHECK (visibility IN ('public', 'attendees', 'connections', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one persona per user per event
  UNIQUE(wallet_address, event_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_personas_event ON event_personas(event_id);
CREATE INDEX IF NOT EXISTS idx_personas_wallet ON event_personas(wallet_address);
CREATE INDEX IF NOT EXISTS idx_personas_visibility ON event_personas(visibility);
CREATE INDEX IF NOT EXISTS idx_personas_created_at ON event_personas(created_at DESC);

-- GIN index for array searches on interests and looking_for
CREATE INDEX IF NOT EXISTS idx_personas_interests ON event_personas USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_personas_looking_for ON event_personas USING GIN(looking_for);

-- ============================================
-- CONNECTIONS TABLE
-- Stores connection requests and accepted connections
-- ============================================
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_wallet TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  to_wallet TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  event_id BIGINT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked', 'removed')),
  message TEXT,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate connection requests
  UNIQUE(from_wallet, to_wallet, event_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_connections_from ON connections(from_wallet);
CREATE INDEX IF NOT EXISTS idx_connections_to ON connections(to_wallet);
CREATE INDEX IF NOT EXISTS idx_connections_event ON connections(event_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_created_at ON connections(created_at DESC);

-- Composite index for common query pattern (user's connections for an event)
CREATE INDEX IF NOT EXISTS idx_connections_user_event ON connections(from_wallet, event_id, status);
CREATE INDEX IF NOT EXISTS idx_connections_recipient_event ON connections(to_wallet, event_id, status);

-- ============================================
-- MESSAGES TABLE
-- Stores direct messages between connected users
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_wallet TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  to_wallet TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  event_id BIGINT,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Basic validation
  CONSTRAINT message_not_empty CHECK (length(content) > 0),
  CONSTRAINT message_length CHECK (length(content) <= 2000)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_from ON messages(from_wallet);
CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_wallet);
CREATE INDEX IF NOT EXISTS idx_messages_event ON messages(event_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at) WHERE read_at IS NULL;

-- Composite index for conversation queries (messages between two users)
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(from_wallet, to_wallet, created_at DESC);

-- ============================================
-- NOTIFICATIONS TABLE
-- Stores in-app notifications for users
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_wallet TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('connection_request', 'connection_accepted', 'connection_rejected', 'new_message', 'event_reminder', 'waitlist_available', 'event_cancelled', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  metadata JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_wallet);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Composite index for common query (user's unread notifications)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_wallet, created_at DESC) WHERE read_at IS NULL;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can only access their own data
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view all profiles (for discovery)
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = wallet_address);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = wallet_address)
  WITH CHECK (auth.uid()::text = wallet_address);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON users FOR DELETE
  USING (auth.uid()::text = wallet_address);

-- ============================================
-- EVENT_PERSONAS TABLE POLICIES
-- ============================================

-- Users can view personas based on visibility settings
CREATE POLICY "Users can view visible personas"
  ON event_personas FOR SELECT
  USING (
    visibility = 'public'
    OR (visibility = 'attendees' AND auth.uid() IS NOT NULL)
    OR (visibility = 'connections' AND EXISTS (
      SELECT 1 FROM connections
      WHERE (from_wallet = auth.uid()::text AND to_wallet = wallet_address AND status = 'accepted')
         OR (to_wallet = auth.uid()::text AND from_wallet = wallet_address AND status = 'accepted')
    ))
    OR wallet_address = auth.uid()::text
  );

-- Users can create their own personas
CREATE POLICY "Users can create their own personas"
  ON event_personas FOR INSERT
  WITH CHECK (auth.uid()::text = wallet_address);

-- Users can update their own personas
CREATE POLICY "Users can update their own personas"
  ON event_personas FOR UPDATE
  USING (auth.uid()::text = wallet_address)
  WITH CHECK (auth.uid()::text = wallet_address);

-- Users can delete their own personas
CREATE POLICY "Users can delete their own personas"
  ON event_personas FOR DELETE
  USING (auth.uid()::text = wallet_address);

-- ============================================
-- CONNECTIONS TABLE POLICIES
-- ============================================

-- Users can view connections they're part of
CREATE POLICY "Users can view their connections"
  ON connections FOR SELECT
  USING (
    from_wallet = auth.uid()::text
    OR to_wallet = auth.uid()::text
  );

-- Users can create connection requests
CREATE POLICY "Users can create connection requests"
  ON connections FOR INSERT
  WITH CHECK (auth.uid()::text = from_wallet);

-- Users can update connections they're part of
CREATE POLICY "Users can update their connections"
  ON connections FOR UPDATE
  USING (
    from_wallet = auth.uid()::text
    OR to_wallet = auth.uid()::text
  )
  WITH CHECK (
    from_wallet = auth.uid()::text
    OR to_wallet = auth.uid()::text
  );

-- Users can delete connections they created
CREATE POLICY "Users can delete their connection requests"
  ON connections FOR DELETE
  USING (from_wallet = auth.uid()::text);

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    from_wallet = auth.uid()::text
    OR to_wallet = auth.uid()::text
  );

-- Users can send messages
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid()::text = from_wallet);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages"
  ON messages FOR UPDATE
  USING (to_wallet = auth.uid()::text)
  WITH CHECK (to_wallet = auth.uid()::text);

-- Users can delete messages they sent
CREATE POLICY "Users can delete their sent messages"
  ON messages FOR DELETE
  USING (from_wallet = auth.uid()::text);

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Users can only view their own notifications
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (user_wallet = auth.uid()::text);

-- Service role can create notifications (server-side only)
CREATE POLICY "Service can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (user_wallet = auth.uid()::text)
  WITH CHECK (user_wallet = auth.uid()::text);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their notifications"
  ON notifications FOR DELETE
  USING (user_wallet = auth.uid()::text);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personas_updated_at
  BEFORE UPDATE ON event_personas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER VIEWS (Optional)
-- ============================================

-- View for active connections (accepted only)
CREATE OR REPLACE VIEW active_connections AS
SELECT
  id,
  from_wallet,
  to_wallet,
  event_id,
  is_global,
  created_at
FROM connections
WHERE status = 'accepted';

-- View for unread messages count per user
CREATE OR REPLACE VIEW unread_messages_count AS
SELECT
  to_wallet as user_wallet,
  COUNT(*) as unread_count
FROM messages
WHERE read_at IS NULL
GROUP BY to_wallet;

-- View for unread notifications count per user
CREATE OR REPLACE VIEW unread_notifications_count AS
SELECT
  user_wallet,
  COUNT(*) as unread_count
FROM notifications
WHERE read_at IS NULL
GROUP BY user_wallet;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'Stores global user profile information';
COMMENT ON TABLE event_personas IS 'Event-specific personas - users can have different identities for different events (CORE DIFFERENTIATOR)';
COMMENT ON TABLE connections IS 'Connection requests and accepted connections between users';
COMMENT ON TABLE messages IS 'Direct messages between connected users';
COMMENT ON TABLE notifications IS 'In-app notifications for users';

COMMENT ON COLUMN event_personas.visibility IS 'Who can see this persona: public, attendees (event attendees only), connections (connected users only), private';
COMMENT ON COLUMN connections.status IS 'Connection status: pending (awaiting response), accepted, rejected, blocked, removed';
COMMENT ON COLUMN connections.is_global IS 'Whether this connection extends beyond the event (stay connected after event ends)';
