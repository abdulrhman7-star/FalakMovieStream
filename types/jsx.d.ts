import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'video-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { poster?: string };
      'video-neutral-skin': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
