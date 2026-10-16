import { useEffect, useState } from 'react';

import { useLanguage, type Language } from '../../../content/i18n/useTranslation.ts';

const MINUTE = 60_000;

const pad = (value: number) => String(value).padStart(2, '0');

/** Local `YYYY-MM-DDTHH:mm`, a valid `<time dateTime>` value without a time zone. */
function minuteStamp(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function dateFromStamp(stamp: string): Date {
  const [day, time] = stamp.split('T');
  const [year, month, date] = day.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, date, hours, minutes);
}

function formatClock(stamp: string, language: Language) {
  const date = dateFromStamp(stamp);
  const locale = language === 'es' ? 'es' : 'en';
  return {
    time: new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(date),
    day: new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date),
  };
}

/**
 * Time over the date. A tick re-renders only this node, once a minute,
 * on the minute boundary.
 */
export function TrayClock() {
  const { language } = useLanguage();
  const [stamp, setStamp] = useState(() => minuteStamp(new Date()));
  const clock = formatClock(stamp, language);

  useEffect(() => {
    let timer: number | undefined;

    const tick = () => {
      window.clearTimeout(timer);
      setStamp(minuteStamp(new Date()));
      timer = window.setTimeout(tick, MINUTE - (Date.now() % MINUTE));
    };

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
      className="flex flex-col items-end justify-center leading-none select-none"
    >
      <span className="font-mono text-body font-semibold tabular-nums text-fg-inverse">
        {clock.time}
      </span>
      <span className="mt-0.5 font-mono text-ui tabular-nums text-fg-inverse-muted">
        {clock.day}
      </span>
    </time>
  );
}
