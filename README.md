# Gesellig Prototype

Mobile-first Vite/React prototype for the loneliness challenge. Gesellig is an opt-in activity coordination app for Dutch cities: it helps residents turn free moments into shared real-life activities without diagnosis, scoring, or surveillance framing.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Demo flow

1. Start with an alias.
2. Pick interests and comfort preferences.
3. Add availability and routines.
4. Review three activity suggestions with transparent match reasons.
5. Accept an activity.
6. View safety actions.
7. Submit feedback and repeat-meet signal.
8. Open the aggregate municipality dashboard.

## Deployment notes

Vercel can deploy this as a standard Vite app:

- Build command: `npm run build`
- Output directory: `dist`
- Node version: current LTS is fine

Do not commit `.vercel` or secret files.

## Design notes

- Current image URLs live in `src/data.ts` under `brandAssets`.
- They are temporary Figma MCP assets and are intentionally isolated for easy replacement.
- The prototype view toggle must show either the mobile app or the dashboard, never both at once.
- Keep new UI built from shared classes in `src/styles.css` rather than page-specific styling.
