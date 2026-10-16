import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { cn } from '../../lib/cn.ts';

type SharedProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
};

/**
 * `href` opens an external destination in a new tab, `to` is an in-app route,
 * and `onClick` renders a real `<button>` for in-window actions.
 */
type ButtonLinkProps = SharedProps &
  ({ to: string } | { href: string } | { onClick: () => void });

const base =
  'focus-ring inline-flex min-h-8 items-center justify-center gap-2 rounded-control px-3 py-1.5 text-ui font-medium transition-colors duration-(--duration-fast) pointer-coarse:min-h-11 pointer-coarse:px-4';

const variants = {
  primary: 'bg-accent text-on-accent hover:bg-accent-strong',
  secondary: 'border border-line bg-window text-fg hover:bg-chrome-hover',
} as const;

export function ButtonLink(props: ButtonLinkProps) {
  const { children, variant = 'primary', className } = props;
  const classes = cn(base, variants[variant], className);

  if ('to' in props) {
    return (
      <Link to={props.to} className={classes}>
        {children}
      </Link>
    );
  }

  if ('onClick' in props) {
    return (
      <button type="button" className={classes} onClick={props.onClick}>
        {children}
      </button>
    );
  }

  return (
    <a
      href={props.href}
      className={classes}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
