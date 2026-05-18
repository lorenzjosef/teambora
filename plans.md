# Plan: Samen Tijd Prototype

## Summary

Build a one-day jury-demo prototype for an opt-in resident activity app that helps Dutch municipalities enable real human connection without labeling, diagnosing, or surveilling residents.

Core message:

> We do not use AI to detect loneliness. We use AI to reduce the coordination friction that prevents real-life connection.

The prototype should feel like a normal, positive activity planner. Users discover it through low-stigma city and community channels, create a light profile, choose interests and comfort boundaries, set availability, receive a small number of relevant activity suggestions, accept or reject them, and give feedback after real-life activities. Municipalities only see anonymous aggregate impact metrics.

## Product Direction

### Product Name

Working name: **Samen Tijd**

Use this as a demo name unless the team chooses another brand.

### Target Users

- Residents who want to make everyday activities more social.
- Municipal teams funding social connection programs.
- Community partners hosting safe public activities.
- Libraries, cafes, universities, sports clubs, museums, and neighborhood partners that can invite residents without stigma.

### Experience Principles

- Never frame the user as lonely, vulnerable, isolated, or at risk.
- Never diagnose, score, or infer mental health.
- Make opt-in consent obvious and reversible.
- Prefer public, safe, low-pressure activities.
- Show a small number of high-quality suggestions instead of an endless feed.
- Make AI explain coordination fit, not personality compatibility.
- Avoid dating-app patterns such as swiping, attractiveness cues, or profile browsing.
- Prefer group or hosted activities by default; use 1:1 only when explicitly selected by the user.
- Show safety affordances even in the demo: public place, cancel, report, block, and host/contact visibility.

### Reach Strategy

The app should not depend on people searching for a "loneliness solution." Entry points should be normal civic or community contexts:

- QR codes and posters at libraries, cafes, universities, sports clubs, museums, community centers, and municipal counters.
- Partner-hosted activities promoted as "make this routine social" or "join others nearby."
- Municipal newsletters and neighborhood pages framed around free-time activities, not social need.
- Optional referral links from residents after a positive activity.
- Future version: privacy-preserving outreach through existing municipal and partner channels, never individual risk targeting.

## Prototype Scope

### Must Have

- Resident onboarding with first name or alias.
- Voluntary preference selection:
  - interests
  - comfort settings
  - rough neighborhood or travel radius
  - availability
  - social routines
- Activity suggestion feed with 3 recommended options.
- Transparent match explanation for each suggestion.
- Accept/reject interaction.
- Post-activity feedback.
- "Meet again" signal for longer-term connection.
- Basic safety controls:
  - public-place indicator
  - cancel/no-show state
  - report/block action
  - community host or venue contact where relevant
- Municipality dashboard with anonymous aggregate metrics.

### Should Have

- Seeded sample residents, activities, and dashboard data.
- Responsive layout for mobile and desktop.
- Clear privacy copy in plain language.
- Visual distinction between resident app and municipality dashboard.

### Out of Scope for One-Day Prototype

- Real authentication.
- Live Supabase CRUD.
- Real calendar integration.
- Real notification delivery.
- Production moderation tools.
- Real AI API calls.
- Individual-level municipal reporting.
- Loneliness scoring or mental-health inference.

## Technical Direction

### Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Seeded local data for demo reliability
- Supabase-ready data shapes, but no live backend dependency for v1 demo

### Suggested App Structure

- Resident flow:
  - onboarding
  - preferences
  - availability
  - suggestions
  - activity detail
  - feedback
- Municipality flow:
  - aggregate dashboard
  - activity type breakdown
  - neighborhood engagement
  - connection trend

### Suggested Core Data Types

```ts
type Interest =
  | "coffee"
  | "cinema"
  | "football"
  | "padel"
  | "walking"
  | "museums"
  | "board_games"
  | "studying"
  | "cooking"
  | "community_events";

type ComfortPreference = {
  oneToOne: boolean;
  smallGroups: boolean;
  publicPlacesOnly: boolean;
  communityHosted: boolean;
};

type AvailabilitySlot = {
  day: string;
  startTime: string;
  endTime: string;
};

type ResidentProfile = {
  id: string;
  displayName: string;
  neighborhood: string;
  travelRadiusKm: number;
  interests: Interest[];
  comfort: ComfortPreference;
  availability: AvailabilitySlot[];
  routines: string[];
};

type ActivitySession = {
  id: string;
  title: string;
  interest: Interest;
  locationName: string;
  neighborhood: string;
  isPublicPlace: boolean;
  isCommunityHosted: boolean;
  hostName?: string;
  groupSize: "one_to_one" | "small_group";
  capacity: number;
  confirmedCount: number;
  time: AvailabilitySlot;
  status: "open" | "accepted" | "completed" | "cancelled";
};

type ActivitySuggestion = {
  id: string;
  sessionId: string;
  title: string;
  interest: Interest;
  locationName: string;
  neighborhood: string;
  isPublicPlace: boolean;
  isCommunityHosted: boolean;
  hostName?: string;
  groupSize: "one_to_one" | "small_group";
  confirmedCount: number;
  capacity: number;
  time: AvailabilitySlot;
  matchScore: number;
  matchReasons: string[];
};

type Feedback = {
  suggestionId: string;
  attended: boolean;
  cancelled?: boolean;
  noShow?: boolean;
  feltComfortable: boolean;
  wantsRepeat: boolean;
  connectionRating: 1 | 2 | 3 | 4 | 5;
  reportedIssue?: boolean;
};
```

