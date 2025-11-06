# ShareButton Component

A reusable social sharing component for event sharing across multiple platforms with analytics tracking.

## Features

- Share to multiple social platforms (Twitter, Facebook, LinkedIn, WhatsApp, Telegram, Email)
- Copy link functionality with toast notification
- Mobile-responsive design
- Analytics tracking for shares
- Dynamic Open Graph meta tags for rich link previews
- Keyboard accessible
- Screen reader friendly

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `eventId` | string | Yes | Unique identifier for the event (for analytics) |
| `eventTitle` | string | Yes | Title of the event to be shared |
| `eventUrl` | string | Yes | URL of the event to be shared |
| `className` | string | No | Additional CSS classes for the button |

## Usage

```tsx
import { ShareButton } from './ShareButton';

// Inside your component
<ShareButton 
  eventId="event-123"
  eventTitle="Amazing Tech Conference 2023"
  eventUrl="https://example.com/events/amazing-tech-conf-2023"
  className="my-4"
/>
```

## Analytics

The component includes a `trackShare` function that logs share events to the console. To implement actual analytics tracking, replace the `trackShare` function with your preferred analytics service (e.g., Google Analytics, Mixpanel, etc.).

## Dependencies

This component uses the following dependencies:
- react-icons
- react-hot-toast (for copy link notifications)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS, Android)
- IE11+ (with polyfills for `navigator.clipboard`)

## Accessibility

- Keyboard navigable
- Screen reader friendly
- Proper ARIA labels
- Focus management for the dropdown menu
