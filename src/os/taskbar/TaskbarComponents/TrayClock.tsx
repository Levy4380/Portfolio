import { useEffect, useState } from 'react';

const MINUTE = 60_000;

const pad = (value: number) => String(value).padStart(2, '0');

/** Local `YYYY-MM-DDTHH:mm`, a valid `<time dateTime>` value without a time zone. */
function minuteStamp(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/**
 * `HH:mm` clock. It lives in its own component so a tick re-renders only this
 * node, and it wakes once a minute, on the minute boundary.
 */
export function TrayClock() {
  // State is the minute string, so an early or duplicate tick bails out of rendering.
  const [stamp, setStamp] = useState(() => minuteStamp(new Date()));

  useEffect(() => {
    let timer: number | undefined;

    const tick = () => {
      window.clearTimeout(timer);
      setStamp(minuteStamp(new Date()));
      timer = window.setTimeout(tick, MINUTE - (Date.now() % MINUTE));
    };

    // Background tabs throttle timers, so resync when the tab becomes visible.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };

    timer = window.setTimeout(tick, MINUTE - (Date.now() % MINUTE));
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <time
      dateTime={stamp}
      className="select-none px-2 font-mono text-meta tabular-nums text-fg-inverse"
    >
      {stamp.slice(11)}
    </time>
  );
}
