import { PostHog } from 'posthog-js';

declare global {
  interface Window {
    // PostHog instance
    posthog?: PostHog;
    // Analytics consent flag
    analyticsConsent?: boolean;
    // Other global variables can be added here
  }
}

// This export is needed to turn this into a module
export {};
