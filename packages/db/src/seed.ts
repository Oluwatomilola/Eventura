import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle(pool, { schema });

// Sample wallet addresses for development
const SAMPLE_WALLETS = [
  '0x1234567890123456789012345678901234567890',
  '0x2345678901234567890123456789012345678901',
  '0x3456789012345678901234567890123456789012',
  '0x4567890123456789012345678901234567890123',
  '0x5678901234567890123456789012345678901234',
  '0x6789012345678901234567890123456789012345',
  '0x7890123456789012345678901234567890123456',
  '0x8901234567890123456789012345678901234567',
  '0x9012345678901234567890123456789012345678',
  '0x0123456789012345678901234567890123456789',
];

// Sample event IDs (would correspond to on-chain events)
const SAMPLE_EVENT_IDS = [
  'event_eth_denver_2025',
  'event_base_bootcamp_sf',
  'event_web3_summit_nyc',
  'event_defi_conference_miami',
  'event_nft_expo_la',
];

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create sample users
    console.log('Creating users...');
    const users = await db.insert(schema.users).values([
      {
        walletAddress: SAMPLE_WALLETS[0],
        email: 'alice@example.com',
        emailVerified: true,
        displayName: 'Alice Johnson',
        globalBio: 'Web3 developer and blockchain enthusiast. Building the future of decentralized apps.',
        avatarIpfsHash: 'QmAlice123',
      },
      {
        walletAddress: SAMPLE_WALLETS[1],
        email: 'bob@example.com',
        emailVerified: true,
        displayName: 'Bob Smith',
        globalBio: 'DeFi researcher exploring innovative protocols and yield strategies.',
        avatarIpfsHash: 'QmBob456',
      },
      {
        walletAddress: SAMPLE_WALLETS[2],
        email: 'carol@example.com',
        emailVerified: false,
        displayName: 'Carol Martinez',
        globalBio: 'NFT artist and community builder. Love creating meaningful digital experiences.',
        avatarIpfsHash: 'QmCarol789',
      },
      {
        walletAddress: SAMPLE_WALLETS[3],
        displayName: 'David Chen',
        globalBio: 'Smart contract auditor and security researcher.',
      },
      {
        walletAddress: SAMPLE_WALLETS[4],
        email: 'emma@example.com',
        emailVerified: true,
        displayName: 'Emma Wilson',
        globalBio: 'Event organizer passionate about bringing Web3 communities together.',
        avatarIpfsHash: 'QmEmma012',
      },
      {
        walletAddress: SAMPLE_WALLETS[5],
        displayName: 'Frank Lee',
        globalBio: 'DAO contributor and governance enthusiast.',
      },
      {
        walletAddress: SAMPLE_WALLETS[6],
        email: 'grace@example.com',
        emailVerified: true,
        displayName: 'Grace Taylor',
        globalBio: 'Full-stack developer building on Base.',
      },
      {
        walletAddress: SAMPLE_WALLETS[7],
        displayName: 'Henry Kim',
        globalBio: 'Crypto trader and market analyst.',
      },
      {
        walletAddress: SAMPLE_WALLETS[8],
        email: 'iris@example.com',
        emailVerified: true,
        displayName: 'Iris Patel',
        globalBio: 'UX designer creating intuitive Web3 experiences.',
        avatarIpfsHash: 'QmIris345',
      },
      {
        walletAddress: SAMPLE_WALLETS[9],
        displayName: 'Jack Brown',
        globalBio: 'Blockchain educator and content creator.',
      },
    ]).returning();
    console.log(`✅ Created ${users.length} users`);

    // 2. Create event personas
    console.log('Creating event personas...');
    const personas = await db.insert(schema.eventPersonas).values([
      {
        walletAddress: SAMPLE_WALLETS[0],
        eventId: SAMPLE_EVENT_IDS[0],
        displayName: 'Alice @ ETH Denver',
        bio: 'Looking to connect with other Solidity developers and discuss best practices.',
        interests: ['Solidity', 'Smart Contracts', 'Security'],
        lookingFor: ['Developers', 'Auditors', 'Job Opportunities'],
        visibility: 'public',
      },
      {
        walletAddress: SAMPLE_WALLETS[1],
        eventId: SAMPLE_EVENT_IDS[0],
        displayName: 'Bob the DeFi Guy',
        bio: 'Exploring new DeFi primitives and looking for collaboration opportunities.',
        interests: ['DeFi', 'Yield Farming', 'Liquidity Pools'],
        lookingFor: ['Protocol Designers', 'Investors'],
        visibility: 'attendees',
      },
      {
        walletAddress: SAMPLE_WALLETS[2],
        eventId: SAMPLE_EVENT_IDS[4],
        displayName: 'Carol - NFT Artist',
        bio: 'Showcasing my latest NFT collection. Open to commissions!',
        interests: ['NFT Art', 'Generative Art', 'Digital Collectibles'],
        lookingFor: ['Collectors', 'Gallery Owners', 'Collaborators'],
        visibility: 'public',
      },
      {
        walletAddress: SAMPLE_WALLETS[3],
        eventId: SAMPLE_EVENT_IDS[2],
        displayName: 'David - Security First',
        bio: 'Available for smart contract audits. Let\'s make Web3 safer!',
        interests: ['Security', 'Auditing', 'Formal Verification'],
        lookingFor: ['Projects to Audit', 'Security Teams'],
        visibility: 'attendees',
      },
      {
        walletAddress: SAMPLE_WALLETS[4],
        eventId: SAMPLE_EVENT_IDS[0],
        displayName: 'Emma - Event Organizer',
        bio: 'Planning the next big Base event in SF. Looking for speakers and sponsors!',
        interests: ['Event Planning', 'Community Building', 'Networking'],
        lookingFor: ['Speakers', 'Sponsors', 'Volunteers'],
        visibility: 'public',
      },
      {
        walletAddress: SAMPLE_WALLETS[5],
        eventId: SAMPLE_EVENT_IDS[2],
        displayName: 'Frank DAO',
        bio: 'Active in multiple DAOs. Let\'s talk governance and coordination.',
        interests: ['DAOs', 'Governance', 'Tokenomics'],
        lookingFor: ['DAO Members', 'Governance Researchers'],
        visibility: 'connections',
      },
      {
        walletAddress: SAMPLE_WALLETS[6],
        eventId: SAMPLE_EVENT_IDS[1],
        displayName: 'Grace - Base Builder',
        bio: 'Building the next unicorn on Base. Looking for co-founders!',
        interests: ['Full-Stack Development', 'Startups', 'Base'],
        lookingFor: ['Co-founders', 'Investors', 'Advisors'],
        visibility: 'public',
      },
      {
        walletAddress: SAMPLE_WALLETS[7],
        eventId: SAMPLE_EVENT_IDS[3],
        displayName: 'Henry Trades',
        bio: 'Sharing alpha and trading insights. DM for analysis.',
        interests: ['Trading', 'Technical Analysis', 'Market Research'],
        lookingFor: ['Traders', 'Analysts'],
        visibility: 'private',
      },
    ]).returning();
    console.log(`✅ Created ${personas.length} event personas`);

    // 3. Create connections
    console.log('Creating connections...');
    const connections = await db.insert(schema.connections).values([
      {
        fromWallet: SAMPLE_WALLETS[0],
        toWallet: SAMPLE_WALLETS[1],
        eventId: SAMPLE_EVENT_IDS[0],
        status: 'accepted',
        message: 'Hey Bob! Would love to discuss DeFi security with you.',
        isGlobal: false,
      },
      {
        fromWallet: SAMPLE_WALLETS[0],
        toWallet: SAMPLE_WALLETS[3],
        status: 'accepted',
        message: 'Hi David! Your work on security is impressive.',
        isGlobal: true,
      },
      {
        fromWallet: SAMPLE_WALLETS[1],
        toWallet: SAMPLE_WALLETS[4],
        eventId: SAMPLE_EVENT_IDS[0],
        status: 'accepted',
        message: 'Emma, great event! Let\'s collaborate on future ones.',
        isGlobal: false,
      },
      {
        fromWallet: SAMPLE_WALLETS[2],
        toWallet: SAMPLE_WALLETS[8],
        status: 'accepted',
        message: 'Love your UX work! Want to collaborate on an NFT project?',
        isGlobal: true,
      },
      {
        fromWallet: SAMPLE_WALLETS[4],
        toWallet: SAMPLE_WALLETS[6],
        eventId: SAMPLE_EVENT_IDS[1],
        status: 'pending',
        message: 'Would love to feature your project at my next event!',
        isGlobal: false,
      },
      {
        fromWallet: SAMPLE_WALLETS[5],
        toWallet: SAMPLE_WALLETS[0],
        eventId: SAMPLE_EVENT_IDS[2],
        status: 'pending',
        message: 'Interested in joining our DAO?',
        isGlobal: false,
      },
      {
        fromWallet: SAMPLE_WALLETS[7],
        toWallet: SAMPLE_WALLETS[1],
        eventId: SAMPLE_EVENT_IDS[3],
        status: 'rejected',
        message: 'Want to share some trading strategies?',
        isGlobal: false,
      },
      {
        fromWallet: SAMPLE_WALLETS[3],
        toWallet: SAMPLE_WALLETS[6],
        status: 'accepted',
        message: 'I can audit your smart contracts if needed!',
        isGlobal: true,
      },
    ]).returning();
    console.log(`✅ Created ${connections.length} connections`);

    // 4. Create messages
    console.log('Creating messages...');
    const messages = await db.insert(schema.messages).values([
      {
        fromWallet: SAMPLE_WALLETS[0],
        toWallet: SAMPLE_WALLETS[1],
        eventId: SAMPLE_EVENT_IDS[0],
        content: 'Hey Bob! Great to connect at ETH Denver. What are you working on?',
      },
      {
        fromWallet: SAMPLE_WALLETS[1],
        toWallet: SAMPLE_WALLETS[0],
        eventId: SAMPLE_EVENT_IDS[0],
        content: 'Hi Alice! I\'m researching new yield aggregation strategies. Would love your input on the security side.',
        readAt: new Date(),
      },
      {
        fromWallet: SAMPLE_WALLETS[0],
        toWallet: SAMPLE_WALLETS[1],
        eventId: SAMPLE_EVENT_IDS[0],
        content: 'Absolutely! Let\'s schedule a call next week.',
        readAt: new Date(),
      },
      {
        fromWallet: SAMPLE_WALLETS[2],
        toWallet: SAMPLE_WALLETS[8],
        content: 'Iris, I saw your portfolio. Would you be interested in designing the UI for my NFT marketplace?',
      },
      {
        fromWallet: SAMPLE_WALLETS[8],
        toWallet: SAMPLE_WALLETS[2],
        content: 'Carol, I\'d love to! Send me the details and we can discuss scope.',
        readAt: new Date(),
      },
      {
        fromWallet: SAMPLE_WALLETS[4],
        toWallet: SAMPLE_WALLETS[1],
        eventId: SAMPLE_EVENT_IDS[0],
        content: 'Thanks for attending! Hope you enjoyed the event.',
        readAt: new Date(),
      },
      {
        fromWallet: SAMPLE_WALLETS[1],
        toWallet: SAMPLE_WALLETS[4],
        eventId: SAMPLE_EVENT_IDS[0],
        content: 'It was fantastic! Best organized event I\'ve been to.',
        readAt: new Date(),
      },
      {
        fromWallet: SAMPLE_WALLETS[3],
        toWallet: SAMPLE_WALLETS[0],
        content: 'Alice, I reviewed your latest contract. Found a few minor issues. Can we discuss?',
      },
    ]).returning();
    console.log(`✅ Created ${messages.length} messages`);

    // 5. Create notifications
    console.log('Creating notifications...');
    const notifications = await db.insert(schema.notifications).values([
      {
        userWallet: SAMPLE_WALLETS[0],
        type: 'connection_accepted',
        title: 'Connection Accepted',
        message: 'David Chen accepted your connection request!',
        link: '/connections',
      },
      {
        userWallet: SAMPLE_WALLETS[1],
        type: 'new_message',
        title: 'New Message',
        message: 'Alice Johnson sent you a message',
        link: '/messages',
        readAt: new Date(),
      },
      {
        userWallet: SAMPLE_WALLETS[2],
        type: 'connection_request',
        title: 'New Connection Request',
        message: 'Iris Patel wants to connect with you',
        link: '/connections',
      },
      {
        userWallet: SAMPLE_WALLETS[4],
        type: 'event_reminder',
        title: 'Event Starting Soon',
        message: 'ETH Denver 2025 starts in 24 hours!',
        link: '/events/event_eth_denver_2025',
        readAt: new Date(),
      },
      {
        userWallet: SAMPLE_WALLETS[6],
        type: 'connection_request',
        title: 'New Connection Request',
        message: 'Emma Wilson wants to connect with you',
        link: '/connections',
      },
      {
        userWallet: SAMPLE_WALLETS[3],
        type: 'system',
        title: 'Welcome to Eventura!',
        message: 'Complete your profile to start connecting with other attendees.',
        link: '/profile',
        readAt: new Date(),
      },
      {
        userWallet: SAMPLE_WALLETS[5],
        type: 'event_reminder',
        title: 'Event Tomorrow',
        message: 'Web3 Summit NYC is tomorrow. Don\'t forget to check in!',
        link: '/events/event_web3_summit_nyc',
      },
    ]).returning();
    console.log(`✅ Created ${notifications.length} notifications`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nSeeded data summary:');
    console.log(`  - ${users.length} users`);
    console.log(`  - ${personas.length} event personas`);
    console.log(`  - ${connections.length} connections`);
    console.log(`  - ${messages.length} messages`);
    console.log(`  - ${notifications.length} notifications`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the seed function
seed();
