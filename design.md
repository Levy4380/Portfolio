# Portfolio OS — Design System Specification

This document is the source of truth for the visual language, component architecture, window manager, routing, content model, and interaction rules of the portfolio. It is written so that a developer or a coding agent can implement the application without inventing fundamental rules. When this document makes a decision, it records the rationale; implementation should follow the decision rather than reopen it.

**Installed stack (do not assume other major versions):**

| Package | Version | Notes that constrain this spec |
| --- | --- | --- |
| `react`, `react-dom` | 19.2 | `useReducer`, Context, `lazy`, `Suspense`, `inert` as a boolean prop. |
| `react-router` | 7.18 | Data mode via `createBrowserRouter`; import from `react-router`, not `react-router-dom`. |
| `tailwindcss` + `@tailwindcss/vite` | 4.3 | CSS-first configuration. There is no `tailwind.config.js`. Tokens live in `@theme` inside `src/styles/index.css`. |
| `motion` | 14.3 | Import from `motion/react`. |
| `lucide-react` | 1.57 | **Contains no brand icons.** GitHub, LinkedIn and Instagram marks must be local SVG components. |
| `typescript` | 6.0 | Strict typing; discriminated unions for content and actions. |

No other runtime dependency is required by this specification. Do not add Redux, Zustand, `clsx`, `tailwind-merge`, a drag library, or a UI kit.

---

## Table of contents

