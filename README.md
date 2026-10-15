# Your Name — developer portfolio

A client-rendered portfolio built with React, Vite, TypeScript, and Tailwind CSS. Replace the placeholder name, links, and projects before publishing.

## Scripts

```bash
npm install
npm run dev      # development server
npm run build    # typecheck and production build in dist/
npm run preview  # serve the production build locally
npm run lint
npm run format
```

## Where to edit content

All portfolio copy lives in `src/content/`. The desktop, folders, and windows read it through the registry; there is no second data folder.

- `src/content/site.ts` — name, role, email, GitHub, LinkedIn, Instagram, description, and the canonical site URL.
- `src/content/projects.ts` — project files. `featured: true` is what About Me shows under selected work.
- `src/content/experiments.ts` — experiment files.
- `src/content/folders.ts` — desktop folders.
- `src/content/profile.ts` — About Me sections (profile, experience, skills, contact).
- `src/content/links.ts` — external links. Their URLs come from `site.ts`.
- `src/content/startMenu.ts` — Start menu groups.

Leave `site.siteUrl` empty until the production domain is known. When you set it (no trailing slash, for example `https://example.com`), each address emits a canonical link for its path.

Project images are optional. Set `cover` and `gallery` to `{ src, alt, width, height }` objects. Until then, the window shows a placeholder instead of a missing file. `liveUrl` and `repositoryUrl` are optional; the examples point at `example.com` and a placeholder GitHub path.

## Routing on a static host

The app is a single-page application. Vite does not configure the production host. Direct requests such as `/projects/catalog-storefront` only work if the host serves `dist/index.html` whenever the path is not a real file.

Build with `npm run build` and upload the contents of `dist/`. Asset URLs are root-relative (`/assets/...`), which is correct when the site is served from the domain root. If you deploy under a subpath, set Vite `base` to that subpath.

Typical fallbacks:

- **nginx:** `try_files $uri $uri/ /index.html;`
- **Apache:** `FallbackResource /index.html` inside the site directory.
- **Laravel Cloud or another static host:** enable the provider’s SPA / single-page fallback so unknown paths return `index.html` with a 200. That setting lives in the host, not in this repository. Do not add a Laravel application just to serve these files.

There is no backend in this project.
