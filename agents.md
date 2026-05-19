# Agent Instructions

## Project

This repo contains a one-day prototype for **Gezellig**, an opt-in social activity app for Dutch municipalities.

The product helps residents turn free moments into real-life shared activities. It must not feel like a loneliness app, diagnosis tool, surveillance system, or dating app.

## Core Product Rule

Always preserve this message:

> We do not use AI to detect loneliness. We use AI to reduce the coordination friction that prevents real-life connection.

## Non-Negotiables

- Do not create a loneliness score.
- Do not infer mental health status.
- Do not classify users as lonely, vulnerable, isolated, or at risk.
- Do not expose individual user data to municipalities.
- Do not implement hidden monitoring or surveillance behavior.
- Do not use dating-app patterns such as swiping, attractiveness ranking, or open profile browsing.
- Do not add real AI/LLM calls unless explicitly requested.
- Do not require real names for the prototype.
- Do not use Mozi branding in app UI.
- Do not commit `Supabase_API_KEY.txt`, `.env`, or `.vercel`.
- Keep mobile app and municipality dashboard as separate toggleable views. Never render both at once in the running prototype.

## Prototype Priorities

Optimize for a polished jury demo:

1. Clear resident journey.
2. Transparent matching explanation.
3. Strong privacy and dignity framing.
4. Anonymous municipality impact dashboard.
5. Reliable seeded data over live backend complexity.

## Tech Stack

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- Local seeded data for demo behavior

Supabase can be represented through data shapes and future architecture notes, but the first prototype should not require live Supabase configuration.

## UX Guidelines

- Use positive, normal activity-planner language.
- Prefer phrases like "shared activity," "free moment," "good fit," "public setting," and "comfort preferences."
- Avoid clinical, welfare, or risk language.
- Show a maximum of 3 main suggestions at a time.
- Use clear consent language for optional data sharing.
- Keep flows lightweight and low-pressure.
- Make safe public settings visible in the UI.
- Use icons and compact controls where useful.
- Keep dashboard professional and aggregate-only.
- Keep design mobile-first and close to the Figma direction: warm canvas, black primary actions, orange accent, large iOS-style cards, restrained typography.
- Use reusable style primitives from `src/styles.css`; avoid one-off page styling.
- Keep replaceable image URLs centralized in `src/data.ts` under `brandAssets`.
- Keep Groups as the mobile app home screen.
- Keep bottom navigation limited to Home, Calendar, and Friends.
- Calendar should show only signed-up or attended meet-ups, not free/busy availability.

## Matching Guidance

Use transparent rule-based matching:

- shared interests
- overlapping availability
- rough neighborhood or travel radius
- public-place preference
- one-to-one or small-group comfort
- community-hosted preference
- previous feedback
- repeat-meet preference

Every suggestion should explain why it appears. Good examples:

- "Fits your Thursday evening availability."
- "Public location within your travel radius."
- "Small-group setting matches your comfort choice."
- "3 residents nearby chose museums."

Bad examples:

- "You seem lonely."
- "This user needs help."
- "AI detected isolation."
- "High loneliness risk."

## Data and Privacy

Resident-facing data may include:

- alias or first name
- interests
- comfort preferences
- rough neighborhood
- travel radius
- availability
- routines
- suggestion decisions
- post-activity feedback

Municipality-facing data must be aggregate only:

- accepted suggestions
- completed meetups
- repeat meetups
- popular activity types
- neighborhood engagement
- connection trend

Never show individual-level municipal records in the prototype.

## Implementation Rules

- Keep code simple and demo-reliable.
- Prefer deterministic local state and fixtures.
- Use TypeScript types for core data shapes.
- Avoid overbuilding auth, backend, or admin tooling.
- Keep components small enough to adjust quickly during demo prep.
- Do not introduce dependencies unless they clearly speed up the prototype.
- Preserve responsive behavior for mobile and desktop.
- Use `npm run build` before committing implementation milestones.
- Use `npm run lint` before committing quality or deploy-readiness milestones.

## Testing Checklist

Before considering work done, verify:

- Resident can complete onboarding.
- Resident can choose interests and comfort preferences.
- Resident can add availability.
- Suggestions appear with reasons.
- Accept/reject works.
- Feedback works.
- Repeat-meet choice works.
- Municipality dashboard shows only aggregate data.
- No UI copy labels users as lonely or vulnerable.
- App runs cleanly in local dev.
