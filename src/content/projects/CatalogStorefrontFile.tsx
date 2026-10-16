import { ProjectVisual } from '../../components/projects/ProjectVisual.tsx';
import { ButtonLink } from '../../components/ui/ButtonLink.tsx';
import { TechList } from '../../components/ui/TechList.tsx';
import { defineOpenable } from '../catalog.ts';

export const CatalogStorefrontFile = defineOpenable(
  {
    id: 'project:catalog-storefront',
    path: '/projects/catalog-storefront',
    title: 'Catalog storefront',
    preset: 'document',
    fileName: 'catalog-storefront.site',
    summary:
      'A product listing, product page, and cart sketched as an e-commerce example.',
    icon: { glyph: 'file', kind: 'project' },
  },
  function CatalogStorefrontFile() {
    return (
      <div className="flex min-h-full flex-col bg-window text-fg">
        <div className="flex flex-wrap gap-2 border-b border-line bg-sunken px-4 py-2">
          <ButtonLink href="https://example.com">Live demo</ButtonLink>
          <ButtonLink
            href="https://github.com/your-username/catalog-storefront"
            variant="secondary"
          >
            Source
          </ButtonLink>
        </div>
        <article className="flex flex-col gap-6 p-6">
          <ProjectVisual label="E-commerce" />
          <header className="flex max-w-prose flex-col gap-2">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-meta font-medium tracking-wide text-accent uppercase">
              <li>E-commerce</li>
              <li>Client work</li>
              <li>Live</li>
            </ul>
            <h3 className="font-display text-display">Catalog storefront</h3>
            <p className="text-body text-fg-muted">
              A product listing, product page, and cart sketched as an e-commerce example.
            </p>
          </header>
          <div className="flex max-w-prose flex-col gap-4">
            <p className="text-body text-fg-muted">
              Replace this with the story of a real storefront. The example stands in for catalog
              browsing, a product detail view, and a cart — the kind of Shopify work this
              portfolio is meant to show.
            </p>
            <p className="text-body text-fg-muted">
              There is no client, launch date, or traffic figure attached to it. Add screenshots
              by setting cover and gallery once the assets exist.
            </p>
          </div>
          <section className="flex flex-col gap-3" aria-label="Technologies">
            <h4 className="text-meta font-medium tracking-wide text-fg-muted uppercase">
              Technologies
            </h4>
            <TechList items={['React', 'Shopify', 'Liquid', 'Tailwind CSS']} />
          </section>
        </article>
      </div>
    );
  },
);
