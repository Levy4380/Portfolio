import { useEffect, useState } from 'react';

import { subscribeAnnouncements } from './A11yHelpers/announce.ts';

export function LiveAnnouncer() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    return subscribeAnnouncements(setMessage);
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only z-1300"
    >
      {message}
    </div>
  );
}
