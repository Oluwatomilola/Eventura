'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

export function AnalyticsConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('analyticsConsent');
    
    // Only show banner if no choice has been made yet
    if (consent === null) {
      setShowBanner(true);
    }
    
    setMounted(true);
  }, []);

  const handleAccept = () => {
    // Enable analytics
    localStorage.setItem('analyticsConsent', 'true');
    setShowBanner(false);
    
    // Initialize analytics
    if (typeof window !== 'undefined') {
      window.analyticsConsent = true;
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('analyticsConsentUpdated'));
    }
  };

  const handleReject = () => {
    // Disable analytics
    localStorage.setItem('analyticsConsent', 'false');
    setShowBanner(false);
    
    // Reset analytics if they were previously enabled
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.opt_out_capturing();
      window.analyticsConsent = false;
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('analyticsConsentUpdated'));
    }
  };

  if (!mounted || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 z-50">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 text-sm text-zinc-300">
          <p>
            We use cookies and similar technologies to analyze how you use our platform and improve your experience. 
            You can opt out of analytics tracking below. For more information, please see our{' '}
            <a 
              href="/privacy" 
              className="text-cyan-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button
            onClick={handleAccept}
            className="bg-cyan-600 hover:bg-cyan-700 text-white whitespace-nowrap"
          >
            Accept All
          </Button>
          <Button
            variant="outline"
            onClick={handleReject}
            className="border-zinc-700 hover:bg-zinc-800 text-white whitespace-nowrap"
          >
            Reject All
          </Button>
        </div>
      </div>
    </div>
  );
}
