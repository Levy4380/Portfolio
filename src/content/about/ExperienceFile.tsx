import { defineOpenable } from '../catalog.ts';

const eyebrow = 'text-meta font-medium tracking-wide text-accent uppercase';

export const ExperienceFile = defineOpenable(
  {
    id: 'profile:experience',
    path: '/about/experience',
    title: 'Experience',
    preset: 'profile',
    fileName: 'experience.log',
    icon: { glyph: 'file', kind: 'profile' },
  },
  function ExperienceFile() {
    return (
      <div className="flex min-h-full flex-col gap-6 bg-window p-6 text-fg">
        <ol className="flex flex-col gap-8">
          <li>
            <article className="flex max-w-prose flex-col gap-2">
              <p className={eyebrow}>Replace with employers or clients · Present</p>
              <h3 className="font-display text-title">Frontend development</h3>
              <p className="text-body text-fg-muted">
                The useful work is usually specific: a checkout edge case, an admin screen people
                use every day, or a theme change that still has to make sense after the next
                release.
              </p>
              <p className="text-body text-fg-muted">
                This introduction is a placeholder. Swap it for a short account of the
                applications you have actually built and maintained.
              </p>
            </article>
          </li>
        </ol>
      </div>
    );
  },
);
