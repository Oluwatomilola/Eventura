# Eventura Vision & Implementation Plan

## The Story Behind Eventura

**Eventura** = **Event** + **Ura** (slang for "together")

The name captures our core mission: bringing people together through events.

## The Problem We're Solving

### The Introvert's Dilemma

Many people, especially introverts, attend events to gain knowledge or experience something new. However, they often struggle with the networking and connection aspects. The pattern is familiar:

1. **Before the event**: You don't know anyone attending
2. **During the event**: It's hard to approach strangers, especially for introverts
3. **After the event**: You gained knowledge but missed out on valuable connections

### Why Current Platforms Fail

Traditional event platforms like Eventbrite, Ticketmaster, or Meetup focus on:
- Ticket sales and discovery
- Event promotion
- Basic attendee lists

**What they don't do**: Help attendees connect BEFORE the event in a meaningful, low-pressure way.

## The Eventura Solution

### Core Innovation: Pre-Event Social Connection

Eventura is the first event platform that helps you **build relationships before you arrive**, making the event itself a continuation of connections you've already started.

### Key Features

#### 1. Event-Specific Personas

**The Problem**: You're a different person in different contexts. At a tech conference, you're "Senior Developer seeking co-founder." At a music festival, you're "EDM enthusiast looking for concert buddies."

**Our Solution**:
- Create **different personas for different events**
- Each persona has its own bio, interests, and "looking for" section
- Your tech conference friends don't see your music festival persona (unless you connect globally)
- Freedom to experiment with different versions of yourself

**Why This Matters**:
- Removes fear of judgment
- Lets you tailor your approach to each event's context
- Helps you find the RIGHT connections for each event

#### 2. Pre-Event Attendee Discovery

**The Problem**: You buy a ticket and have no idea who else is attending until you show up.

**Our Solution**:
- Browse other attendees who have opted into being discoverable
- Filter by interests, goals, or "looking for" tags
- See shared interests with other attendees
- Send connection requests **before the event**

**Privacy First**:
- You can book tickets without creating a persona (totally private)
- Only attendees who WANT to connect are visible
- Only see personas for events you're both attending
- Can only message people you're connected with

#### 3. Context-Aware Messaging

**The Problem**: Random messages from strangers feel invasive.

**Our Solution**:
- Can only contact people attending the **same event**
- Must send a connection request first
- Messages are event-scoped (optional: convert to global connection)
- Built-in icebreakers based on shared event context

#### 4. Blockchain-Powered Tickets

**The Problem**: Scalpers, fake tickets, no secondary market control.

**Our Solution**:
- NFT tickets (ERC-721) on Base L2
- Verifiable authenticity
- Built-in secondary marketplace with organizer royalties
- Prevents ticket fraud
- Enables cool perks (access to exclusive channels, proof of attendance)

## User Journeys

### Journey 1: The Introvert Finding Their Tribe

**Sarah**, a software engineer, sees a Web3 developer conference:

1. **Discovery**: Finds the event on Eventura, sees it has 200 attendees
2. **Ticket Purchase**: Buys a ticket (wallet-based, no traditional signup)
3. **Persona Creation**: Creates an event-specific persona:
   - Display Name: "Sarah Chen"
   - Bio: "Full-stack dev exploring Web3. Interested in DeFi and smart contract security."
   - Looking For: "Co-founder for DeFi project, mentorship on Solidity best practices"
   - Interests: #Solidity #DeFi #SmartContractSecurity #React

4. **Attendee Discovery**: Browses other attendees, finds:
   - **Marcus**: Experienced Solidity dev offering mentorship
   - **Elena**: Also looking for co-founder, has complementary skills (UX design)
   - **James**: Works at a DeFi protocol, posting about hiring

5. **Connection**: Sends connection requests with personalized messages:
   - To Marcus: "I saw you're offering mentorship on smart contract security. I'm working on a DeFi project and would love to learn from you at the conference."
   - To Elena: "I noticed we're both looking for co-founders! I'm a full-stack dev with Web3 experience. Want to meet up at the conference?"

6. **Pre-Event Chat**: Before the conference, Sarah:
   - Chats with Marcus, schedules a coffee meeting
   - Video calls with Elena, they vibe well, plan to sit together
   - Asks James about the hiring process

