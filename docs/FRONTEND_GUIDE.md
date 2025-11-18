# Frontend Development Guide

This guide provides an overview of the Eventura frontend architecture, components, and development practices.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Styling](#styling)
7. [API Integration](#api-integration)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Best Practices](#best-practices)

## Project Structure

```
/apps/web
├── public/                # Static files
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── api/           # API routes
│   │   ├── events/        # Event pages
│   │   ├── tickets/       # Ticket management
│   │   └── ...
│   │
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base UI components (buttons, inputs, etc.)
│   │   ├── events/       # Event-related components
│   │   ├── wallet/       # Wallet connection components
│   │   └── ...
│   │
│   ├── config/           # Configuration files
│   ├── constants/        # Constants and enums
│   ├── contracts/        # Contract ABIs and types
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── providers/        # Context providers
│   ├── store/            # State management
│   ├── styles/           # Global styles
│   └── types/            # TypeScript type definitions
│
├── .eslintrc.js          # ESLint configuration
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies and scripts
└── tailwind.config.js    # Tailwind CSS configuration
```

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Web3**: Viem, Wagmi
- **UI Components**: Radix UI, Shadcn/ui
- **Form Handling**: React Hook Form
- **Data Fetching**: TanStack Query
- **Testing**: Jest, React Testing Library
- **Linting/Formatting**: ESLint, Prettier

## Getting Started

1. **Prerequisites**
   - Node.js 18+
   - pnpm (recommended) or npm
   - Git

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/your-org/eventura.git
   cd eventura

   # Install dependencies
   pnpm install

   # Copy .env.example to .env.local and fill in the values
   cp .env.example .env.local
   ```

3. **Development Server**
   ```bash
   # Start the development server
   pnpm dev
   ```

4. **Building for Production**
   ```bash
   # Build the application
   pnpm build

   # Start the production server
   pnpm start
   ```

## Component Architecture

### Component Categories

1. **UI Components** (`components/ui/`)
   - Reusable, presentational components
   - Should be dumb components (no business logic)
   - Examples: Button, Input, Card, Modal

2. **Feature Components** (`components/features/`)
   - Business logic components
   - May contain state and side effects
   - Examples: EventCard, TicketList, WalletConnectButton

3. **Layout Components** (`components/layout/`)
   - Page layout components
   - Examples: Header, Footer, Sidebar

### Component Structure

Each component should follow this structure:

```tsx
// components/feature/EventCard.tsx
import { FC } from 'react';
import { Event } from '@/types/event';
import { formatDate } from '@/lib/dates';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
}

export const EventCard: FC<EventCardProps> = ({ event, onRegister }) => {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <img 
        src={event.imageUrl} 
        alt={event.title}
        className="mb-4 h-48 w-full rounded-md object-cover"
      />
      <h3 className="text-lg font-semibold">{event.title}</h3>
      <p className="text-muted-foreground">
        {formatDate(event.startDate)}
      </p>
      <div className="mt-4 flex justify-between items-center">
        <span className="font-medium">{event.ticketPrice} ETH</span>
        <Button onClick={() => onRegister?.(event.id)}>
          Register
        </Button>
      </div>
    </div>
  );
};
```

## State Management

### Local State
- Use React's `useState` for simple component state
- Use `useReducer` for complex state logic

### Global State
- Use **Zustand** for global application state
- Create stores in `src/store`

Example store:

```tsx
// store/useEventStore.ts
import { create } from 'zustand';
import { Event } from '@/types/event';

interface EventState {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  createEvent: (event: Omit<Event, 'id'>) => Promise<Event>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  loading: false,
  error: null,
  
  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/events');
      const { data } = await response.json();
      set({ events: data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch events', loading: false });
    }
  },
  
  createEvent: async (event) => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    const newEvent = await response.json();
    set((state) => ({ events: [...state.events, newEvent] }));
    return newEvent;
  },
}));
```

## Styling

### Tailwind CSS
- Use Tailwind's utility classes for styling
- Follow the design system in `tailwind.config.js`
- Use `@apply` for repeated utility patterns

Example:
```tsx
// components/ui/Button.tsx
const Button = ({ children, variant = 'default', ...props }) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'disabled:opacity-50 disabled:pointer-events-none',
      {
        'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
        'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
        'border border-input hover:bg-accent hover:text-accent-foreground': variant === 'outline',
      },
      'h-10 py-2 px-4'
    )}
    {...props}
  >
    {children}
  </button>
);
```

### CSS Modules
- For complex components, use CSS Modules
- Naming convention: `ComponentName.module.css`

## API Integration

### Data Fetching
- Use **TanStack Query** for server state management
- Create query hooks in `src/hooks/api`

Example:
```tsx
// hooks/api/useEvents.ts
import { useQuery } from '@tanstack/react-query';
import { Event } from '@/types/event';

export const useEvents = () => {
  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { data } = await response.json();
      return data;
    },
  });
};
```

### Web3 Integration
- Use **Wagmi** hooks for wallet and blockchain interactions
- Wrap your app with `WagmiProvider` and `QueryClientProvider`

Example:
```tsx
// components/providers/Web3Provider.tsx
'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base, baseSepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@realtoken/connectkit';

const config = createConfig(
  getDefaultConfig({
    appName: 'Eventura',
    appDescription: 'Decentralized event ticketing platform',
    appUrl: 'https://eventura.xyz',
    appIcon: 'https://eventura.xyz/logo.png',
    chains: [base, baseSepolia],
    transports: {
      [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
      [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
    },
  })
);

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

## Testing

### Unit Tests
- Write tests in `__tests__` directories
- Use React Testing Library for component tests

Example test:
```tsx
// __tests__/components/EventCard.test.tsx
import { render, screen } from '@testing-library/react';
import { EventCard } from '@/components/features/EventCard';

describe('EventCard', () => {
  const mockEvent = {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    startDate: '2023-12-31T20:00:00Z',
    endDate: '2024-01-01T02:00:00Z',
    location: 'Test Location',
    ticketPrice: '0.1',
    imageUrl: '/test-image.jpg',
  };

  it('renders event details', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('0.1 ETH')).toBeInTheDocument();
  });
});
```

### E2E Tests
- Use Cypress or Playwright for end-to-end testing
- Test critical user flows

## Deployment

### Vercel (Recommended)
1. Connect your GitHub/GitLab repository to Vercel
2. Set up environment variables in the Vercel dashboard
3. Deploy!

### Self-Hosted
1. Build the application:
   ```bash
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

## Best Practices

### Code Organization
- Keep components small and focused
- Use feature-based folder structure
- Co-locate tests with components

### Performance
- Use dynamic imports for large components
- Optimize images with Next.js Image component
- Implement proper code splitting

### Security
- Validate all user inputs
- Use environment variables for sensitive data
- Implement proper error boundaries

### Accessibility
- Use semantic HTML
- Add proper ARIA attributes
- Ensure keyboard navigation works
- Test with screen readers

## Troubleshooting

### Common Issues

**Wallet Connection Issues**
- Ensure the wallet extension is installed and unlocked
- Check if you're on the correct network (Base)
- Try disconnecting and reconnecting the wallet

**Build Failures**
- Clear `node_modules` and reinstall dependencies
- Check for TypeScript errors
- Ensure all environment variables are set

**API Errors**
- Check the network tab in DevTools
- Verify the API is running and accessible
- Check CORS settings if making cross-origin requests

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
