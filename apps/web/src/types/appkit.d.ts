import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // REOWN AppKit Button - Main modal trigger with account display
      'appkit-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: 'sm' | 'md';
        label?: string;
        loadingLabel?: string;
        balance?: 'show' | 'hide';
        disabled?: boolean;
        namespace?: 'eip155' | 'solana' | 'bip122';
      };

      // REOWN AppKit Connect Button - Dedicated connection button
      'appkit-connect-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: 'sm' | 'md';
        label?: string;
        loadingLabel?: string;
      };

      // REOWN AppKit Account Button - Account management and display
      'appkit-account-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        disabled?: boolean;
        balance?: 'show' | 'hide';
      };

      // REOWN AppKit Network Button - Network/chain selection
      'appkit-network-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        disabled?: boolean;
      };
    }
  }
}

