# Gezellig Prototype

Mobile-first Vite/React prototype for the loneliness challenge. Gezellig is an opt-in activity coordination app for Dutch cities: it helps residents turn free moments into shared real-life activities without diagnosis, scoring, or surveillance framing.

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
3. Choose calendar connection or manual time slots.
4. Land on Groups as the home screen.
5. Review activity suggestions with transparent match reasons.
6. Accept an activity.
7. View safety actions.
8. Check Calendar for signed-up or attended meet-ups only.
9. Submit feedback and repeat-meet signal.
10. Open the aggregate municipality dashboard from the header or view toggle.

## Deployment notes

Vercel can deploy this as a standard Vite app:

- Build command: `npm run build`
- Output directory: `dist`
- Node version: current LTS is fine

Do not commit `.vercel` or secret files.

## Design notes

- Current image URLs live in `src/data.ts` under `brandAssets`.
- They are intentionally isolated for easy replacement.
- The welcome screen no longer uses the poorly-cropped Figma screenshot as a hero image.
- The prototype view toggle must show either the mobile app or the dashboard, never both at once.
- Bottom navigation has only Home, Calendar, and Friends. Home maps to Groups.
- Keep new UI built from shared classes in `src/styles.css` rather than page-specific styling.
