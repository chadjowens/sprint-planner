# Sprint Planner

A lightweight, Markdown-native sprint and backlog planner built for developers who work with AI coding tools (Claude Code, Warp Terminal, Cursor).

## Design Philosophy

**Terminal Aesthetic** — dark charcoal base, monospace typography (JetBrains Mono), syntax-highlighting-inspired priority colors. Built to feel like a command center, not a corporate project management tool.

## Features

- **Kanban Board** — Four-column board (Backlog, In Progress, In Review, Done)
- **List View** — Sortable table view with priority, status, effort, and tag columns
- **Item Detail Panel** — Full editing panel with inline Markdown preview, priority/status/effort selectors, sprint assignment, and tag management
- **Markdown Export** — Export entire backlog or individual items as `.md` files. Copy-to-clipboard for instant paste into Claude Code or Warp
- **Sprint Management** — Create sprints with goals, track completion counts, filter by sprint
- **Context Docs** — Store architecture notes, scorecards, and reference docs alongside your backlog
- **Keyboard Shortcuts** — `n` new item, `/` search, `Esc` close panel, `s` new sprint
- **Priority System** — P0 (critical/red), P1 (high/amber), P2 (medium/cyan), P3 (low/mint)
- **Effort Sizing** — XS, S, M, L, XL t-shirt sizing
- **localStorage Persistence** — All data persists in the browser, no backend required
- **Filter & Search** — Filter by priority, status, or search across all items

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Lucide React (icons)
- react-markdown (Markdown rendering)

## Getting Started

```bash
pnpm install
pnpm dev
```

## Deployment

Build for production:

```bash
pnpm build
```

Deploy the `dist/` directory to Netlify, Vercel, or any static hosting.

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

## Seed Data

The app ships pre-seeded with the SuperSymm Content Engine backlog (27 completed items across 4 sprints, plus 8 next-phase items and 3 integration items). Clear localStorage to reset.

## License

MIT
