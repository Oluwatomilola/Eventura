import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'appkit-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        // Add any specific props if known, otherwise simple attributes work
        size?: 'sm' | 'md';
        label?: string;
        loadingLabel?: string;
        balance?: 'show' | 'hide';
      };
    }
  }
}

