import { BriefcaseBusiness, FlaskConical, User, type LucideIcon } from 'lucide-react';
import { useId } from 'react';

import { cn } from '../lib/cn';

export type FolderAccent = 'about' | 'projects' | 'experiments';

const accentGlyph: Record<FolderAccent, LucideIcon> = {
  about: User,
  projects: BriefcaseBusiness,
  experiments: FlaskConical,
};

export interface FolderIconProps {
  accent: FolderAccent;
  className?: string;
}

/**
 * The blue folder mark, with a glyph for what the folder holds:
 * a person (About Me), a briefcase (Projects), a flask (Experiments).
 */
export function FolderIcon({ accent, className }: FolderIconProps) {
  const uid = useId().replace(/:/g, '');
  const backId = `${uid}-back`;
  const shadowId = `${uid}-shadow`;
  const frontId = `${uid}-front`;
  const lipId = `${uid}-lip`;
  const tabId = `${uid}-tab`;
  const Glyph = accentGlyph[accent];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16.933 16.933"
      width={80}
      height={80}
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <defs>
        <filter
          id={shadowId}
          width="1.065"
          height="1.092"
          x="-0.032"
          y="-0.046"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="0.137" />
        </filter>
        <filter
          id={lipId}
          width="1.013"
          height="1.151"
          x="-0.007"
          y="-0.076"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="0.042" />
        </filter>
        <filter
          id={tabId}
          width="1.014"
          height="1.087"
          x="-0.007"
          y="-0.043"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="0.045" />
        </filter>
        <linearGradient id={backId} x1="8.466" x2="8.466" y1="2.381" y2="5.684" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7cc1ea" />
          <stop offset="1" stopColor="#56a1d3" />
        </linearGradient>
        <linearGradient
          id={frontId}
          x1="445.28"
          x2="445.28"
          y1="179.28"
          y2="200.07"
          gradientTransform="matrix(.38956 0 0 .38184 -165.78 -63.432)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#88ccf2" />
          <stop offset="1" stopColor="#67b1de" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${backId})`}
        d="M1.945 2.381H4.91c.75 0 .904.084 1.27.63.297.441.84.429 1.756.429h7.05a1.146 1.146 0 0 1 1.152 1.152v6.956a1.15 1.15 0 0 1-1.152 1.152H1.944a1.15 1.15 0 0 1-1.15-1.152V3.533a1.15 1.15 0 0 1 1.15-1.152z"
      />
      <rect
        width="14.287"
        height="10.054"
        x="1.323"
        y="3.969"
        fill="none"
        stroke="#000"
        strokeWidth="0.265"
        filter={`url(#${shadowId})`}
        opacity="0.1"
        rx="0.529"
        ry="0.529"
      />
      <rect width="14.287" height="10.054" x="1.323" y="3.969" fill="#fff" rx="0.529" ry="0.529" />
      <rect
        width="15.346"
        height="10.054"
        x="0.794"
        y="4.498"
        fill={`url(#${frontId})`}
        rx="1.058"
        ry="1.058"
      />
      <path
        fill="#fff"
        d="M1.852 4.498c-.586 0-1.058.472-1.058 1.058v.265c0-.587.472-1.059 1.058-1.059h13.229c.586 0 1.058.472 1.058 1.059v-.265c0-.586-.472-1.058-1.058-1.058z"
        filter={`url(#${lipId})`}
        opacity="0.15"
      />
      <path
        d="M1.852 4.498c-.586 0-1.058.472-1.058 1.058v.265c0-.587.472-1.059 1.058-1.059h13.229c.586 0 1.058.472 1.058 1.059v-.265c0-.586-.472-1.058-1.058-1.058z"
        filter={`url(#${lipId})`}
        opacity="0.1"
        transform="matrix(1 0 0 -1 0 19.05)"
      />
      <path
        fill="#fff"
        d="M1.944 2.381a1.15 1.15 0 0 0-1.15 1.152v.26a1.15 1.15 0 0 1 1.15-1.147h2.967c.75 0 .904.083 1.27.63.297.44.84.428 1.756.428h7.05a1.146 1.146 0 0 1 1.152 1.14v-.253a1.146 1.146 0 0 0-1.152-1.151h-7.05c-.916 0-1.459.012-1.755-.429-.367-.546-.52-.63-1.27-.63z"
        filter={`url(#${tabId})`}
        opacity="0.25"
      />
      <Glyph
        x={5.37}
        y={6.42}
        width={6.2}
        height={6.2}
        strokeWidth={2}
        color="#165f96"
        aria-hidden
      />
    </svg>
  );
}
