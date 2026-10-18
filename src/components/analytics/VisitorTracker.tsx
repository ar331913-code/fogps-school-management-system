'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && pathname !== lastTracked.current) {
      lastTracked.current = pathname;
      try {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            referrer: typeof document !== 'undefined' && document.referrer ? document.referrer : 'Direct',
          }),
        }).catch(() => {});
      } catch {
        // Silently ignore network failures for background tracking
      }
    }
  }, [pathname]);

  return null;
}
