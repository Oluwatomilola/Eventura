import posthog from 'posthog-js';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { sha256 } from 'js-sha256';

// Initialize PostHog
export const initAnalytics = () => {
  if (typeof window !== 'undefined' && !window.posthog) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      // Enable debug mode in development
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug();
      },
      // Disable cookies by default, use localStorage instead
      persistence: 'localStorage',
      // Respect Do Not Track
      respect_dnt: true,
      // Disable autocapture for better performance and privacy
      autocapture: false,
    });
  }
  return posthog;
};

// Hash wallet address for privacy
export const hashWalletAddress = (address: string): string => {
  return sha256(address);
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined') return;
  
  const posthog = window.posthog;
  if (!posthog) return;
  
  posthog.capture('$pageview', {
    $current_url: url,
  });
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  
  const posthog = window.posthog;
  if (!posthog) return;
  
  posthog.capture(eventName, {
    ...properties,
    $current_url: window.location.href,
  });
};

// Identify user when wallet is connected
export const identifyUser = (walletAddress: string) => {
  if (typeof window === 'undefined') return;
  
  const posthog = window.posthog;
  if (!posthog) return;
  
  const hashedAddress = hashWalletAddress(walletAddress);
  
  posthog.identify(hashedAddress, {
    wallet_address_hash: hashedAddress,
    $set_once: {
      first_seen: new Date().toISOString(),
    },
  });
};

// Reset user identity on wallet disconnect
export const resetUser = () => {
  if (typeof window === 'undefined') return;
  
  const posthog = window.posthog;
  if (!posthog) return;
  
  posthog.reset();
};

// Hook to track page views
// eslint-disable-next-line react-hooks/rules-of-hooks
export const useAnalytics = () => {
  const router = useRouter();
  const { address } = useAccount();

  useEffect(() => {
    // Initialize analytics
    initAnalytics();
    
    // Track initial page view
    trackPageView(window.location.pathname);
    
    // Track page views on route change
    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    // Identify user if wallet is connected
    if (address) {
      identifyUser(address);
    }
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, address]);
  
  return {
    trackEvent,
    identifyUser,
    resetUser,
  };
};
