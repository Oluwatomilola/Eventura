import { useEffect } from 'react';
import { useAnalytics, trackEvent } from '@/lib/analytics';

export const withAnalytics = (WrappedComponent: React.ComponentType, pageName?: string) => {
  const WithAnalytics = (props: any) => {
    useAnalytics();
    
    useEffect(() => {
      // Track page view with page name if provided
      if (pageName) {
        trackEvent('page_view', {
          page_name: pageName,
          page_url: window.location.pathname,
        });
      }
    }, [pageName]);
    
    return <WrappedComponent {...props} />;
  };
  
  // Set display name for better debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAnalytics.displayName = `withAnalytics(${displayName})`;
  
  return WithAnalytics;
};