7. **Event Day**: Instead of walking in alone, Sarah:
   - Meets Marcus at the coffee shop (already feels like a friend)
   - Sits with Elena during talks (they've already discussed their startup idea)
   - Confidently approaches James (they've been chatting for 2 weeks)

8. **Post-Event**: Sarah and Elena decide to build together (co-founders found!), Marcus becomes her mentor, James refers her to his team.

**Result**: Sarah attended the event AND made meaningful connections, all while managing her introversion through low-pressure, async pre-event communication.

### Journey 2: The Extrovert Maximizing Their Network

**David**, a startup founder, uses Eventura for a different reason:

1. **Multiple Events**: Books tickets to 5 events this month (startup mixer, tech conference, founder dinner, hackathon, concert)

2. **Strategic Personas**: Creates different personas for each:
   - **Startup Mixer**: "Seed-stage founder raising $2M, looking for investors and advisors"
   - **Tech Conference**: "CTO hiring senior engineers, interested in AI/ML infrastructure"
   - **Founder Dinner**: "Second-time founder, happy to mentor early-stage founders"
   - **Hackathon**: "Looking for a team! Strong in backend/infra, need frontend and design"
   - **Concert**: "EDM fan, looking for festival buddies for summer season"

3. **Purposeful Connections**: At each event, David connects with people aligned to his goals:
   - 3 potential investors at the mixer
   - 5 senior engineer candidates at the conference
   - 2 mentees at the dinner
   - A full team at the hackathon
   - 10 new friends for the concert

4. **Context Separation**: David's concert friends don't see his "raising $2M" persona. His investor connections don't see his "looking for hackathon team" persona. Each context is separate.

**Result**: David maximizes every event, building the right relationships in the right context without mixing professional and personal networks.

### Journey 3: The Event Organizer

**TechConf 2025** organizers use Eventura to enhance their event:

1. **Event Creation**:
   - Upload event details, images to IPFS
   - Set ticket price, capacity, start date
   - Deploy smart contract for ticketing

2. **Pre-Event Engagement**:
   - See attendees connecting on the platform
   - Monitor engagement metrics (who's creating personas, who's connecting)
   - Send announcements to all ticket holders

3. **During Event**:
   - Scan NFT ticket QR codes for entry (fraud-proof)
   - Real-time attendance tracking
   - See which sessions are most popular (based on personas' stated interests)

4. **Post-Event**:
   - Attendees have proof-of-attendance NFTs
   - Can airdrop rewards or access to exclusive content
   - Secondary market royalties provide ongoing revenue

5. **Community Building**:
   - Keep the event's community channel open year-round
   - Attendees who connected can stay in touch
   - Build anticipation for next year

## Technical Architecture

### Current Tech Stack

**Blockchain Layer**:
- **Base L2** (Ethereum Layer 2) - Low fees, Ethereum security
- **Solidity Smart Contracts** (OpenZeppelin standards)
  - EventFactory.sol - Create and manage events
  - EventTicketing.sol - NFT tickets (ERC-721)
  - TicketMarketplace.sol - Secondary market (in progress)

**Frontend**:
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Wagmi v2 + Viem v2** for Web3 interactions
- **REOWN/WalletConnect** for wallet connection
- **Framer Motion** for animations

**Storage**:
- **IPFS** (Pinata) for event metadata and images
- **Decentralized** and censorship-resistant

### What We Need to Build (Priority Order)

#### Phase 1: Database & Backend Infrastructure

**Why**: Can't build social features without persistent storage

**Tasks**:
1. Set up Supabase (PostgreSQL for Web3 apps)
2. Database schema:
   ```sql
   -- Users table
   CREATE TABLE users (
     wallet_address TEXT PRIMARY KEY,
     display_name TEXT,
     global_bio TEXT,
     avatar_ipfs_hash TEXT,
     joined_at TIMESTAMP DEFAULT NOW()
   );

   -- Event personas table
   CREATE TABLE event_personas (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     wallet_address TEXT REFERENCES users(wallet_address),
     event_id BIGINT NOT NULL,
     display_name TEXT NOT NULL,
     bio TEXT,
     interests TEXT[], -- Array of tags
     looking_for TEXT[], -- Array of tags
     visibility TEXT DEFAULT 'attendees', -- 'public', 'attendees', 'connections'
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(wallet_address, event_id)
   );

   -- Connections table
   CREATE TABLE connections (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     from_wallet TEXT REFERENCES users(wallet_address),
     to_wallet TEXT REFERENCES users(wallet_address),
     event_id BIGINT NOT NULL,
     status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'blocked'
     message TEXT, -- Connection request message
     is_global BOOLEAN DEFAULT false, -- Convert event connection to global
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Messages table
   CREATE TABLE messages (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     from_wallet TEXT REFERENCES users(wallet_address),
     to_wallet TEXT REFERENCES users(wallet_address),
     event_id BIGINT, -- NULL for global connections
     content TEXT NOT NULL,
     read_at TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Indexes for performance
   CREATE INDEX idx_personas_event ON event_personas(event_id);
   CREATE INDEX idx_personas_wallet ON event_personas(wallet_address);
   CREATE INDEX idx_connections_event ON connections(event_id);
   CREATE INDEX idx_messages_to ON messages(to_wallet, created_at);
   ```

3. API routes for CRUD operations
4. Real-time subscriptions for messages (Supabase Realtime)

#### Phase 2: User Profiles & Personas (CORE FEATURE)

**Why**: This is our unique differentiator

**Tasks**:
1. **Global Profile Creation**
   - `/profile` page
   - Wallet authentication flow
   - Basic profile (display name, bio, avatar upload to IPFS)
   - Interest tags selection

2. **Event-Specific Persona Creation**
   - After purchasing ticket, prompt to "Create your profile for this event"
   - Option to skip (stay private)
   - Form fields:
     - Display name (can differ from global)
     - Bio (event-specific)
     - Interests (tags/chips)
     - Looking for (tags like "Co-founder", "Mentorship", "Job opportunities", "Friends", "Networking")
     - Visibility toggle (who can see you)

3. **Persona Management**
   - Edit persona before event
   - View all your personas across events
   - Copy persona from previous event
   - Archive old personas

#### Phase 3: Attendee Discovery & Matching

**Why**: Help users find relevant connections

**Tasks**:
1. **Event Attendees Page** (`/events/[id]/attendees`)
   - List all attendees who opted into visibility
   - Filter by:
     - Interests
     - Looking for
     - Search by name
   - Sort by:
     - Relevance (shared interests)
     - Recent activity
     - Alphabetical

2. **Matching Algorithm**
   - Calculate compatibility score based on:
     - Shared interests
     - Complementary "looking for" (if I'm looking for co-founder and you're looking for co-founder = high match)
     - Event history (attended similar events)
   - Show "X% match" on profiles

3. **Suggested Connections**
   - "You might want to connect with..." section
   - Based on AI/ML matching
   - Top 5-10 suggestions per event

#### Phase 4: Connection System

**Why**: Enable low-pressure pre-event networking

**Tasks**:
1. **Connection Requests**
   - "Connect" button on attendee profiles
   - Optional message with request (encouraged)
   - Send notification (email + in-app)

2. **Connection Management**
   - Pending requests inbox
   - Accept/reject buttons
   - Block functionality (for safety)
   - View all connections per event

3. **Global Connections**
   - Option to "Make this a global connection" (stay connected after event)
   - Share global profile with connection
   - Cross-event networking

#### Phase 5: Messaging System

**Why**: Enable communication between connections

**Tasks**:
1. **Direct Messages**
   - `/messages` page
   - Chat interface with real-time updates (Supabase Realtime)
   - Can only message accepted connections
   - Event context shown in chat ("You both are attending TechConf 2025")

2. **Event Group Chats** (Optional)
   - Organizer can create official event group
   - All attendees auto-joined (can leave)
   - Announcements, Q&A, networking

3. **Notifications**
   - In-app notifications for new messages
   - Email notifications (configurable)
   - Push notifications (PWA)

#### Phase 6: Event Creation UI

**Why**: Organizers need an easy way to create events

**Tasks**:
1. **Multi-Step Form** (`/events/create`)
   - Step 1: Basic info (title, description, category)
   - Step 2: Details (date, time, location)
   - Step 3: Ticketing (price, capacity, waitlist enabled?)
   - Step 4: Images (upload to IPFS)
   - Step 5: Multi-language content (optional)
   - Step 6: Review and deploy (smart contract transaction)

2. **Organizer Dashboard** (`/dashboard/organizer`)
   - My events list
   - Sales analytics per event
   - Attendee management
   - Announcement broadcast
   - QR code scanner for entry

#### Phase 7: Secondary Marketplace

**Why**: Enable ticket resale with organizer royalties

**Tasks**:
1. **Smart Contract** (TicketMarketplace.sol)
   - List ticket for sale
   - Buy from marketplace
   - Organizer royalty (e.g., 5%)
   - Platform fee (e.g., 2.5%)
   - Cancel listing

2. **Marketplace UI** (`/marketplace`)
   - Browse listed tickets
   - Filter by event
   - Price sorting
   - Buy flow with wallet

3. **My Listings** (`/dashboard/tickets`)
   - List my tickets
   - Manage active listings
   - Sales history

#### Phase 8: Ticket Validation

**Why**: Prevent fraud and streamline entry

**Tasks**:
1. **QR Code Generation**
   - Generate unique QR per ticket
   - Encode: event ID + ticket ID + wallet address

2. **Scanner App**
   - Mobile-optimized page (`/scan`)
   - Camera access for QR scanning
   - Verify ticket on blockchain
   - Mark as "checked in"
   - Works offline (cache check-ins, sync later)

3. **Organizer Dashboard**
   - Real-time check-in count
   - List of checked-in attendees
   - Export attendance list

#### Phase 9: Testing & Deployment

**Why**: Security and reliability

**Tasks**:
1. **Smart Contract Tests**
   - Hardhat tests for all contracts
   - Coverage > 90%
   - Gas optimization
   - Security audit (OpenZeppelin or CertiK)

2. **Frontend Tests**
   - Component tests (Vitest + Testing Library)
   - E2E tests (Playwright)
   - Accessibility tests (axe-core)

3. **Deployment**
   - Deploy contracts to Base Sepolia (testnet)
   - Test all flows end-to-end
   - Security audit
   - Deploy to Base Mainnet
   - Verify contracts on BaseScan

#### Phase 10: Analytics & Growth

**Why**: Help organizers succeed and improve platform

**Tasks**:
1. **Organizer Analytics**
   - Ticket sales over time
   - Revenue tracking
   - Attendee demographics
   - Social engagement metrics (connections, messages)

2. **Platform Analytics**
   - Total events created
   - Total tickets sold
   - Connection success rate
   - User retention

3. **Growth Features**
   - Referral system
   - Organizer affiliate program
   - Featured events
   - Email marketing integration

## Success Metrics

### For Attendees
- **Pre-Event Connections**: Average # of connections made before event
- **Connection Acceptance Rate**: % of connection requests accepted
- **Message Activity**: % of connections that lead to messages
- **Post-Event Survey**: "Did Eventura help you make meaningful connections?"

### For Organizers
- **Adoption Rate**: % of attendees who create personas
- **Engagement**: Average connections per attendee
- **Satisfaction**: NPS score from organizers
- **Revenue**: Secondary market royalties

### Platform
- **Growth**: Month-over-month event creation
- **Network Effects**: % of users attending multiple events
- **Retention**: % of attendees who return for another event
- **Revenue**: Transaction volume (ticket sales + marketplace)

## Competitive Advantages

### vs. Eventbrite/Ticketmaster
- **Social Layer**: Pre-event connections (they have none)
- **Blockchain**: Fraud-proof tickets, verifiable ownership
- **Creator Economy**: Organizers earn royalties on resales

### vs. Meetup/Facebook Events
- **Context-Aware Personas**: Different identities for different events
- **Ticketing Integrated**: No need for separate payment processor
- **Privacy**: Event-scoped connections, not global social graph

### vs. POAP/NFT Ticketing Platforms
- **Social First**: Not just proof of attendance, but pre-event networking
- **User Experience**: Web2 UX with Web3 benefits
- **Community Building**: Ongoing connections, not just collectibles

## Design Principles

### 1. Privacy First
- Opt-in visibility (default is private)
- Event-scoped data (your concert friends don't see your work conferences)
- Block/report functionality
- No selling user data

### 2. Low Pressure Networking
- Async communication (no pressure to respond immediately)
- Written intros (easier for introverts than in-person)
- Curated matches (quality over quantity)
- Optional participation (can still just buy tickets)

### 3. Context is King
- Every feature considers the event context
- Personas adapt to event type
- Messaging references shared event
- Recommendations based on event category

### 4. Web3 for Good Reasons
- Blockchain solves real problems (fraud, resale, ownership)
- Not blockchain for hype
- Abstract complexity (users don't need to know it's Web3)
- Familiar UX despite novel tech

### 5. Delight in Details
- Smooth animations (Framer Motion)
- Instant feedback
- Smart defaults
- Helpful empty states
- Celebratory moments (first connection, first ticket)

## Go-To-Market Strategy

### Phase 1: Local Launch (Months 1-3)
- Partner with 5-10 local organizers
- Tech meetups, workshops, small conferences
- Manually onboard attendees
- Gather feedback, iterate

### Phase 2: Vertical Focus (Months 4-6)
- Double down on what works (likely tech/startup events)
- Build features specific to that vertical
- Become the de facto platform for that niche
- Build network effects within the vertical

### Phase 3: Adjacent Verticals (Months 7-12)
- Expand to related categories (design, product, marketing)
- Leverage existing user base (they attend multiple event types)
- Add vertical-specific features (e.g., portfolio sharing for design events)

### Phase 4: Mainstream (Year 2+)
- Concerts, festivals, sports
- B2C marketing
- Mobile app launch
- International expansion

## Revenue Model

### 1. Ticket Sales Fee (Primary)
- **2.5% platform fee** on all ticket sales
- Competitive with Eventbrite (3.7% + $1.79 fee)
- Free for free events (to encourage adoption)

### 2. Secondary Market Fee
- **2.5% platform fee** on marketplace sales
- **5% organizer royalty** (configurable by organizer)
- Total: 7.5% vs. Stubhub's 15-25%

### 3. Premium Features (Future)
- **Organizer Tools** ($29-99/month):
  - Advanced analytics
  - Custom branding
  - Email marketing tools
  - Priority support
  - Featured event placement

- **Power User** ($9/month):
  - Unlimited event personas
  - Advanced filters for attendee discovery
  - AI-powered matchmaking
  - Early access to new features

### 4. Enterprise (Future)
- White-label solution for large organizations
- Custom contracts and pricing
- Dedicated support

## Technology Roadmap

### Q1 2025: Foundation
- ✅ Smart contracts (EventFactory, EventTicketing)
- ✅ Multi-language support
- ✅ Waitlist system
- ✅ Rate limiting & security
- ✅ Calendar & export
- 🔄 Database setup (Supabase)
- 🔄 User authentication

### Q2 2025: Social Features (CORE)
- 🔄 User profiles
- 🔄 Event-specific personas
- 🔄 Attendee discovery
- 🔄 Connection system
- 🔄 Messaging

### Q3 2025: Organizer Tools
- 🔄 Event creation UI
- 🔄 Organizer dashboard
- 🔄 Ticket validation/QR codes
- 🔄 Analytics dashboard
- 🔄 Contract deployment (testnet → mainnet)

### Q4 2025: Marketplace & Growth
- 🔄 Secondary marketplace
- 🔄 Mobile app (React Native)
- 🔄 Referral system
- 🔄 API for third-party integrations

### 2026: Scale & Expand
- AI-powered matchmaking
- Video profiles for personas
- Live event features (live streaming, live chat)
- DAO governance for platform decisions
- Token launch (for governance & rewards)

## Team & Contributors

This is an open-source project built by a community of contributors. We welcome:

- **Frontend developers** (React, Next.js, TypeScript)
- **Smart contract developers** (Solidity, Hardhat)
- **Backend developers** (Node.js, PostgreSQL, Supabase)
- **Designers** (UI/UX, brand, illustrations)
- **Product managers** (user research, roadmap planning)
- **Marketers** (content, community, partnerships)
- **Testers** (QA, security audits)

## How to Contribute

See our GitHub Issues for tasks labeled:
- `good-first-issue` - Perfect for newcomers
- `help-wanted` - We need expertise here
- `high-priority` - Critical for next release
- `feature` - New functionality
- `bug` - Something's broken
- `documentation` - Improve docs

## Vision for 2030

By 2030, Eventura becomes the default way people experience events:

- **500M+ users** globally
- **10M+ events** created annually
- **Cultural shift**: "Did you connect with anyone before the event?" becomes normal
- **Event personas** are as common as LinkedIn profiles
- **Zero fraud**: NFT tickets eliminate counterfeit tickets entirely
- **Community-owned**: Platform governed by DAO, revenue shared with token holders
- **Metaverse integration**: Connect in VR before in-person events
- **AI matchmaking**: So good it feels like magic

**The world where going to an event alone doesn't mean being alone.**

---

**Let's build the future of events, together.**

**Eventura - Event Together**
