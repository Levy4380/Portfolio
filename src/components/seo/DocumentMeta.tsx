import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { site } from '../../content/site.ts';

type DocumentMetaProps = {
  title: string;
  description: string;
};

function upsertMeta(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.append(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(href: string | null) {
  const existing = document.querySelector('link[rel="canonical"]');
  if (!href) {
    existing?.remove();
    return;
  }

  const link = existing ?? document.createElement('link');
  link.setAttribute('rel', 'canonical');
  link.setAttribute('href', href);
  if (!existing) {
    document.head.append(link);
  }
}

export function DocumentMeta({ title, description }: DocumentMetaProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = title;
    upsertMeta('description', description);

    const origin = site.siteUrl.replace(/\/$/, '');
    upsertCanonical(origin ? `${origin}${pathname}` : null);
  }, [description, pathname, title]);

  return null;
}