### Matching Logic

Use deterministic rule-based scoring for the prototype:

- Shared interest match: high weight.
- Overlapping availability: high weight.
- Public-place and group-size comfort match: hard filter.
- Rough neighborhood or travel radius match: medium weight.
- Community-hosted preference match: medium weight.
- Previous positive feedback or repeat signal: boost.
- Previous rejection: hide or strongly deprioritize.
- Report/block state: always hide.
- Capacity: hide full sessions.

Each suggestion must include human-readable reasons, for example:

- "3 residents nearby chose walking."
- "Fits your Thursday evening availability."
- "Public location within your travel radius."
- "Small-group setting matches your comfort choice."
- "Hosted by a community partner."

Do not write reasons like:

- "You seem lonely."
- "You are at risk."
- "This improves your mental health."
- "Our AI identified you as isolated."

## Demo Path

1. Open resident app.
2. Create alias profile.
3. Select interests: walking, coffee, museums.
4. Select comfort preferences: small groups, public places only.
5. Add Thursday evening availability.
6. View 3 relevant activity suggestions.
7. Open one suggestion and review transparent match reasons.
8. Confirm that it is public, small-group, and has open spots.
9. Accept the suggestion.
10. See cancel/report/block safety actions on the confirmed activity.
11. Submit post-activity feedback.
12. Choose whether to meet again.
13. Open municipality dashboard.
14. Show aggregate metrics updated by accepted/completed meetup.

## Municipality Dashboard

Only show anonymous aggregate insights:

- Suggestions accepted.
- Real-life meetups completed.
- Repeat meetups.
- Popular activity categories.
- Engagement by neighborhood.
- Self-reported connection trend over time.
- Completion rate from accepted suggestions.
- Repeat meetup rate within 30 days.
- Opt-out or cancelled suggestion rate.
- Neighborhood coverage, shown only when group sizes are large enough to avoid re-identification.

Never show:

- Individual names.
- Individual locations.
- Individual feedback.
- Individual risk labels.
- Mental health categories.
- Loneliness scores.

Use privacy-preserving dashboard rules:

- Aggregate all metrics.
- Suppress neighborhood slices below a minimum group threshold.
- Avoid exact timestamps for small groups.
- Show trends and percentages instead of individual records.
- Make consent, export/delete, and opt-out part of the future production architecture.

## One-Day Build Order

1. Create Vite React TypeScript app with Tailwind.
2. Add app shell, routes, and seeded data.
3. Build resident onboarding and preference flow.
4. Build availability/routine selection.
5. Build suggestion ranking and session cards.
6. Build accept/reject, confirmed activity, safety actions, and feedback interactions.
7. Build municipality dashboard with aggregate impact data.
8. Add reach-strategy screen or panel showing low-stigma partner entry points.
9. Polish copy, layout, responsive behavior, and demo path.

## Acceptance Criteria

- User can complete full resident flow without real identity.
- App never describes user as lonely or vulnerable.
- Suggestions show transparent coordination reasons.
- User can accept/reject suggestions.
- Confirmed activity shows public-place and safety actions.
- User can submit feedback and repeat-meet preference.
- Dashboard only displays aggregate metrics.
- Dashboard includes outcome metrics, not only activity counts.
- Neighborhood metrics avoid individual-level exposure.
- Demo works without network or Supabase configuration.
- Mobile and desktop layouts are usable.

## Future Version Notes

- Add Supabase auth with anonymous or alias-first onboarding.
- Add consented calendar integration.
- Add community partner event management.
- Add moderation and safety escalation workflows.
- Add privacy-preserving analytics pipeline.
- Add opt-in notifications.
- Add GDPR flows for consent withdrawal, data export, deletion, retention limits, and purpose limitation.
- Add AI Act documentation showing the system does not infer loneliness or mental health status.
- Consider LLM-generated suggestion copy only after strict safety and privacy review.