1. [Product vision and design principles](#1-product-vision-and-design-principles)
2. [Visual identity and design tokens](#2-visual-identity-and-design-tokens)
3. [Component hierarchy and responsibilities](#3-component-hierarchy-and-responsibilities)
4. [Window manager state model](#4-window-manager-state-model)
5. [Routing and URL synchronization](#5-routing-and-url-synchronization)
6. [Content data model](#6-content-data-model)
7. [Window sizing, positioning and layering](#7-window-sizing-positioning-and-layering)
8. [Responsive behavior](#8-responsive-behavior)
9. [Accessibility standards](#9-accessibility-standards)
10. [Motion and interaction specifications](#10-motion-and-interaction-specifications)
11. [Tailwind CSS conventions](#11-tailwind-css-conventions)
12. [Implementation guidelines and architectural decisions](#12-implementation-guidelines-and-architectural-decisions)

---

## 1. Product vision and design principles

### 1.1 Vision

The portfolio is a small, personal operating system that runs in the browser. Visitors arrive at a desktop, open folders, and launch documents that describe the owner's work: who they are (About Me), what they have shipped for clients and for themselves (Projects), and what they are tinkering with (Experiments).

The working name of the visual identity is **Warm Workstation**. It borrows the *interaction grammar* of a desktop (icons, a top menu bar, a bottom taskbar, a Start menu, windows that stack) and pairs it with the *material* of the current site: deep ink, warm paper type, and a rust accent. The default theme is dark and calm: the desktop and the windows share the same ink, with light type and — in folders — a floating sidebar. A light theme turns those same roles onto paper. Rust, moss and amber stay the palette's own accents. The result should feel like a well-kept personal machine, not a skin of someone else's OS.

### 1.2 Design principles

| # | Principle | What it means in practice |
| --- | --- | --- |
| 1 | **Familiar grammar, original material.** | Every interaction a Windows user expects (double-click to open, click taskbar to restore, title bar to drag) works as expected. No Aero glass gradients, no Windows logos, no copied icons or sounds. |
| 2 | **Content first, chrome second.** | Chrome is thin, quiet and consistent. Window bodies use real document typography. Decoration never competes with project content. |
| 3 | **Nothing is lost.** | Opening a window never closes another. Minimizing never destroys state. Only an explicit close removes a window. |
| 4 | **The URL tells the truth.** | The address bar always points at the content in the foreground window, so links can be shared and refreshed. |
| 5 | **Rewards for the curious, not toll booths for everyone.** | Developer details (monospaced paths, file extensions, item counts, a tray clock) are present but small. There is no fake boot screen, no artificial loading delay, no animation that blocks input. |

### 1.3 Explicit non-goals

- A literal Windows 7 clone or any use of Microsoft trademarks, wallpapers, icon art or sounds.
- A right-click context menu. The browser context menu stays intact in v1.
- Multiple desktops, file system writes, drag-and-drop of icons, or icon rearrangement.
- Persisting window layout across page reloads (see §12, ADR-08).

---

## 2. Visual identity and design tokens

All tokens are declared in `src/styles/index.css` inside `@theme`, which makes Tailwind generate utilities for them (`bg-window`, `text-fg-muted`, `rounded-window`, `shadow-window-active`, `font-mono`, `text-label`, `ease-os-out`, ...). Components consume **semantic** tokens only. Raw palette tokens exist so that semantic tokens have a single place to point to.

### 2.1 Raw palette

The ink, paper and rust ramps extend the existing tokens (`--color-ink #1c1915`, `--color-muted #4f493f`, `--color-paper #f3efe7`, `--color-sand #e6dfd2`, `--color-line #ddd4c4`, `--color-accent #8d3d1b`), which keep their exact values in the new ramps.

| Token | Hex | Role |
| --- | --- | --- |
| `--color-ink-950` | `#14110e` | Desktop base |
| `--color-ink-900` | `#1c1915` | Primary text on light; taskbar base (existing `ink`) |
| `--color-ink-800` | `#2a251f` | Raised dark surfaces (Start menu panels) |
| `--color-ink-700` | `#3a342c` | Dark borders, dark hover |
| `--color-ink-600` | `#4f493f` | Muted text on light (existing `muted`) |
| `--color-ink-500` | `#6b6357` | Subtle text on light, inactive title text |
| `--color-ink-400` | `#8a8174` | Decorative only (icons, dividers). **Never text on light.** |
| `--color-ink-300` | `#b5ab9c` | Muted text on dark |
| `--color-paper-50` | `#fbf8f2` | Window body |
| `--color-paper-100` | `#f3efe7` | Sunken fields, inactive title bar (existing `paper`) |
| `--color-paper-200` | `#e6dfd2` | Active title bar (existing `sand`) |
| `--color-paper-300` | `#ddd4c4` | Hairlines on light (existing `line`) |
| `--color-paper-400` | `#c9bea9` | Folder back panel, scrollbar thumb |
| `--color-rust-300` | `#e3a07c` | Accent and focus on dark surfaces |
| `--color-rust-500` | `#b4532a` | Projects folder label |
| `--color-rust-600` | `#8d3d1b` | Primary accent on light (existing `accent`) |
| `--color-rust-700` | `#6e2f14` | Accent pressed |
| `--color-moss-600` | `#4d7c4f` | About Me folder label; "live" status |
| `--color-amber-600` | `#b7791f` | Experiments folder label; "in progress" status |
| `--color-danger-600` | `#b42318` | Close-button hover background |

### 2.2 Semantic color tokens

Components consume semantic tokens only. The dark theme is the default (`@theme` in `src/styles/index.css`). The light theme is the same list of roles remapped on `html[data-theme="light"]`. There is no per-window color scope and no `data-surface` attribute: desktop, windows, taskbar and menus all read the active theme.

The choice is stored in `localStorage` under `portfolio-theme` and painted on `<html>` before the bundle runs, so a saved light theme does not flash dark. The menu bar's right side holds a two-segment switch (sun for light, moon for dark). Language is the menu beside that switch. The Start menu no longer carries appearance or language.

| Semantic token | Dark (default) | Light | Use |
| --- | --- | --- | --- |
| `--color-desktop` | `ink-950` | `paper-200` | Wallpaper base |
| `--color-window` | `ink-950` | `paper-50` | Window body |
| `--color-sunken` | `ink-800` | `paper-100` | Sidebar, code blocks, image placeholders |
| `--color-titlebar` | `ink-950` | `paper-100` | Active title bar |
| `--color-titlebar-inactive` | `ink-900` | `paper-50` | Inactive title bar |
| `--color-edge` | `rgb(251 248 242 / 0.16)` | `rgb(28 25 21 / 0.14)` | Window outer border |
| `--color-line` | `rgb(251 248 242 / 0.10)` | `paper-300` | Hairlines inside windows |
| `--color-edge-dark` | `ink-700` | `rgb(28 25 21 / 0.12)` | Taskbar and menu dividers |
| `--color-indicator` | `ink-300` | `ink-600` | Open-window taskbar indicator |
| `--color-indicator-muted` | `ink-400` | `ink-400` | Minimized dot, resize-handle lines (decorative) |
| `--color-fg` | `paper-50` | `ink-900` | Primary text on windows |
| `--color-fg-muted` | `ink-300` | `ink-600` | Secondary text on windows |
| `--color-fg-subtle` | `ink-300` | `ink-500` | Inactive titles |
| `--color-fg-inverse` | `paper-50` | `ink-900` | Text on the desktop, taskbar and Start menu |
| `--color-fg-inverse-muted` | `ink-300` | `ink-600` | Secondary text on the desktop and taskbar |
| `--color-accent` | `rust-300` | `rust-600` | Links, primary buttons |
| `--color-accent-strong` | `rust-500` | `rust-700` | Pressed or hovered accent |
| `--color-accent-on-dark` | `rust-300` | `rust-600` | Taskbar indicator, Start monogram, desktop selection ring |
| `--color-on-accent` | `ink-950` | `paper-50` | Text on `accent` and `accent-on-dark` fills |
| `--color-focus` | `rust-300` | `rust-600` | Focus ring |
| `--color-selection` | `rgb(251 248 242 / 0.14)` | `rgb(141 61 27 / 0.12)` | Selected tile in a window |
| `--color-selection-desktop` | `rgb(141 61 27 / 0.85)` | `rgb(141 61 27 / 0.14)` | Selected icon label on the desktop |
| `--color-taskbar` | `rgb(28 25 21 / 0.82)` | `rgb(251 248 242 / 0.88)` | Taskbar and Start menu glass |
| `--color-chrome-hover` | `rgb(251 248 242 / 0.08)` | `rgb(28 25 21 / 0.06)` | Hover inside a window |
| `--color-chrome-press` | `rgb(251 248 242 / 0.16)` | `rgb(28 25 21 / 0.12)` | Pressed control inside a window |
| `--color-glass-hover` | `rgb(251 248 242 / 0.10)` | `rgb(28 25 21 / 0.06)` | Hover on taskbar and Start menu |
| `--color-glass-active` | `rgb(251 248 242 / 0.16)` | `rgb(28 25 21 / 0.10)` | Active taskbar item |
| `--color-danger` | `danger-600` | `danger-600` | Danger fill |
| `--color-traffic-close` / `-minimize` / `-zoom` | `danger-600` / `amber-600` / `moss-600` | same | Active traffic-light discs |
| `--color-traffic-idle` | `ink-700` | `ink-500` | Inactive traffic-light discs |
| `--color-traffic-glyph` | `ink-950` | `ink-950` | Glyph on a traffic-light disc |
| `--color-folder-about` / `-projects` / `-experiments` | `moss-600` / `rust-500` / `amber-600` | same | Folder accent (content only; the icon is the shared Finder blue) |

Wallpaper glows and window shadows are theme values too (`--wallpaper-glow`, `--wallpaper-moss`, `--wallpaper-dot`, and the four `--shadow-*` tokens). Light shadows are softer and the menu shadow keeps a 1px ink ring so the panel separates from the paper desktop.

### 2.3 Contrast pairs (WCAG 2.2 AA, verified)

The pairs below are the **light** theme. In the dark theme, `fg` (`paper-50`) on `window` (`ink-950`) is above 14:1, `fg-muted` (`ink-300`) on `ink-950` is about 8:1, `accent` and the focus ring (`rust-300` on `ink-950`) are about 8.6:1, and `on-accent` (`ink-950`) on `rust-300` is the same pair. `selection-desktop` stays a rust chip with paper type in dark, and a light rust wash with ink type in light, so the label and its fill flip together.

| Foreground | Background | Ratio | Allowed for |
| --- | --- | --- | --- |
| `fg` `#1c1915` | `window` `#fbf8f2` | ~16:1 | All text |
| `fg-muted` `#4f493f` | `window` / `sunken` | ~7.7:1 | All text |
| `fg-subtle` `#6b6357` | `sunken` `#f3efe7` | ~5.2:1 | Text at any size |
| `accent` `#8d3d1b` | `window` | ~6.5:1 | Links, small text, focus ring |
| `fg-inverse` `#fbf8f2` | `taskbar` over `desktop` | >14:1 | All text |
| `fg-inverse-muted` `#b5ab9c` | `ink-900` | ~8:1 | Secondary text on dark |
| `rust-300` `#e3a07c` | `ink-950` | ~8.6:1 | Focus ring and indicators on dark |
| `fg-inverse` | `selection-desktop` | ~6.8:1 | Selected desktop label |
| `paper-50` | `danger-600` `#b42318` | ~6.3:1 | Close icon on hover |

`ink-400` (`#8a8174`) reaches only ~3.3:1 on paper and is restricted to non-text decoration. Status and active state are never communicated by color alone; there is always a shape, weight or text change as well (see §2.10).

### 2.4 Typography

| Family token | Stack | Use |
| --- | --- | --- |
| `--font-sans` | `-apple-system, BlinkMacSystemFont, Inter, ui-sans-serif, system-ui, sans-serif` | All UI, body text, and headings |
| `--font-mono` | `'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace` | Paths, file names, the clock, item counts, technology chips |

The Google Fonts link in `index.html` loads Inter (weights 400, 500, 600, plus italic 400) and JetBrains Mono. On Apple platforms `-apple-system` resolves to San Francisco; Inter is the open stand-in everywhere else. Headings use the same sans as the body, at `font-semibold`.

Type scale (semantic `--text-*` tokens with paired `--text-*--line-height`):

| Token / utility | Size | Line height | Weight | Use |
| --- | --- | --- | --- | --- |
| `text-meta` | 12px (0.75rem) | 16px | 400–500 | Status bar, mono metadata, tray clock, taskbar overflow badge |
| `text-label` | 13px (0.8125rem) | 18px | 500 | Icon labels, taskbar item titles, Start menu items |
| `text-ui` | 14px (0.875rem) | 20px | 600 for titles, 500 for controls | Window titles, buttons, toolbar |
| `text-body` | 15px (0.9375rem) | 24px | 400 | Window document body |
| `text-heading` | 18px (1.125rem) | 26px | 600 | Section headings inside documents |
| `text-title` | 24px (1.5rem) | 30px | 600 | Document title |
| `text-display` | 32px (2rem) | 38px | 600 | About Me hero name |

Rules:

- Never go below 12px. Uppercase is used only for `text-meta` category eyebrows, with `tracking-wider`.
- Body copy is capped at `max-w-prose` (65ch) even when a window is maximized.
- Truncation (`truncate`) is allowed for titles in title bars and taskbar items, always paired with the full title as the accessible name and `title` attribute.
- Tabular figures (`tabular-nums`) for the clock and any counts.

### 2.5 Spacing

Tailwind 4's default `--spacing: 0.25rem` already gives a 4px scale (`p-1` = 4px). Use only these steps: `0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16`. Do not redefine `--spacing`.

| Context | Value | Utility |
| --- | --- | --- |
| Gap between title-bar icon, title and controls | 8px | `gap-2` |
| Title bar horizontal padding | 12px | `px-3` |
| Folder window body padding | 16px | `p-4` |
| Document window body padding | 24px (16px below `md`) | `p-4 md:p-6` |
| Between paragraphs in documents | 16px | `space-y-4` |
| Heading to its first paragraph | 8px | `mt-2` |
| Between document sections | 32px | `mt-8` |
| Icon grid gap (desktop and windows) | 8px | `gap-2` |
| Taskbar internal padding / item gap | 8px / 4px | `px-2 gap-1` |
| Desktop safe gutter around windows and icons | 16px | constant `GUTTER = 16` (§7) |

Layout constants that JavaScript also needs (taskbar height, title bar height, gutter, cascade step) live in `src/os/windows/WindowsHelpers/geometry.ts` **and** are mirrored as plain custom properties on `:root` (`--os-taskbar-h`, `--os-titlebar-h`) for use in `calc()`. Those are not `@theme` tokens because they don't need utilities.

### 2.6 Radius and borders

| Token | Value | Utility | Use |
| --- | --- | --- | --- |
| `--radius-window` | 10px | `rounded-window` | Window frame (0 when maximized or on mobile) |
| `--radius-menu` | 12px | `rounded-menu` | Start menu, switcher sheet |
| `--radius-control` | 6px | `rounded-control` | Window controls, buttons, address field, taskbar items |
| `--radius-tile` | 8px | `rounded-tile` | Icon tile hover/selection plate |
| `--radius-chip` | 4px | `rounded-chip` | Technology chips, status pills |

Borders are always 1px. Windows use `border border-edge`, inner dividers use `border-line`, and dark surfaces (taskbar divider, Start menu groups, switcher rows) use `border-edge-dark`. A window additionally has a 1px top inner highlight (`inset 0 1px 0 rgb(255 255 255 / 0.6)`) baked into its shadow token so the paper edge reads crisp on the dark wallpaper.

### 2.7 Elevation

| Token / utility | Value | Use |
| --- | --- | --- |
| `shadow-window` | `inset 0 1px 0 rgb(255 255 255 / 0.6), 0 1px 2px rgb(20 17 14 / 0.12), 0 8px 24px rgb(20 17 14 / 0.28)` | Inactive window |
| `shadow-window-active` | `inset 0 1px 0 rgb(255 255 255 / 0.6), 0 1px 2px rgb(20 17 14 / 0.16), 0 18px 48px rgb(20 17 14 / 0.45)` | Active window |
| `shadow-menu` | `0 12px 32px rgb(0 0 0 / 0.45), 0 0 0 1px rgb(251 248 242 / 0.06)` | Start menu, switcher, tooltips |
| `shadow-taskbar` | `0 -1px 0 rgb(251 248 242 / 0.06), 0 -8px 24px rgb(0 0 0 / 0.25)` | Taskbar |

Depth is communicated by shadow **and** title bar color together. Maximized windows drop the outer shadow and radius.

### 2.8 Desktop background

The wallpaper is pure CSS (zero image bytes), defined once as `@utility bg-wallpaper`:

1. Base fill `--color-desktop`.
2. A warm glow: `radial-gradient(60rem 40rem at 85% 10%, rgb(110 47 20 / 0.28), transparent 70%)`.
3. A cool counterweight: `radial-gradient(50rem 36rem at 10% 100%, rgb(77 124 79 / 0.12), transparent 70%)`.
4. A dot grid: `radial-gradient(rgb(251 248 242 / 0.06) 1px, transparent 1px)` at `background-size: 24px 24px`.
5. Grain: an SVG `feTurbulence` data-URI layered by `DesktopBackground` as an absolutely positioned `::after` at `opacity: 0.06` with `mix-blend-mode: overlay`. It is static (no animated noise).

At the bottom-right of the desktop, above the taskbar, a single monospaced line in `text-meta text-fg-inverse-muted` reads the owner's handle and build (`tomaslevy@portfolio ~ v1`). It is decorative, `aria-hidden`, and hidden below `md`.

### 2.9 Window chrome anatomy

```
┌──────────────────────────────────────────────────────────────┐ ← radius-window, theme frame, no accent stripe
│ [●][●][●]  Projects                                          │ ← title bar, h-10, lights then the title
│ ┌────────────┐                                               │
│ │ About Me   │                                               │
│ │ Projects   │     icon grid                                 │ ← sidebar floats: inset, rounded, bg-sunken
│ │ Experiments│                                               │
│ └────────────┘                                               │
│ /Desktop/Projects                                   3 items  │
└──────────────────────────────────────────────────────────────┘
```

| Part | Spec |
| --- | --- |
| Frame | `rounded-window border border-edge bg-window overflow-hidden flex flex-col`; `shadow-window` or `shadow-window-active`. No accent stripe. Colors come from the active theme in §2.2. |
| Title bar | `h-10 px-2.5 flex items-center gap-2 select-none`; `bg-titlebar` when active, `bg-titlebar-inactive` when inactive. Traffic lights lead. The visible title is the `h2` immediately after them (`text-ui font-semibold`, `text-fg` active, `text-fg-subtle` inactive, `truncate` plus a `title` attribute). Cursor: `default` (not `move`); the title bar is grabbable only in desktop layout. |
| Controls | Leading edge, tight cluster, order: Close, Minimize, Zoom (`toggleMaximize`). Each control is a 12px disc inside a 20px hit (`size-5`), 44×44 on coarse pointers and below `md`. Glyphs (`X`, `Minus`, `Square` / `Copy`, `aria-hidden`, `text-traffic-glyph`) are hidden until the cluster is hovered or focused. Active: Close `bg-traffic-close`, Minimize `bg-traffic-minimize`, Zoom `bg-traffic-zoom`. Inactive: `bg-traffic-idle`, and the active colors return on hover. Zoom is omitted for `dialog` windows and below `lg`. |
| Folder chrome | The folder name lives in the title bar, beside the lights. From `md` up, a floating sidebar (`w-44 rounded-menu bg-sunken`, inset by padding, not a flush column) lists desktop folders. The current row is `bg-window` with `aria-current="page"`. The icon grid and the path/count line occupy the remaining column and scroll without moving the sidebar. Below `md` there is no sidebar. |
| Toolbar | Document windows may keep action buttons (`ButtonLink`). Folder windows do not repeat the title under the lights. |
| Body | `flex-1 min-h-0 overflow-y-auto overscroll-contain`. Padding per §2.5. |
| Status bar | Folder windows only: one quiet line, path in mono on the left and the item count on the right (`text-meta text-fg-muted`). |
| Resize handle | Eight hits inside the chrome (§7.7). Edges and corners are 8px; the bottom-right grip stays 16×16, `cursor-nwse-resize`, three diagonal 1px lines in `indicator-muted`. Only in desktop layout on resizable presets. |

### 2.10 Icons

**Folder icons** (`src/icons/FolderIcon.tsx`) share one blue folder silhouette, displayed at 48px. A Lucide glyph sits on the front face in `#165f96`: `User` (About Me), `BriefcaseBusiness` (Projects), `FlaskConical` (Experiments).

**File icons** (`src/icons/FileIcon.tsx`) use a 40×48 sheet with a 10px folded corner, `paper-50` fill, `ink-900/15` stroke, and a 16px Lucide glyph by kind:

| Kind | Glyph | Corner fold color |
| --- | --- | --- |
| `project` | `AppWindow` | `rust-500` |
| `experiment` | `FlaskConical` | `amber-600` |
| `profile` | `FileText` | `moss-600` |
| `system` (not found) | `FileQuestionMark` | `ink-400` |

If a project has a `cover` image, folder windows may show it as a 40×48 cropped thumbnail inside the same sheet silhouette (`object-cover`, rounded to match), keeping the folded corner on top.

**Brand icons** (`src/icons/brand.tsx`): `GitHubMark`, `LinkedInMark` and `InstagramMark` are single-color inline SVGs using `currentColor`. They accept the same `size` and `className` props as Lucide icons so they're interchangeable.

**Icon drawings.** `FolderIcon` takes `accent` and `FileIcon` takes `kind`. Shortcuts and the taskbar pass those values from the opened component. `iconMap.ts` remains for the older string ids; new tiles do not add a `fileToRender` string.

### 2.11 Taskbar

- Fixed to the bottom, full width, `h-12` (48px) on `md` and up, `h-14` (56px) plus `pb-[env(safe-area-inset-bottom)]` below `md`.
- `bg-taskbar backdrop-blur-md shadow-taskbar`, `z-1000`. Color comes from the active theme.
- Layout, from left to right:
  1. Start button: a 48×40 button with a custom monogram glyph (the owner's initials in `font-mono` set inside a rounded square) and no "Start" text. Accessible name: "Start".
  2. Pinned links: GitHub, LinkedIn, Instagram (40×40 icon buttons). Hidden below `md`, where they're only in the Start menu.
  3. A 1px `border-edge-dark` divider.
  4. The window list: `TaskbarWindowItem`s, in opening order. Order does not change on focus.
  5. The tray on the right: the clock in `font-mono text-body font-semibold tabular-nums`, 24-hour `HH:mm`, with the short date underneath in `text-meta text-fg-inverse-muted`. Both update on the minute boundary and follow the active language.

**Taskbar item visual states** (40px tall, `rounded-control`, `px-2 gap-2`, 16px icon, `text-label` title, `max-w-48` with `truncate`, `min-w-10`):

| State | Background | Indicator (bottom, centered, 2px tall) | Title |
| --- | --- | --- | --- |
| Open, in background | none | 12px wide, `bg-indicator` | `text-fg-inverse` |
| Active (`aria-pressed="true"`) | `bg-glass-active` | 24px wide, `bg-accent-on-dark` | `text-fg-inverse font-semibold` |
| Minimized | none | 4px dot, `bg-indicator-muted` | `text-fg-inverse-muted italic` |
| Hover (any) | `bg-glass-hover` | unchanged | unchanged |
| Pressed | `bg-glass-active` plus `scale-97` | unchanged | unchanged |

When items don't fit, they shrink to icon-only (`min-w-10`, title visually hidden but still the accessible name). If they still don't fit, the overflow collapses into a "+N" button that opens the same switcher sheet used on mobile (§8.3).

### 2.12 Interaction state matrix

Each interactive element implements the states below. Visual differences always include at least one non-color cue.

| Element | Hover | Pressed | Selected | Focus-visible | Disabled | Minimized / inactive |
| --- | --- | --- | --- | --- | --- | --- |
| Desktop icon | Tile plate `bg-glass-hover` | Plate `bg-glass-active` | Label gets a `bg-selection-desktop` pill and the plate gets a 1px `ring-accent-on-dark/60` | `focus-ring` (resolves to `rust-300` on the dark surface), around the tile | n/a | n/a |
| File tile in a window | Plate `bg-chrome-hover` | Plate `bg-chrome-press` | Plate `bg-selection` plus a 1px `ring-accent/40`, label `font-semibold` | `focus-ring` (`rust-600`) | n/a | When the window is inactive, the selection ring turns neutral (`window-inactive:ring-indicator-muted`) |
| Window control | `bg-chrome-hover` (close: `bg-danger`) | `bg-chrome-press` | n/a | Outline inset 2px (`-outline-offset-2`) | n/a | Inactive window: icons `text-fg-subtle` |
| Taskbar item | See §2.11 | | `aria-pressed` = active | 2px `rust-300` outline | n/a | See §2.11 |
| Start menu item | `bg-glass-hover` | `bg-glass-active` | n/a | Same as hover plus outline | `opacity-50`, `aria-disabled`, not focusable | n/a |
| `ButtonLink` (in windows) | Underline thickness 2px → `text-accent-strong` | `translate-y-px` | n/a | 2px `rust-600` outline | `opacity-50`, rendered as `<span>` | n/a |
| Window frame | n/a | n/a | n/a | n/a | n/a | Inactive: `shadow-window`, `bg-titlebar-inactive`, no accent line, muted title. Minimized: `hidden` + `inert`. |

Disabled controls are rare by design. Missing project links are omitted, not shown disabled.

### 2.13 Menu bar

- Fixed to the top, full width, 40px (`--os-menubar-h`) plus `pt-[env(safe-area-inset-top)]`. `bg-taskbar backdrop-blur-md border-b border-edge-dark`, `z-1000`. Same glass as the taskbar. The extra height is vertical padding around the controls.
- Left: the focused window's title in `text-label font-semibold`. With no focused window, that title is `site.name`. It is a label, not a menu.
- Right, in one cluster: the language button (`EN` or `ES`, with an inline SVG flag, never an emoji), which opens a menu of `menuitemradio`s aligned to the button's right edge, then the theme switch. The switch is a `radiogroup`: a sun segment and a moon segment on `bg-segment-track`. The selected segment uses `bg-segment text-segment-fg shadow-segment`.
- The desktop icon grid pads its top by the menu bar. The window layer starts at `top: calc(var(--os-menubar-h) + env(safe-area-inset-top))`. `viewportFromWindow` subtracts `MENUBAR_H` (40) and the taskbar (48, or 56 below `md`). Safe-area insets stay in CSS.

---

## 3. Component hierarchy and responsibilities

### 3.1 Tree

```mermaid
flowchart TD
  RouterProvider --> DesktopEnvironment
  DesktopEnvironment --> LayoutProvider
  LayoutProvider --> WindowProvider
  WindowProvider --> RouteWindowSync
  WindowProvider --> DesktopBackground
  WindowProvider --> Desktop
  WindowProvider --> WindowManagerBehavior
  WindowProvider --> TaskbarBehavior
  WindowProvider --> LiveAnnouncer
  Desktop --> DesktopGrid
  DesktopGrid --> IconGridBehavior
  IconGridBehavior --> IconGrid
  IconGrid --> FolderShortcut
  IconGrid --> FileShortcut
  FolderShortcut --> IconTile
  WindowManagerBehavior --> WindowManager
  WindowManager --> WindowBehavior
  WindowBehavior --> Window
  Window --> WindowTitleBar
  WindowTitleBar --> WindowControls
  Window --> WindowBody
  Window --> WindowResizeHandle
  WindowBody --> OpenedDocument
  OpenedDocument --> FolderComponent
  OpenedDocument --> FileComponent
  OpenedDocument --> NotFoundDocument
  FolderComponent --> FolderIconGrid
  FolderIconGrid --> IconGridBehavior
  TaskbarBehavior --> Taskbar
  Taskbar --> StartButton
  Taskbar --> StartMenuBehavior
  StartMenuBehavior --> StartMenu
  Taskbar --> PinnedLinks
  Taskbar --> TaskbarWindowList
  TaskbarWindowList --> TaskbarWindowItem
  Taskbar --> WindowSwitcherBehavior
  WindowSwitcherBehavior --> WindowSwitcher
  Taskbar --> TrayClock
```

### 3.2 Responsibilities

`IconTile` is the shared tile (structure, states, keyboard). `DesktopGrid` and `FolderIconGrid` are the two public grids; both still export from `IconGrid.tsx` and render `IconGridBehavior`. `FolderShortcut` and `FileShortcut` are the tiles the author writes; `FolderIcon` and `FileIcon` stay the SVG drawings. `WindowContent` is named `WindowBody`. `WindowStateContext`, `WindowDispatchContext`, `ThemeContext`, and `IconGridContext` stay. There is no `WindowManagerContext`. The author composes the desktop, each folder, and each file by children. A catalog built when those modules load is only an index of `id` and `path`, not the tree.

A shell paints. The Behavior beside it owns that subtree's state and effects. `Taskbar`, `Window`, `StartMenu`, `WindowSwitcher`, `WindowManager`, and `IconGrid` have no `useState` and no `useEffect`. `StartButton`, `TaskbarWindowItem`, and `WindowControls` have no Behavior. `LayoutProvider` wraps `WindowProvider` from the outside and is the only layout context (`layoutMode` and `viewport`, one `matchMedia` subscription). `viewportFromWindow(layoutMode)` is the only viewport formula: desktop and tablet subtract 48 plus the 40px menu bar, mobile subtracts 56 plus the 40px menu bar, and safe-area insets stay in the bar CSS. A context exists only when several shells read the value. `panel` is `TaskbarBehavior` state. `liveBounds` is `WindowBehavior` state. `instance.bounds` stays the canonical desktop non-maximized rect. `WindowErrorBoundary` stays a class.

| Category | Component / module | Responsibility | Must not |
| --- | --- | --- | --- |
| **Structural** | `DesktopEnvironment` | The single route component. Owns the full-viewport shell (`h-dvh overflow-hidden`), mounts `LayoutProvider` outside `WindowProvider`, and renders `TaskbarBehavior` and `WindowManagerBehavior`. Renders the page `<h1>` (visually hidden) and skip links. | Hold window state itself. Render the `Taskbar` or `WindowManager` shells. |
| Structural | `LayoutProvider` | The only layout context: `layoutMode`, `viewport`, and the stable readers `readLayoutMode` and `readViewport` (a ref assigned during the provider render, so dispatch reads the same viewport). One `matchMedia` subscription for the layout queries (§8.1). That effect writes mode and viewport. `viewportFromWindow(layoutMode)` in `geometry.ts` is the only viewport formula: desktop and tablet subtract 48 (`TASKBAR_H`) plus 40 (`MENUBAR_H`), mobile subtracts 56 plus 40. Safe-area insets stay in the bar CSS. | Listen to `resize`. Own a second `matchMedia`. Hold window state. |
| Structural | `DesktopBackground` | Wallpaper layer; handles `pointerdown` on empty desktop (clears selection, dispatches `BLUR`). | Render icons. |
| Structural | `Desktop` | The desktop the author writes: a `DesktopGrid` whose children are `FolderShortcut`s (`folder={AboutMeFolder}` and the other two). | Dispatch window actions. The shortcut calls `openContent`. |
| Structural | `WindowManagerBehavior` | Three separate single-effect hooks. `useViewportSync` listens to `resize`, writes the context viewport with `viewportFromWindow(readLayoutMode())`, and dispatches `VIEWPORT_CHANGED` only in desktop layout. It does not subscribe to `matchMedia` and does not dispatch on the first mount. `useClosedWindowAnnounce` only announces closed windows. `useCloseFocus` runs the close-focus choreography. | Fold announce, focus, and viewport into one effect. |
| Structural | `WindowManager` | Shell. Maps windows to `WindowBehavior` inside `AnimatePresence`. No `useState`, no `useEffect`. | Reorder DOM nodes when focus changes. Listen for resize, announce closes, or move focus on close. |
| Structural | `WindowBehavior` | State and effects for one window. Calls `useWindowDrag` and `useWindowResize`. `liveBounds` is its state. It calls `displayBounds` and is the only writer of the frame `style` (`transform`, `width`, `height`, `zIndex`) the shell receives (`liveBounds ?? displayBounds(instance, layoutMode, viewport)`). `pointerup` commits one `MOVE` or `RESIZE` and clears `liveBounds`. `Escape` clears `liveBounds` without an action, so the shell paints `displayBounds` again (the `pointerdown` rect). `pointercancel` commits. Clamps stay `clampPosition` and `clampBounds`. No Motion drag. Calls `resolvePhase` during render. It is the `memo` boundary, with props `instance`, `isActive`, `zIndex`, and `layoutMode`. | Store `liveBounds` in the reducer. Write `el.style` from the shell. |
| Structural | `Window` | The only frame. Applies the `style` it receives. Composes `WindowTitleBar` and `WindowBody`. No `useState`, no `useEffect`. | Be returned by a folder or a document. Call `displayBounds`. |
| Structural | `WindowTitleBar` | Traffic lights, drag start, double-click to maximize. The `<h2>` paints `children`. The `title` string stays for the tooltip, control names, `aria-labelledby`, announce, and the taskbar. | Contain content actions. |
| Structural | `WindowBody` | Scroll container, `Suspense` fallback (skeleton), `WindowErrorBoundary` (stays a class). Memoized on document `id`, `instance.id`, and `isActive` (and `requestedPath` for the not-found dialog) so a drag does not re-render the document. The document element is `OpenedDocument`, itself memoized without `isActive`, so focus does not redraw it. | Look up content by a `kind` switch. |
| Structural | `WindowResizeHandle` | One edge or corner hit (`n`, `e`, `s`, `w`, `ne`, `nw`, `se`, `sw`) in desktop layout. The opposite side or corner stays anchored. Only `se` draws the grip. | Exist below `lg`. Cover `WindowControls`. |
| Structural | `TaskbarBehavior` | Owns `panel`, the Start button and switcher refs, and the node focus returns to. Applies `panelAfterLayoutChange` in a layout effect when `layoutMode` changes, and returns focus when the panel closes. Renders the `Taskbar` shell. | Store `panel` on `WindowProvider`. |
| Structural | `Taskbar` | Shell. Layout of the Start button, pinned links, window list and tray. Receives data and callbacks. No `useState`, no `useEffect`. | Keep its own list of windows. Own `panel`. |
| **Presentational** | `DesktopGrid`, `FolderIconGrid` | Public exports of `IconGrid.tsx` (`variant="desktop"` or `variant="window"`). Each renders `IconGridBehavior`. Children are shortcuts. They do not receive `items`. | Dispatch window actions. Own selection or roving. Links are not children; they stay on the taskbar. |
| Presentational | `IconGridBehavior` | Owns `selectedId`, roving (`useRovingGrid`), and the `clearSelection` handle. Builds the `IconGridContext` value shortcuts read. Renders the `IconGrid` shell. | Dispatch window actions. |
| Presentational | `IconGrid` | Shell. Roving-tabindex listbox, 2D arrow navigation, hint "Press Enter to open.", and the `IconGridContext` provider. No `useState`, no `useEffect`. | Own selection or roving. |
| Presentational | `FolderShortcut`, `FileShortcut` | One tile. `folder={AboutMeFolder}` or `file={ProfileFile}`. Draws `FolderIcon` (`accent`) or `FileIcon` (`kind`) from the component it already holds, then calls `openContent`. | Accept a string name (`fileToRender`, `folderToRender`) or rename the SVG components. |
| Presentational | `IconTile` | Icon plus label plus optional file-name line; `desktop` and `window` variants. | Manage selection itself. |
| Presentational | `WindowControls` | Three buttons with accessible names; calls handlers it receives. No Behavior. | Decide what minimize means. |
| Presentational | `StartButton` | Menu button. No Behavior. | |
| Presentational | `StartMenuBehavior` | One effect focuses the requested item. Another listens for `pointerdown` on `document`. Passes the keyboard handler to the shell. | Put state or effects on `StartMenu`. |
| Presentational | `StartMenu` | Shell. Menu with the full keyboard pattern it receives. Places are the folder components. Elsewhere links use `href`s from `site.ts`. No `useState`, no `useEffect`. | Call `getContent`. |
| Presentational | `TaskbarWindowItem` | One button per window instance. Click: restore/focus, or minimize if already active. Middle click (`auxclick`, button 1) closes. Registers its DOM rect for the minimize animation target. No Behavior. | Derive state on its own. |
| Presentational | `WindowSwitcherBehavior` | One effect focuses the sheet. Another listens for an outside pointer. Escape, blur, and focus when a row closes are callbacks passed to the shell. | Put state or effects on `WindowSwitcher`. |
| Presentational | `WindowSwitcher` | Shell. Sheet listing all windows with restore and close (mobile and overflow). No `useState`, no `useEffect`. | |
| Presentational | `TrayClock`, `PinnedLinks` | Small leaf components. | |
| Presentational | Folder components (`AboutMeFolder`, `ProjectsFolder`, `ExperimentsFolder`) | The window body, not a `Window`. One parent: sidebar plus `FolderIconGrid`. Files are written as `FileShortcut` children. Sidebar rows are the same folder components the desktop lists, and they open with `originId`. Empty grid shows the folder's `emptyText`. | Call `getChildren`. Return `<Window>`. |
| Presentational | File components (`ProfileFile`, project files, experiment files) | The document only: the markup that used to live in the profile, project, and experiment windows. | Return `<Window>`. |
| Presentational | `NotFoundDocument` | "File not found" dialog for a path no component registered. "Open Projects" calls `openContent(ProjectsFolder)`. | Be a catalog row. |
| Presentational | `ProjectCard` (existing, restyled) | Used inside `ProfileFile`'s "Selected work" strip; activating a card calls `openContent` on that project component. | Link with `<Link>` directly. |
| **State** | `windowReducer.ts` | Pure transitions (§4.4). `instance.bounds` stays the canonical desktop non-maximized rect. | Touch the DOM, router or `Date.now()` (sequence numbers come from state). Store `panel` or `liveBounds`. |
| State | `windowPhase.ts` | Pure phase helpers, no React: `resolvePhase`, `phaseOnMinimizedChange`, `phaseOnConcealed`. `WindowBehavior` calls `resolvePhase` during render and does not `setState` from it. | Import React. |
| State | `panelState.ts` | Pure panel helpers, no React: `toggleStart`, `openStartFromKey`, `closeStart`, `toggleSwitcher`, `closeSwitcher`, `panelAfterLayoutChange`. The last returns `null` when the panel is `switcher` and the mode is no longer mobile, so the switcher does not reopen on the next narrow layout. | Import React. |
| State | `WindowProvider.tsx` | `useReducer`, exposes `WindowStateContext` and `WindowDispatchContext`. `readViewport` returns the layout context's viewport. | Hold `panel` or `liveBounds`. Compute the viewport itself. |
| State | `useWindowActions.ts` | Action creators that dispatch **and** perform the matching navigation (§5.3). This is the only place UI calls into the window manager. | |
| State | `selectors.ts` | `selectActiveId`, `selectTaskbarItems`, `selectZIndex`, `selectNextActive`, `selectByContentId`. | |
| State | `taskbarAnchors.ts` | A ref-based `Map<WindowId, HTMLElement>` in its own context, for minimize/restore animation targets. Not React state. | Trigger renders. |
| **Content** | `src/content/*` | Desktop, folder, and file components. Each openable declares `id`, `path`, `title`, and `preset` on the component. Importing the modules fills a path/id index (§6). `site.ts` stays the name, role, and external URLs. | Put JSX in the reducer. Keep a second JSON tree of folders and files. |
| Content | `src/icons/*` | `FolderIcon` (`accent`) and `FileIcon` (`kind`) drawings, plus brand marks. Shortcuts are not these files. | |
| **Routing** | `src/os/routing/RoutingHelpers/paths.ts` | Pure `resolvePath(pathname)` and `pathFor(contentId)`, against the component index. | Use hooks. Consult a content registry. |
| Routing | `RouteWindowSync` (a component wrapping `useRouteWindowSync`) | Turns location changes into idempotent `OPEN`/`SHOW_DESKTOP` dispatches; drives `DocumentMeta`. Renders `null` + `DocumentMeta`. | Navigate. |
| Routing | `DocumentMeta` (existing) | Title, description, canonical link, now fed by the resolved route content. | |

### 3.3 File layout

```
src/
  main.tsx                        RouterProvider, MotionConfig reducedMotion="user"
  app/router.tsx                  route table (§5.1)
  os/
    DesktopEnvironment.tsx
    desktop/DesktopBackground.tsx
    grid/IconGrid.tsx                 DesktopGrid, FolderIconGrid (shell)
    grid/IconGridBehavior.tsx         selection, roving, clearSelection
    grid/FolderShortcut.tsx  FileShortcut.tsx
    grid/GridComponents/IconTile.tsx
    taskbar/Taskbar.tsx  TaskbarBehavior.tsx
    taskbar/panelState.ts             pure panel transitions
    taskbar/TaskbarComponents/StartButton.tsx  StartMenu.tsx  StartMenuBehavior.tsx  PinnedLinks.tsx
    taskbar/TaskbarComponents/TaskbarWindowItem.tsx  WindowSwitcher.tsx  WindowSwitcherBehavior.tsx  TrayClock.tsx
    taskbar/TaskbarHelpers/taskbarAnchors.ts
    windows/Window.tsx  WindowBehavior.tsx
    windows/windowPhase.ts            pure phase transitions
    windows/WindowsComponents/WindowManager.tsx  WindowManagerBehavior.tsx  WindowTitleBar.tsx  WindowControls.tsx
    windows/WindowsComponents/WindowBody.tsx  NotFoundDocument.tsx  WindowResizeHandle.tsx  WindowErrorBoundary.tsx
    windows/WindowsHelpers/geometry.ts  presets.ts  useWindowDrag.ts  useWindowResize.ts  useLayoutMode.ts  LayoutProvider.tsx
    state/WindowProvider.tsx
    state/StateHelpers/types.ts  windowReducer.ts  selectors.ts  useWindowActions.ts
    routing/RouteWindowSync.tsx
    routing/RoutingHelpers/paths.ts
    a11y/LiveAnnouncer.tsx
    a11y/A11yHelpers/announce.ts  useRovingGrid.ts
    theme/ThemeProvider.tsx
    theme/ThemeHelpers/theme.ts
    motion.ts                     durations, easings, variants
  content/
    catalog.ts  site.ts  desktop.tsx  FolderChrome.tsx  ShellGlyph.tsx
    about/AboutMeFolder.tsx  ProfileFile.tsx  ExperienceFile.tsx  SkillsFile.tsx  ContactFile.tsx
    projects/ProjectsFolder.tsx  CatalogStorefrontFile.tsx  OperationsDeskFile.tsx
    experiments/ExperimentsFolder.tsx  LayoutStudyFile.tsx
  icons/FolderIcon.tsx  FileIcon.tsx  brand.tsx  iconMap.ts
  components/                     reused leaf components (below)
  lib/cn.ts
  styles/index.css
```

### 3.4 Disposition of existing code

| Existing file | Fate |
| --- | --- |
| `src/data/site.ts`, `skills.ts`, `projects.ts` | Move to `src/content/`. `site` gains `instagramUrl`. Projects gain `year`, `status`, `origin`, `parent` and `ImageAsset` dimensions. The experimental entry (`layout-study`) moves to `experiments.ts`. |
| `components/seo/DocumentMeta.tsx` | Kept unchanged. |
| `components/ui/TechList.tsx`, `projects/ProjectGallery.tsx`, `projects/ProjectVisual.tsx`, `ui/ButtonLink.tsx` | Kept and restyled with semantic tokens; used inside windows. |
| `components/projects/ProjectCard.tsx` | Kept for the About Me "Selected work" strip. Replace `<Link>` with a button that calls `openContent`, and remove the hover lift (it's a document now, not a page). |
| `components/ui/MissingContent.tsx` | Its copy pattern moves into `NotFoundWindow`; the file is deleted after migration. |
| `pages/*`, `app/layouts/MainLayout.tsx`, `navigation/Header.tsx`, `navigation/Footer.tsx`, `ui/Container.tsx`, `ui/SectionHeading.tsx`, `ui/Reveal.tsx`, `projects/ProjectCatalog.tsx`, `projects/ProjectGrid.tsx` | Retired. Scroll-reveal animations do not fit window bodies. |

---

## 4. Window manager state model

### 4.1 Types

```ts
// src/os/state/StateHelpers/types.ts
export type ContentId =
  | `folder:${string}` | `project:${string}` | `experiment:${string}`
  | `profile:${string}` | `system:${string}`;
export type PresetName = 'folder' | 'document' | 'profile' | 'dialog';
export type WindowId = `win:${ContentId}`; // 'win:project:catalog-storefront'
export type LayoutMode = 'desktop' | 'tablet' | 'mobile';

export interface Bounds {
  x: number; // px, relative to the desktop area's top-left (taskbar excluded)
  y: number;
  width: number;
  height: number;
}

export interface Viewport {
  width: number; // desktop area width
  height: number; // desktop area height = innerHeight - taskbar height
}

export interface WindowInstance {
  id: WindowId;
  contentId: ContentId; // the component; resolved outside the reducer
  preset: PresetName;    // copied at OPEN so geometry does not import JSX
  minimized: boolean;
  maximized: boolean;
  bounds: Bounds; // last un-maximized desktop bounds
  openedAt: number; // monotonically increasing sequence; taskbar order
  meta?: { requestedPath?: string }; // only for 'system:not-found'
}

export interface WindowState {
  windows: Readonly<Record<WindowId, WindowInstance>>;
  order: readonly WindowId[]; // stacking order, back → front; includes minimized windows
  activeId: WindowId | null;
  seq: number; // next openedAt value
  lastPlaced: { x: number; y: number } | null; // cascade anchor
}

export type WindowAction =
  | { type: 'OPEN'; contentId: ContentId; preset: PresetName; viewport: Viewport; originId?: WindowId; meta?: WindowInstance['meta'] }
  | { type: 'FOCUS'; id: WindowId } // also restores if minimized
  | { type: 'MINIMIZE'; id: WindowId }
  | { type: 'CLOSE'; id: WindowId }
  | { type: 'TOGGLE_MAXIMIZE'; id: WindowId }
  | { type: 'MOVE'; id: WindowId; x: number; y: number; viewport: Viewport }
  | { type: 'RESIZE'; id: WindowId; bounds: Bounds; viewport: Viewport }
  | { type: 'BLUR' } // click on empty desktop
  | { type: 'SHOW_DESKTOP' } // minimize every window
  | { type: 'VIEWPORT_CHANGED'; viewport: Viewport };
```

### 4.2 Canonical versus derived

| Value | Canonical or derived | Source |
| --- | --- | --- |
| Window identity | Canonical | `id = win:${contentId}`; deterministic, therefore stable across re-opens and StrictMode double effects. |
| Content shown | Canonical | `contentId`. The component is resolved from the index outside the reducer. |
| Title, icon, path | **Derived** | `Component.title`, its glyph, and `pathFor(contentId)`. Never stored as a content record. |
| Preset name | Canonical (cached) | Copied from the component at open time so geometry stays pure. |
| Preset (size rules) | Derived | `presetFor(preset)`. |
| Visible or minimized | Canonical | `minimized`. |
| Active window | Canonical, single value | `activeId`. `isActive = id === activeId`. No per-window `isActive` booleans. |
| Invariant | | `activeId` is `null` or the ID of a **non-minimized** window. |
| Stacking | Canonical | `order`. `zIndex = 100 + order.indexOf(id)`. |
| Taskbar items | Derived | `Object.values(windows).sort(by openedAt)`. The taskbar can never show a window that doesn't exist. |
| Visible bounds | Derived | `maximized ? fullArea(viewport) : bounds`, adjusted by layout mode (§7, §8). |
| Scroll position, selection in folders, gallery index, form input, demo state | Component-local | Lives inside the mounted window subtree; survives minimize because windows stay mounted. |
| Last focused element in a window | Component-local ref | Used to restore focus (§9.5). |
| Drag-in-progress position | Ref only | Committed with one `MOVE` on pointer up. |

### 4.3 Window lifecycle

```mermaid
stateDiagram-v2
  [*] --> Active: OPEN (new instance)
  Active --> Background: another window FOCUS or OPEN
  Background --> Active: FOCUS (click, taskbar, OPEN same content)
  Active --> Minimized: MINIMIZE or taskbar click on active item
  Background --> Minimized: MINIMIZE
  Minimized --> Active: FOCUS or OPEN same content
  Active --> Unfocused: BLUR (click on desktop)
  Unfocused --> Active: FOCUS
  Active --> [*]: CLOSE
  Background --> [*]: CLOSE
  Minimized --> [*]: CLOSE (from switcher)
  Unfocused --> [*]: CLOSE
```

"Unfocused" is a window that is visible but not active because the user clicked the empty desktop. It is rendered exactly like "Background".

### 4.4 Reducer transitions

All transitions are pure. Any transition that would not change state returns the **same object reference**; this is what makes route-driven dispatches idempotent (§5.4).

| Action | Preconditions | Result |
| --- | --- | --- |
| `OPEN` (content already has a window) | `windows[id]` exists | `minimized = false`, move `id` to the end of `order`, `activeId = id`. If it was already active and visible, return the same state. |
| `OPEN` (new) | `windows[id]` missing | Create the instance with `bounds = placeWindow(preset, viewport, originBounds ?? lastPlaced)` (§7.3), `openedAt = seq`; `seq + 1`; append to `order`; `activeId = id`; `lastPlaced = bounds.xy`. |
| `FOCUS` | Exists | Same as OPEN-existing. |
| `MINIMIZE` | Exists, not minimized | `minimized = true`. If it was active: `activeId = selectNextActive(state, id)`, which is the topmost non-minimized window other than `id`, or `null`. `order` is unchanged. |
| `CLOSE` | Exists | Remove from `windows` and `order`. If it was active, `activeId = selectNextActive`. If `lastPlaced` came from it, keep it (cascade continues). |
| `TOGGLE_MAXIMIZE` | Exists, preset is resizable, desktop layout | Flip `maximized`. `bounds` keeps the restore geometry. Also focuses the window. |
| `MOVE` | Exists, not maximized | `bounds.x/y = clampPosition(...)`. |
| `RESIZE` | Exists, not maximized, resizable | `bounds = clampBounds(...)` with preset min and max. |
| `BLUR` | Any | `activeId = null`. Same reference if already `null`. |
| `SHOW_DESKTOP` | Any | Every window `minimized = true`, `activeId = null`. Same reference if nothing changes. |
| `VIEWPORT_CHANGED` | Any | Re-clamp every window's `bounds` (§7.5). Same reference if no bounds changed. |

There is no separate `RESTORE` action: restoring is `FOCUS` on a minimized window, which keeps the "restore implies focus" rule in one place.

### 4.5 Instance policy

- **One instance per content id, always.** `OPEN` of an existing id focuses or restores it. This covers folders, projects, experiments, profile files and the not-found window. Multiple instances of the same document have no use case in a portfolio and would make the URL ambiguous.
- `system:not-found` is also single-instance. Opening it again with a different `requestedPath` updates `meta` and focuses it.
- **External links** never create windows. They render as real `<a target="_blank" rel="noopener noreferrer">` elements, using URLs from `site.ts`.

### 4.6 What survives what

| Event | Window instance | Bounds | Mounted subtree (scroll, selection, gallery, demo) | Taskbar item |
| --- | --- | --- | --- | --- |
| Focus change | kept | kept | kept (no re-render of content) | kept |
| Minimize | kept | kept | kept, hidden with `hidden` + `inert` | kept, minimized style |
| Restore | same instance | same | same | active style |
| Layout mode change (resize across breakpoints) | kept | kept in state; displayed geometry changes | kept | kept |
| Close | destroyed | destroyed | unmounted | removed |
| Page reload | rebuilt from the URL only (§5) | default placement | lost | only the routed window |

---

## 5. Routing and URL synchronization

### 5.1 Route table

| URL | Resolves to | Notes |
| --- | --- | --- |
| `/` | `{ type: 'desktop' }` | Desktop with no focused window. |
| `/folder/:folderSlug` | `folder:<slug>` | `about`, `projects`, `experiments`. |
| `/projects/:slug` | `project:<slug>` | Matches the existing site's URLs, so old links keep working. |
| `/experiments/:slug` | `experiment:<slug>` | |
| `/about/:slug` | `profile:<slug>` | `profile`, `experience`, `skills`, `contact`. |
| `/about` | redirect (replace) → `/folder/about` | Convenience alias. |
| `/projects` | redirect (replace) → `/folder/projects` | Preserves the existing site's listing URL. |
| anything else, or a known pattern with an unknown slug | `system:not-found` with `requestedPath` | The URL is left as typed. |

`src/app/router.tsx`:

```ts
import { createBrowserRouter, redirect } from 'react-router';
import { DesktopEnvironment } from '../os/DesktopEnvironment.tsx';

export const router = createBrowserRouter([
  { path: '/about', loader: () => redirect('/folder/about') },
  { path: '/projects', loader: () => redirect('/folder/projects') },
  { path: '*', Component: DesktopEnvironment },
]);
```

One splat route renders `DesktopEnvironment` for every content URL. Because it's the same route match for all of them, navigation between content URLs **never unmounts the desktop or its windows**. Static redirect routes outrank the splat, and the loaders redirect before anything renders. Path parsing is a pure function built on React Router's `matchPath`:

```ts
// src/os/routing/RoutingHelpers/paths.ts
export type RouteTarget =
  | { type: 'desktop' }
  | { type: 'content'; contentId: ContentId }
  | { type: 'not-found'; requestedPath: string };

export function resolvePath(pathname: string): RouteTarget;
export function pathFor(contentId: ContentId): string | null; // null for system:not-found
```

`resolvePath` returns `content` only when a component registered that path; otherwise it returns `not-found`.

### 5.2 What is in the URL, and what isn't

| In the URL | Transient UI state (never in the URL) |
| --- | --- |
| The content of the **foreground (active) window**, if it's routable. | The set of other open windows. |
| | Minimized state, z-order, bounds, maximized state. |
| | Selection in folders, scroll, gallery index, Start menu open state. |

**URL follows focus.** That's the single rule. The router never describes the entire desktop, and the desktop never derives its window list from the router.

### 5.3 User actions → navigation (`useWindowActions`)

Each UI-facing action dispatches to the reducer and then, if needed, navigates. Navigation is skipped whenever the target path equals `location.pathname`.

| Action creator | Dispatch | Navigation |
| --- | --- | --- |
| `openContent(component, { originId? })`: double-click or Enter on a shortcut, Start menu item, `ProjectCard` | `OPEN` with `contentId` and `preset` | **push** `component.path` |
| `focusWindow(id)`: pointerdown inside a window, or a taskbar click on an inactive or minimized item | `FOCUS` | **replace** with `pathFor(contentId)` |
| `minimizeWindow(id)`: control button, or taskbar click on the active item | `MINIMIZE` | If it was active: **replace** with the next active window's path, or `/` |
| `closeWindow(id)` | `CLOSE` | If `resolvePath(location.pathname)` points at this window's content: **replace** with the next active window's path, or `/`. Otherwise no navigation. |
| `toggleMaximize`, `move`, `resize` | respective action | none |
| `blurAll()`: pointerdown on empty desktop | `BLUR` | none (the URL keeps pointing at the last focused content, which is harmless and avoids history noise) |

Non-routable windows (`system:not-found`) never cause navigation when focused.

**Why only `openContent` pushes.** History entries represent "content the visitor chose to open". Re-focusing an existing window is a desktop gesture, not navigation; pushing on every click between two windows would make the back button useless. Replacing keeps the address bar truthful without polluting history.

### 5.4 Navigation → state (`useRouteWindowSync`)

`RouteWindowSync` runs one effect keyed on `location.pathname`:

```ts
const target = resolvePath(location.pathname);
switch (target.type) {
  case 'content':   dispatch({ type: 'OPEN', contentId: target.contentId, preset: opened.preset, viewport: getViewport() }); break;
  case 'not-found': dispatch({ type: 'OPEN', contentId: 'system:not-found', preset: 'dialog', viewport: getViewport(), meta: { requestedPath: target.requestedPath } }); break;
  case 'desktop':   dispatch({ type: 'SHOW_DESKTOP' }); break;
}
```

This effect **only dispatches; it never navigates**. `useWindowActions` navigates but never reacts to location. Data flows one way in each direction, and the reducer's same-reference returns make the second hop a no-op. So there's no loop and no need for a `source: 'user' | 'router'` flag:

```mermaid
sequenceDiagram
  participant User
  participant Actions as useWindowActions
  participant Reducer as windowReducer
  participant Router as React Router
  participant Sync as RouteWindowSync
  User->>Actions: double-click "Catalog storefront"
  Actions->>Reducer: OPEN project:catalog-storefront
  Reducer-->>Reducer: create + activate
  Actions->>Router: navigate push /projects/catalog-storefront
  Router->>Sync: pathname changed
  Sync->>Reducer: OPEN project:catalog-storefront
  Reducer-->>Sync: same state (already active), no re-render
  User->>Router: browser Back
  Router->>Sync: pathname /folder/projects
  Sync->>Reducer: OPEN folder:projects
  Reducer-->>Reducer: focus or restore folder, project window stays open
```

`SHOW_DESKTOP` on `/` is the deliberate meaning of "go back to the desktop": every window minimizes and nothing closes. Going forward again restores the window through `OPEN`.

### 5.5 Event-by-event synchronization

| Scenario | Window state | URL / history |
| --- | --- | --- |
| Open content from the desktop or a folder | New or focused instance; the parent folder stays open | push |
| Open content that already has a window | Existing instance focused or restored | push (if the path differs) |
| Focus a window by clicking it | Brought to front | replace |
| Taskbar click, inactive item | Restored and focused | replace |
| Taskbar click, active item | Minimized; next window active | replace with the next path, or `/` |
| Minimize via control | Same as above | replace |
| Restore from the taskbar or switcher | Same instance, same state | replace |
| Close the active window, others open | Removed; next topmost visible window active | replace with its path, or `/` |
| Close a background window that isn't the current route | Removed | none |
| Close the not-found window | Removed | replace with the next path, or `/` |
| Browser Back or Forward to a content URL | `OPEN` → focus, restore or recreate (if it was closed). Other windows untouched. | (browser-driven) |
| Browser Back or Forward to `/` | `SHOW_DESKTOP` (all minimized) | (browser-driven) |
| Direct load or refresh of a content URL | The desktop renders with that one window open, active, at default placement | none |
| Direct load of `/` | Empty desktop | none |
| Unknown path or unknown slug | Not-found window, active; URL left as typed | none |
| `/about`, `/projects` | Redirect loader | replace to the folder route |

### 5.6 Document metadata

`RouteWindowSync` renders `DocumentMeta` from the **resolved route**, not from `activeId`, so title and canonical always match the address bar:

- Content: `title = "${component.title} — ${site.name}"`, `description = component.summary ?? site.description`.
- Desktop: `title = "${site.name} — ${site.role}"`, `description = site.description`.
- Not found: `title = "File not found — ${site.name}"`.

The README's static-host SPA fallback remains required and sufficient: every route is client-side.

---

## 6. Content data model

The desktop, each folder, and each file are components composed by children. There is no `getChildren` and no `ContentItem.parent` tree. Copy (paragraphs, technologies, experience, skills) lives in the file component's JSX. `site.ts` stays: name, role, URLs, `siteUrl`. External links are URL data, not windows.

### 6.1 What a component declares

The shell cannot read those facts from JSX, so each openable component declares them on the function:

```ts
ProfileFile.id       // 'profile:profile'
ProfileFile.path     // '/about/profile'
ProfileFile.title    // 'Profile'
ProfileFile.preset   // 'profile' | 'folder' | 'document' | 'dialog'
```

Folders also carry `emptyText` and a folder glyph (`accent`). Files carry `fileName` when the tile shows one, and a file glyph (`kind`). Projects and experiments may carry `summary` for the document description. Nothing else is a content JSON record.

Presets keep the measurements in `WindowsHelpers/presets.ts`: folder → `folder`, project and experiment → `document`, profile → `profile`, not-found → `dialog`.

### 6.2 The tree the author writes

```tsx
<DesktopGrid ariaLabel="Desktop">
  <FolderShortcut folder={AboutMeFolder} />
  <FolderShortcut folder={ProjectsFolder} />
  <FolderShortcut folder={ExperimentsFolder} />
</DesktopGrid>

<FolderIconGrid ariaLabel={`${AboutMeFolder.title} contents`}>
  <FileShortcut file={ProfileFile} />
  <FileShortcut file={ExperienceFile} />
  <FileShortcut file={SkillsFile} />
  <FileShortcut file={ContactFile} />
</FolderIconGrid>
```

`ProjectsFolder` and `ExperimentsFolder` list their files the same way. A folder returns one parent (sidebar + grid), not a `Window`. A file returns only the document. `WindowManager` is the only call site of `Window`.

`DesktopGrid` and `FolderIconGrid` share selection, `useRovingGrid`, the hint "Press Enter to open.", and `clearSelection`. They do not take `items` and they do not dispatch. The shortcut calls `openContent(component)`. Opening from a folder passes `originId`, so the folder stays open.

The prop that opens is the component. `fileToRender="ProfileFile"` and any name→component map are the registry again, and they are not used. `FolderShortcut` / `FileShortcut` are not `FolderIcon` / `FileIcon`.

### 6.3 Paths

| Component | `id` | `path` | `preset` |
| --- | --- | --- | --- |
| About Me | `folder:about` | `/folder/about` | `folder` |
| Projects | `folder:projects` | `/folder/projects` | `folder` |
| Experiments | `folder:experiments` | `/folder/experiments` | `folder` |
| Profile, Experience, Skills, Contact | `profile:profile` (and `experience`, `skills`, `contact`) | `/about/:slug` | `profile` |
| Each project | `project:<slug>` | `/projects/:slug` | `document` |
| Each experiment | `experiment:<slug>` | `/experiments/:slug` | `document` |
| Not found | `system:not-found` | none | `dialog` |

Not-found is a system window for a path that matches no component. It is not a row in the index.

Importing the content modules registers each component by `id` and `path`. `resolvePath` and route sync read that index. The reducer stores `contentId` and the preset name. It does not import JSX. `WindowBody` resolves the component from the index and mounts it. The window id stays deterministic: `win:${contentId}` (ADR-02). The title comes from `Component.title` (ADR-07).

The Start menu and pinned links point at the folder components or at `site.ts` hrefs. The folder sidebar lists the same desktop folders and opens them with `originId`.

### 6.4 Window body

```tsx
<Window instance ...>
  <WindowTitleBar title={title}>{title}</WindowTitleBar>
  <WindowBody documentId={id} instanceId={instance.id} isActive={isActive}>
    <OpenedDocument documentId={id} windowId={instance.id} />
  </WindowBody>
</Window>
```

`Window` is `memo`-ized. `WindowManager` does not pass a fresh document element into that memo. `WindowBody`'s comparator uses the stable document id, `instance.id`, and `isActive`. `OpenedDocument` is memoized without `isActive`, so focus does not redraw the document. There is no `renderContent` switch (ADR-10).

## 7. Window sizing, positioning and layering

### 7.1 Presets

| Preset | Used by | Default (w×h) | Min (w×h) | Max (w×h) | Resizable | Maximizable |
| --- | --- | --- | --- | --- | --- | --- |
| `folder` | folders | 720×480 | 400×280 | 1040×760 | yes | yes |
| `document` | projects, experiments | 880×640 | 480×360 | 1280×(area height) | yes | yes |
| `profile` | profile files | 760×600 | 440×360 | 960×880 | yes | yes |
| `dialog` | not-found | 420×220 | fixed | fixed | no | no |

Every preset is further capped by the desktop area: `width ≤ area.width − 2·GUTTER`, `height ≤ area.height − 2·GUTTER`. Min wins over the area cap only in desktop layout. If the area is smaller than min, the layout mode is no longer `desktop` anyway (§8).

### 7.2 Geometry constants (`src/os/windows/WindowsHelpers/geometry.ts`)

```ts
export const TASKBAR_H = 48;        // 56 below md
export const MENUBAR_H = 40;
export const TITLEBAR_H = 40;
export const GUTTER = 16;
export const CASCADE_STEP = 28;
export const MIN_VISIBLE_X = 96;    // px of a window that must stay on screen horizontally
export const DRAG_THRESHOLD = 3;    // px before a pointerdown becomes a drag
```

### 7.3 Initial placement (`placeWindow`)

1. **First window** (`lastPlaced === null`): centered horizontally in the area, and vertically at 45% of the free space so it sits at the optical center.
2. **Opened from within a window** (`originId` given): the origin's `x + 28, y + 28`.
3. **Otherwise:** `lastPlaced + 28` on both axes.
4. If the result would push the window's bottom-right beyond `area − GUTTER`, restart the cascade at `(GUTTER + 2·28, GUTTER + 28)` so restarts are visibly offset from a centered first window.
5. Finally apply `clampPosition`.

Re-opening an existing window never moves it.

### 7.4 Clamping (windows can never be lost)

```
x ∈ [MIN_VISIBLE_X − width,  area.width − MIN_VISIBLE_X]
y ∈ [0,                       area.height − TITLEBAR_H]
```

The title bar can never go above the top edge or under the taskbar, and at least 96px of it is always reachable horizontally. Clamping is applied live during drag, on `MOVE`, on `RESIZE` and on `VIEWPORT_CHANGED`.

### 7.5 Viewport changes

`WindowManager` listens to `resize`, throttled with `requestAnimationFrame`, and dispatches `VIEWPORT_CHANGED`. The reducer shrinks any window whose size exceeds the new area cap (never below min) and re-clamps positions. Maximized windows always fill the area. When the layout mode changes, stored bounds are kept but not displayed (§8), so returning to a wide viewport restores the user's arrangement.

### 7.6 Dragging (desktop layout only)

- Starts on `pointerdown` on the title bar with the primary button, unless the target is inside `WindowControls` (`closest('button')`). The window is focused immediately (§9.5).
- After 3px of movement the drag begins: `setPointerCapture`, and `document.body` gets `select-none`. Each frame updates `liveBounds` in `WindowBehavior`. The Behavior is the only writer: the shell receives `style` (`transform`, `width`, `height`, `zIndex`). Clamps stay `clampPosition` and `clampBounds`. There is no Motion drag.
- `pointerup` commits one `MOVE` and clears `liveBounds`. `pointercancel` commits. `Escape` restores the `pointerdown` bounds by clearing `liveBounds`; `displayBounds` is unchanged.
- Maximized windows can't be dragged; double-clicking the title bar toggles maximize instead.
- The title bar sets `touch-action: none` only in desktop layout.
- No inertia, no snapping, no docking to edges in v1.

### 7.7 Resizing (desktop layout only)

Eight hits, on resizable presets, and only when `canResize` is true (desktop layout, not maximized). They are siblings of `WindowTitleBar`, inside the chrome's `overflow-hidden`, so the rounded frame clips them. Each hit is 8px (`z-10`, `touch-none`, `aria-hidden`). The desktop title bar is 40px and the traffic lights are 20px, centered, so they start about 10px in from the corner; an 8px corner leaves Close, minimize, and zoom clickable. The bottom-right grip stays the visible 16px mark and carries `data-resize-edge="se"`. The other seven hits draw nothing. Cursors: `n`/`s` `ns-resize`, `e`/`w` `ew-resize`, `nw`/`se` `nwse-resize`, `ne`/`sw` `nesw-resize`.

`data-resize-edge` is read from the hit's `currentTarget`. A missing value does not start a gesture. The anchor is the side or corner the pointer does not touch. It keeps the same screen coordinates during the gesture and after `RESIZE`. An edge does not move the perpendicular axis. A corner moves both axes and fixes the opposite corner.

| Hit | Anchor that stays | Free axis |
| --- | --- | --- |
| `e` | Left edge (`origin.x`); `y` and height stay | width |
| `w` | Right edge (`origin.x + origin.width`); `y` and height stay | width, then `x = right − width` |
| `s` | Top edge (`origin.y`); `x` and width stay | height |
| `n` | Bottom edge (`origin.y + origin.height`); `x` and width stay | height, then `y = bottom − height` |
| `se` | Top-left `(origin.x, origin.y)` | width and height |
| `sw` | Top-right `(right, origin.y)` | width and height; `x = right − width` |
| `ne` | Bottom-left `(origin.x, bottom)` | width and height; `y = bottom − height` |
| `nw` | Bottom-right `(right, bottom)` | width and height; `x = right − width`, `y = bottom − height` |

The gesture matches drag: primary button, `setPointerCapture`, `select-none` on `document.body`, and one `requestAnimationFrame` per frame that writes `liveBounds` in `WindowBehavior`. The shell only paints. `pointerup` and `pointercancel` commit one `RESIZE` when the rect changed. `Escape` clears `liveBounds` and does not commit, so the frame returns to the `pointerdown` rect. There is no Motion drag.

Size uses `fitSize`, the same cap as `clampBounds` (preset min and max, and the area minus `2·GUTTER`). If the requested size would push the free edge past that cap or past the `clampPosition` band (`x` in `[MIN_VISIBLE_X − width, area.width − MIN_VISIBLE_X]`, `y` in `[0, area.height − TITLEBAR_H]`), that axis stops at the limit. The window is not translated to keep the title on screen. The rect passed to `RESIZE` is a fixed point of `clampBounds`: after the reducer clamps it, the anchor is still on the origin coordinates. The reducer does not receive the edge. `MOVE` and `VIEWPORT_CHANGED` keep the previous clamp behavior.

The top hits are not children of the title bar, so a resize `pointerdown` does not start a drag. It still bubbles to the frame, which focuses an inactive window. The rest of the title bar drags (3px threshold; double-click maximizes). Resizing has a keyboard-free alternative: the Maximize button. No function in the product requires dragging, which satisfies WCAG 2.5.7.

### 7.8 Layering

| Layer | z-index | Notes |
| --- | --- | --- |
| Wallpaper | 0 | `DesktopBackground` |
| Desktop icons | 10 | |
| Windows | `100 + order index` | Inline `zIndex` on the frame. DOM order stays by `openedAt` so iframes and media never remount when focus changes. |
| Taskbar | 1000 | Always above every window |
| Start menu, switcher sheet | 1100 | |
| Tooltips | 1200 | Native `title` in v1; reserved for custom tooltips |
| Skip links, live region | 1300 | |

There's no cap on open windows. With all content open (fewer than 30 entries in practice), the window z-index range stays far below 1000.

---

## 8. Responsive behavior

### 8.1 Layout modes

`useLayoutMode()` returns a mode from `matchMedia` queries that match Tailwind's default breakpoints. Breakpoints are **not** redefined.

| Mode | Query | Tailwind prefix | Experience |
| --- | --- | --- | --- |
| `desktop` | `(min-width: 1024px)` | `lg:` | Full desktop: free windows, drag, resize, maximize, cascade. |
| `tablet` | `(min-width: 768px) and (max-width: 1023.98px)` | `md:` | Windows are inset sheets: `GUTTER` inset from the area, centered, stacked, not draggable or resizable. Taskbar as on desktop. |
| `mobile` | `(max-width: 767.98px)` | base | Windows are full-screen panels between the top edge and the taskbar; radius 0; only the top window is interactive. |

The mode is passed as a prop from `WindowManager` to `Window`. Geometry is computed as `displayBounds(instance, mode, viewport)`; state bounds are untouched.

### 8.2 Desktop icons

| Mode | Arrangement |
| --- | --- |
| `desktop` | A column-major grid starting top-left with a `GUTTER` inset: `grid-flow-col grid-rows-[repeat(auto-fill,104px)]`, 96×104 tiles. |
| `tablet` | The same tiles, row-major, in the top-left area. |
| `mobile` | A home-screen-style grid: `grid-cols-3` (`sm:grid-cols-4`), centered, 88×100 tiles, 48px icons, `pt-6`. The desktop area scrolls if needed. |

### 8.3 Taskbar and Start menu on small screens

- **Mobile taskbar** (`h-14` + safe area): Start button | a "Windows" button showing `Layers` plus a count badge (`aria-label="Open windows, 3"`) | clock. Pinned social links move into the Start menu only.
- **WindowSwitcher**: a bottom sheet (`rounded-t-menu`, `max-h-[70dvh]`, `bg-taskbar backdrop-blur-md`) listing every window with icon, title and state, a tap target to restore, and a 44×44 close button per row. It's the same component used for desktop overflow.
- **Start menu**: on desktop it's a 320px panel anchored above the Start button (`bottom: TASKBAR_H + 8px; left: 8px`). Below `md` it's a full-width bottom sheet with `max-h-[70dvh]`.

### 8.4 Windows on mobile

- The title bar is `h-12` with 44×44 Minimize and Close buttons. There is no Maximize.
- Opening a window slides it up 16px and fades it in (§10).
- Windows that are not on top get `inert` and `aria-hidden` so screen readers and touch can't reach panels hidden behind the top one. They stay mounted, so state persists.
- Closing reveals the next window in `order`, or the home grid.
- The body scrolls inside the panel with `overscroll-contain`. The page itself never scrolls (`h-dvh overflow-hidden` on the root).
- Swipe gestures are **not** used in v1. Every action has a visible button.

### 8.5 Touch and pointer rules

- Tailwind 4 already applies `hover:` only on devices with `(hover: hover)`, so hover styles never stick on touch.
- `pointer-coarse:` (built into Tailwind 4) raises control hit areas to 44×44: `pointer-coarse:size-11`.
- **Icon activation by pointer type:** `pointerType === 'mouse'` gives single click to select and double click to open. For `touch` and `pen`, a single tap opens. This is decided per event, not per breakpoint, so a touch laptop behaves correctly.
- `index.html`'s viewport meta gains `viewport-fit=cover` so `env(safe-area-inset-bottom)` works.

---

## 9. Accessibility standards

Target: WCAG 2.2 AA. Accessibility rules override aesthetics everywhere.

### 9.1 Semantic structure

| Region | Element and attributes |
| --- | --- |
| Page heading | `<h1 class="sr-only">{site.name} — Portfolio</h1>` inside `DesktopEnvironment` |
| Desktop | `<main aria-label="Desktop">` containing the icon grid and all windows |
| Desktop icons | `IconGrid`: `role="listbox" aria-label="Desktop" aria-orientation="vertical"`. Tiles are `role="option" aria-selected` and `aria-describedby` pointing to the hint "Press Enter to open." |
| Window | `<section role="dialog" aria-modal="false" aria-labelledby={titleId} tabIndex={-1}>`. Minimized windows add `hidden` and `inert`. |
| Window title | `<h2 id={titleId}>` in the title bar. Document content headings start at `<h3>`. |
| Window controls | `<button type="button" aria-label="Minimize Catalog storefront">` (likewise "Maximize …", "Restore …", "Close …"). Icons are `aria-hidden`. |
| Folder contents | `IconGrid` with `aria-label="{folder title} contents"` |
| Taskbar | `<nav aria-label="Taskbar">` |
| Start button | `<button aria-haspopup="menu" aria-expanded aria-controls="start-menu">Start</button>` (visible glyph, text `sr-only`) |
| Start menu | `role="menu" aria-label="Start"`, groups `role="group" aria-label`, items `role="menuitem"`. Links are `<a role="menuitem" target="_blank" rel="noopener noreferrer">` with "(opens in a new tab)" in `sr-only`. |
| Pinned links | `<ul aria-label="Pinned links">` of `<a aria-label="GitHub (opens in a new tab)">` |
| Window list | `<ul aria-label="Open windows">`. Each `TaskbarWindowItem` is a `<button aria-pressed={isActive}>` whose accessible name is `"{title}"`, plus `", minimized"` when minimized. |
| Clock | `<time dateTime>`; not focusable |
| Announcements | One `LiveAnnouncer`: `<div aria-live="polite" class="sr-only">`, announcing "Catalog storefront opened", "… minimized", "… restored" and "… closed". |

ARIA roles only appear where the matching keyboard behavior is implemented (below).

### 9.2 Keyboard map

| Context | Keys | Behavior |
| --- | --- | --- |
| Global | `Tab` / `Shift+Tab` | Native order: skip links → desktop grid (one tab stop) → windows (DOM order) → taskbar |
| Skip links | first `Tab` | "Skip to active window" (only if one exists) and "Skip to taskbar"; visible on focus |
| Icon grid (desktop and folders) | Arrow keys | Move focus and selection in 2D, following the visual grid (column-major on desktop) |
| | `Home` / `End` | First / last item |
| | `Enter` | Open the focused item |
| | `Space` | Select without opening |
| Window | Click or focus anywhere inside | Focuses the window (`FOCUS`) |
| Title bar (desktop) | Double click | Toggle maximize (also available as a button) |
| Start button | `Enter`, `Space`, `ArrowUp` | Open the menu and focus the first item (`ArrowUp` focuses the last) |
| Start menu | `ArrowDown` / `ArrowUp` | Next / previous item, wrapping |
| | `Home` / `End` | First / last |
| | `Enter` | Activate |
| | `Escape` | Close and return focus to the Start button |
| | `Tab` | Close and move focus on naturally |
| Switcher sheet | `Escape` | Close and return focus to the trigger |
| Drag or resize in progress | `Escape` | Cancel and revert geometry |
| Taskbar item | `Enter` / `Space` | Restore or focus, or minimize if active |

**Escape never closes or minimizes windows.** Windows are persistent, non-modal documents; closing must be deliberate.

**No global modifier shortcuts in v1.** Every candidate collides with something: `Ctrl/Cmd+W` closes the browser tab, `Alt+F4` closes the browser, `F6` focuses the address bar, `Alt+Shift` switches the input language on Windows, and the Windows/Meta key is reserved by the OS. Window management is fully reachable through visible buttons and the taskbar, which is more discoverable anyway. Future shortcuts must be scoped to a focused window and must avoid these combinations.

### 9.3 Focus visibility

- Every focusable element uses the `focus-ring` utility: 2px solid `var(--color-focus)`, with a 2px offset (inset 2px on window controls and taskbar items, where outside space is tight).
- The ring color re-scopes on dark surfaces (§2.2), giving at least 3:1 against adjacent colors on both surfaces.
- `outline-none` is never used without an equivalent `focus-visible` replacement.
- Focus is never obscured by the taskbar (WCAG 2.4.11): window bodies end above the taskbar, and focused tiles call `scrollIntoView({ block: 'nearest' })`.

### 9.4 Targets and motion

- Minimum 24×24 on fine pointers (WCAG 2.5.8); 44×44 on coarse pointers through `pointer-coarse:`.
- `MotionConfig reducedMotion="user"` plus the reduced variants in §10.4. No flashing. No parallax. The wallpaper is static.

### 9.5 Focus choreography

Each `Window` tracks its last focused descendant with a `focusin` listener (stored in a ref).

| Event | Focus moves to |
| --- | --- |
| Open (new window) | The window `section` itself (`tabIndex=-1`), so its name is announced. The next `Tab` reaches the first control. |
| Open existing / restore / taskbar focus | The window's last focused descendant, or else the `section` |
| Pointerdown inside an inactive window | Wherever the user clicked. The same click also activates its target, so there's no "click to activate first" swallowing. |
| Minimize (via its control or the taskbar) | The window's taskbar item, so it can be restored with `Enter` |
| Close, other windows visible | The new active window's last focused descendant. In the common case that's the folder tile that opened it. |
| Close, no windows visible | The desktop icon whose subtree contained the closed content (its root folder), or else the first desktop icon |
| Start menu item opens a window | The new window (as in Open) |
| `SHOW_DESKTOP` via Back to `/` | The first desktop icon, only if focus was inside a window that just got hidden |

Opening or restoring a window must never trap focus. Windows are non-modal and `Tab` flows out of them.

---

## 10. Motion and interaction specifications

### 10.1 Tokens (`src/os/motion.ts`, mirrored in `@theme` as `--ease-os-out` and `--ease-os-in` for CSS transitions)

| Token | Value | Use |
| --- | --- | --- |
| `instant` | 80ms | Reduced-motion fades, color changes |
| `fast` | 120ms | Hover, press, title bar active switch, menu close |
| `base` | 180ms | Window open, Start menu open |
| `slow` | 240ms | Minimize and restore |
| `easeOut` | `[0.2, 0, 0, 1]` | Things entering or settling |
| `easeIn` | `[0.4, 0, 1, 1]` | Things leaving |

No springs with overshoot and nothing longer than 240ms. Layout properties (`width`, `height`, `top`, `left`) stay put except the maximize tween, which moves the frame's own box. Everything else animates `transform` and `opacity` only.

### 10.2 Structure

The window frame is a plain `div` that owns geometry: inline `transform: translate3d(x, y, 0)`, `width`, `height` and `zIndex`. Inside it, a `motion.div` owns animation only (`opacity`, `scale`, `x`, `y`). This keeps drag writes and Motion transforms from fighting over one `transform` property.

### 10.3 Per-interaction specification

| Interaction | Animation | Duration / ease | Notes |
| --- | --- | --- | --- |
| Window open | `opacity 0→1`, `scale 0.96→1`, `y 8→0`, origin center | base, easeOut | Via `AnimatePresence initial` on mount |
| Window close | `opacity →0`, `scale →0.97` | fast, easeIn | `AnimatePresence` exit; the reducer removes it immediately, so the taskbar updates at once |
| Minimize | Translate and scale toward the window's taskbar item: `x/y = itemCenter − windowCenter`, `scale 0.25`, `opacity →0` | slow, easeIn | The reducer flips `minimized` immediately. `Window` keeps a local `phase: 'visible' | 'minimizing' | 'hidden'` and applies `hidden` + `inert` in `onAnimationComplete`. If no anchor is registered (overflow, mobile), it falls back to `y 24`, `opacity 0`. |
| Restore | The reverse of minimize | slow, easeOut | Starts from the taskbar item rect. Interruptible: restoring during minimize reverses from the current values. |
| Maximize / restore size | The frame's `transform`, `width`, and `height` move from the previous rect to the next. Border radius follows. The body stays visible. | base, easeOut | Reduced motion jumps. |
| Focus switch | CSS `transition-[box-shadow,background-color,color]` on frame and title bar | fast, `ease-os-out` | No movement |
| Start menu open | `opacity 0→1`, `y 8→0` (mobile sheet: `y 24→0`) | base, easeOut | |
| Start menu close | `opacity →0`, `y →4` | fast, easeIn | |
| Desktop/file tile hover | CSS background-color transition | fast | |
| Tile press | `active:scale-97` (CSS) | fast | |
| Taskbar item appear / disappear | `opacity`, `scale 0.9→1` on mount; exit fade | fast | `AnimatePresence` in the list. No layout animation. |
| Mobile panel open | `y 16→0`, `opacity 0→1` | base, easeOut | |

**Interaction never waits for animation.** State changes are immediate; animations only decorate them, and all of them can be interrupted.

### 10.4 Reduced motion

- `main.tsx` wraps the app in `<MotionConfig reducedMotion="user">`, which makes Motion skip transform animations and keep opacity when the OS requests reduced motion.
- Variants in `motion.ts` also branch on `useReducedMotion()`: every window, menu and taskbar transition becomes **opacity only, 80ms**. Minimize and restore don't travel to the taskbar.
- CSS transforms (`active:scale-97`) get `motion-reduce:transform-none`; transitions get `motion-reduce:transition-none`.
- `html { scroll-behavior: smooth }` stays guarded by the existing media query.

---

## 11. Tailwind CSS conventions

### 11.1 `src/styles/index.css` structure

```css
@import 'tailwindcss';

@theme {
  /* fonts */
  --font-sans: -apple-system, BlinkMacSystemFont, Inter, ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;

  /* raw palette */
  --color-ink-950: #14110e;
  --color-ink-900: #1c1915;
  /* ... full ramps from §2.1 ... */

  /* semantic colors (reference raw tokens; re-scopable) */
  --color-desktop: var(--color-ink-950);
  --color-window: var(--color-paper-50);
  --color-fg: var(--color-ink-900);
  --color-fg-muted: var(--color-ink-600);
  --color-accent: var(--color-rust-600);
  --color-focus: var(--color-rust-600);
  /* ... all of §2.2 ... */

  /* type scale */
  --text-meta: 0.75rem;     --text-meta--line-height: 1rem;
  --text-label: 0.8125rem;  --text-label--line-height: 1.125rem;
  --text-ui: 0.875rem;      --text-ui--line-height: 1.25rem;
  --text-body: 0.9375rem;   --text-body--line-height: 1.5rem;
  --text-heading: 1.125rem; --text-heading--line-height: 1.625rem;
  --text-title: 1.5rem;     --text-title--line-height: 1.875rem;
  --text-display: 2rem;     --text-display--line-height: 2.375rem;

  /* shape, depth, motion */
  --radius-window: 10px;
  --radius-menu: 12px;
  --radius-control: 6px;
  --radius-tile: 8px;
  --radius-chip: 4px;
  --shadow-window: /* §2.7 */;
  --shadow-window-active: /* §2.7 */;
  --shadow-menu: /* §2.7 */;
  --shadow-taskbar: /* §2.7 */;
  --ease-os-out: cubic-bezier(0.2, 0, 0, 1);
  --ease-os-in: cubic-bezier(0.4, 0, 1, 1);
}

:root {
  --os-taskbar-h: 48px;
  --os-titlebar-h: 40px;
}

@custom-variant window-inactive (&:where([data-window]:not([data-active]) *));

@utility focus-ring {
  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@utility bg-wallpaper {
  background-color: var(--color-desktop);
  background-image:
    radial-gradient(60rem 40rem at 85% 10%, rgb(110 47 20 / 0.28), transparent 70%),
    radial-gradient(50rem 36rem at 10% 100%, rgb(77 124 79 / 0.12), transparent 70%),
    radial-gradient(rgb(251 248 242 / 0.06) 1px, transparent 1px);
  background-size: auto, auto, 24px 24px;
}

@layer base {
  /* body, ::selection, reduced-motion rules. Light theme remaps live on html[data-theme='light']. */
}
```

Rules:

- Semantic tokens use regular `@theme` (not `@theme inline`), so utilities resolve `var(--color-focus)` at use time and `html[data-theme='light']` can remap them without touching components.
- Existing token names (`paper`, `ink`, `muted`, `line`, `accent`, `sand`, `--font-serif`) remain as aliases until the retired pages are deleted, then get removed in the same change.
- Dark is the default theme. Light is `data-theme="light"` on `<html>`. Components do not read the theme name for color.

### 11.2 Naming

- Colors: `--color-<role>[-<variant>]` (`fg-muted`, `titlebar-inactive`). Never name colors after components that don't exist.
- Use only semantic utilities in components. Raw ramp utilities (`bg-ink-700`) are allowed only in icon SVGs and the token file.
- Typography: always pair the family and a semantic size: `font-mono text-meta`, `text-ui font-semibold`. Default Tailwind sizes (`text-sm`, `text-lg`) are not used.

### 11.3 State variants

| State | Source of truth in the DOM | Variant |
| --- | --- | --- |
| Selected tile | `aria-selected="true"` | `aria-selected:bg-selection` |
| Active taskbar item | `aria-pressed="true"` | `aria-pressed:bg-glass-active` |
| Expanded Start button | `aria-expanded="true"` | `aria-expanded:bg-glass-active` |
| Active window | `data-active` on the frame (with `data-window`) | `data-active:shadow-window-active`; descendants use `group/window` with `group-data-active/window:bg-titlebar` |
| Inactive window descendants | | `window-inactive:text-fg-subtle` (custom variant above) |
| Minimized taskbar item | `data-minimized` | `data-minimized:italic` |
| Maximized window | `data-maximized` | `data-maximized:rounded-none data-maximized:shadow-none` |
| Coarse pointer | media | `pointer-coarse:size-11` |
| Reduced motion | media | `motion-reduce:transition-none` |

Prefer ARIA variants when an ARIA attribute already expresses the state, so visuals can't drift from semantics. Use `data-*` only for states with no ARIA equivalent.

### 11.4 Focus utility

Every interactive element includes `focus-ring`. Window controls and taskbar items use `focus-ring focus-visible:-outline-offset-2`.

### 11.5 Arbitrary values and inline styles

- Arbitrary values (`[...]`) are allowed only for single-use structural values that aren't design decisions and have no matching token, for example `grid-rows-[repeat(auto-fill,104px)]`, `max-h-[70dvh]` and `pb-[env(safe-area-inset-bottom)]`. They must live in the component's class recipe, not be scattered. A value used twice becomes a token.
- Arbitrary colors, shadows, radii, font sizes and durations are **not allowed**. Use tokens.
- Inline `style` is allowed only for runtime values: window `transform`, `width`, `height` and `zIndex`; the minimize target offsets; and CSS custom properties computed at runtime.

### 11.6 Shared styling: `cn` and recipes

```ts
// src/lib/cn.ts
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
```

`cn` doesn't merge conflicting classes, so recipes must not produce conflicts. Variants **replace** a class group rather than append over it:

```ts
// in IconTile.tsx
const tile = {
  base: 'group flex flex-col items-center gap-1 rounded-tile p-2 text-center focus-ring transition-colors duration-120 active:scale-97 motion-reduce:transform-none',
  desktop: 'w-24 text-fg-inverse hover:bg-glass-hover aria-selected:bg-glass-active',
  window: 'w-24 text-fg hover:bg-chrome-hover aria-selected:bg-selection',
} as const;

<button className={cn(tile.base, tile[variant])} />
```

- Components accept `className` only for **layout placement** by the parent (margins, grid placement), never to restyle internals.
- A class string repeated in 3+ places becomes a component or a recipe entry; a component is preferred when structure is also repeated.
- No `@apply` in component CSS. The only custom CSS lives in `index.css` (`@utility`, base rules).

---

## 12. Implementation guidelines and architectural decisions

### 12.1 Architectural decision records

| ID | Decision | Rationale |
| --- | --- | --- |
| ADR-01 | **`useReducer` + split Context**, no external state library | One small, centralized, pure state machine. The dispatch context is stable, so components that only dispatch never re-render on state changes. |
| ADR-02 | **Deterministic window IDs** (`win:${contentId}`) | Enforces single-instance by construction, makes route-driven `OPEN` idempotent, survives StrictMode double effects. The id comes from `Component.id`. |
| ADR-03 | **URL follows focus**; only `openContent` pushes | Shareable, refreshable URLs without the router owning the desktop. Back and forward walk through opened content, not every click. |
| ADR-04 | **One-way data per direction** (actions navigate; the route effect only dispatches) plus same-reference no-op transitions | Removes feedback loops without a `source` flag or suppression timers. |
| ADR-05 | **Windows stay mounted while minimized** (`hidden` + `inert`) | Preserves all in-window state for free. Cost is negligible at portfolio scale. |
| ADR-06 | **Stable DOM order** by `openedAt`; stacking via inline `zIndex` | Moving DOM nodes on focus would reload iframes and video and reset scroll. |
| ADR-07 | **Title and icon come from the opened component** (`Component.title` and its glyph), not from a `ContentItem` and not stored as a separate content record | The component the shortcut opened is the source of truth. The reducer stores only `contentId`. |
| ADR-08 | **No persistence of window layout across reloads** in v1 | Keeps refresh behavior simple and predictable. A future `sessionStorage` snapshot of `WindowState` (minus bounds of not-found windows) can be added in `WindowProvider` without touching components. |
| ADR-09 | **Custom pointer drag**, not Motion `drag` | Window position must live in the reducer and be clamped. Motion's drag owns its own transform values, which would need constant syncing. |
| ADR-10 | **The opened component is mounted directly** | `WindowBody` renders the component the shortcut opened, resolved from the id index. There is no `renderContent` switch and no `kind` case. |
| ADR-11 | **Folders and the desktop list children in JSX** | `getChildren(parent)` is gone. Adding a file means writing a `FileShortcut` in that folder. |
| ADR-12 | **`role="dialog"` with `aria-modal="false"`** for windows | Announces each window as a named, self-contained surface without implying modality or trapping focus. |
| ADR-13 | **No global keyboard shortcuts** | Every viable combination conflicts with browser or OS shortcuts (§9.2). |
| ADR-14 | **Local brand SVGs** | lucide-react 1.x ships no brand marks. |
| ADR-15 | **No boot screen, no artificial delays** | Respects visitors' time; principle 5. |
| ADR-16 | **A shell has no state and no effects.** One Behavior per subtree. A context exists only when several shells read the value. `liveBounds` is not reducer state. `instance.bounds` remains the last non-maximized desktop rect. | The shell paints; the Behavior owns that subtree's transitions. A gesture writes `liveBounds` every frame and commits once, so the reducer is not copied per frame. `displayBounds` still reads `instance.bounds`. |

### 12.2 Rendering and performance

- `WindowBehavior` is the `memo` boundary, with props `instance`, `isActive`, `zIndex` and `layoutMode`. The reducer preserves object identity for untouched instances, so focusing one window re-renders two frames (the old and new active), not every window.
- `WindowBody` is memoized on the document id, `instance.id`, and `isActive`, and receives no geometry, so a drag commit does not re-render the document. `OpenedDocument` ignores `isActive`, so focus does not redraw it either. The document is not created as a child of `Window` inside `WindowManager`'s map.
- Each frame of a drag or resize updates `liveBounds`. `WindowBody` does not re-render, because its memo ignores geometry.
- Each window body has its own `Suspense` boundary (skeleton: three `bg-sunken` bars) and its own `WindowErrorBoundary` (a small class component). A crashing document breaks only its own window and offers "Close window".
- The clock re-renders once a minute, in its own component.

### 12.3 Images

- Every `ImageAsset` declares `width` and `height`; render them as attributes with `className="h-auto w-full"`.
- Covers: AVIF (with WebP fallback via `<picture>`), max 1600px wide, with an 800w variant in `srcSet`. Files live in `public/projects/<slug>/`.
- `loading="lazy"` and `decoding="async"` on gallery images and folder thumbnails. The cover of a window opened by deep link uses `fetchPriority="high"`.
- Missing images fall back to the existing `ProjectVisual` placeholder, never a broken image.
- The wallpaper and icons are CSS and SVG, with no raster assets.

### 12.4 TypeScript rules

- Openable ids, paths, and presets are declared on the component. `ContentId` and `WindowId` are template-literal types; no bare `string` IDs cross module boundaries.
- Actions are a discriminated union; every `switch` ends with `assertNever`.
- The reducer, selectors, and `geometry.ts` are pure modules with no React imports. `paths.ts` reads the component index and does not use hooks. The reducer stores `contentId`; it does not import JSX.

### 12.5 Extension points

| Future feature | Where it plugs in |
| --- | --- |
| Search | A Start menu field that filters the registered components; results call `openContent`. |
| File previews | A hover or selection preview beside the folder grid. No window manager change. |
| More social links | Add the URL to `site.ts` and a row in the taskbar or Start menu, plus a brand SVG. |
| Project filters | Chips in the projects folder, local state, so they survive minimize. |
| New document | A new component with `id`, `path`, `title`, and `preset`, listed as a `FileShortcut` where it should appear. |
| Layout persistence | ADR-08. |

### 12.6 Build order

1. Tokens, fonts (`index.html`), `cn`, `focus-ring` and `bg-wallpaper` in `index.css`; folder, file and brand icons.
2. Content components (`id`, `path`, `title`, `preset`) and the path index; `paths.ts`.
3. `windowReducer`, selectors, `WindowProvider`, `useWindowActions`.
4. `DesktopEnvironment`, `DesktopBackground`, `DesktopGrid`, shortcuts, `WindowManager`, `Window` chrome (no drag yet), folder bodies.
5. `Taskbar`, `TaskbarWindowItem`, `StartButton`, `StartMenu`, `PinnedLinks`, `TrayClock`.
6. Router switch to the splat route, `RouteWindowSync`, `DocumentMeta` wiring, redirects.
7. `ProjectWindow`, `AboutWindow`, `ExperimentWindow`, `NotFoundWindow` (lazy), reusing `TechList`, `ProjectGallery`, `ProjectVisual`, `ProjectCard`.
8. Drag, resize, maximize, viewport clamping; `useLayoutMode`; tablet and mobile modes; `WindowSwitcher`.
9. Motion variants and reduced-motion paths; `LiveAnnouncer`; focus choreography.
10. Accessibility pass (keyboard-only run-through, screen reader smoke test, contrast spot checks), then delete the retired pages and components and the legacy token aliases.

### 12.7 Definition of done (per feature)

- Works with mouse, keyboard only, and touch.
- No new history entries from minimize, restore or focus.
- Opening, minimizing and closing never lose another window's state.
- `npm run lint` and `npm run build` pass.
- No arbitrary color, shadow, radius, size or duration values; no inline static styles.
