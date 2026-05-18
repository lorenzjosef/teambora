# Plan Review: Findings

## Strong Points

- Privacy/dignity framing is excellent and directly addresses the "dystopian" concern.
- The core reframe ("coordination friction, not loneliness detection") is sharp and defensible.
- Transparent matching reasons are a good design choice.
- Aggregate-only dashboard respects GDPR intent.
- The demo path is concrete and walkable.

## Flaws and Gaps

### 1. The brief says "identify" — the plan dodges this entirely

The challenge explicitly asks to "identify, reach, and meaningfully connect lonely residents." The plan covers "reach" (passively) and "connect" well, but has no answer to "identify." Need a clear narrative for why inversion is better: instead of identifying lonely people and pushing services at them, create a low-barrier product that self-selects. Frame it as: "the best identification is when people identify themselves through opt-in behavior — not when an algorithm flags them."

### 2. Where is the AI? The brief says "AI-powered solution"

Matching is explicitly "deterministic rule-based scoring." For a challenge about AI, the jury will ask "so where's the AI?" Even if the prototype is rule-based (fine for a one-day build), the plan needs a clear section on what AI does at scale:

- Learning optimal group compositions from feedback data.
- Timing suggestions based on engagement patterns.
- NLP on anonymized feedback to surface activity-type demand.
- Predictive scheduling (e.g., "Thursday walking groups in Zuidwijk fill fast, auto-create more").

Without this, the presentation shows a matching app, not an AI-powered solution.

### 3. "Success" is not defined — the brief explicitly asks for this

> "Think hard about... what 'success' actually looks like"

The dashboard has metrics but no theory of change. Define it:

- **Leading indicators**: suggestions accepted, activities attended.
- **Core outcome**: repeat meetups (signals genuine connection, not one-off attendance).
- **Lagging indicator**: self-reported connection improvement over time.

Say what the municipality's KPI is. E.g., "a 15% increase in residents reporting weekly social contact within 18 months in participating neighborhoods."

### 4. The reach strategy is passive — this contradicts the problem statement

The challenge says: "the people who need connection most rarely show up to loneliness initiatives." The reach strategy (QR codes at libraries, posters at community centers, municipal newsletters) targets the same self-selected minority that already engages with civic infrastructure.

Missing: How do you reach homebound elderly, socially anxious students, new immigrants, or people who don't visit libraries? Consider:

- Integration with existing touchpoints people already use (energy bill portals, university enrollment flows, GP waiting rooms).
- Partner-initiated invitations ("your library card shows you visit weekly — others do too, want to join a reading walk?").
- Word-of-mouth mechanics post-activity.

### 5. No differentiator from Meetup / Nextdoor / Strava Local

A jury will ask: "Why wouldn't the municipality just promote Meetup?" The plan doesn't articulate why this needs to exist as a separate product. The unique value proposition likely includes:

- Municipality-backed trust and safety.
- Comfort-first design (not engagement-maximizing).
- Aggregate impact measurement for public funding justification.
- Integration with community partners who can host.
- No commercial incentives distorting suggestions.

Make this explicit.

### 6. The €2M budget and 18-month timeline are ignored

The brief gives concrete constraints. Even a brief deployment roadmap shows the jury you're thinking beyond the prototype:

- Months 1–3: Pilot in one neighborhood with community partners.
- Months 4–9: Expand to 3 municipalities, onboard hosts.
- Months 10–18: Measure outcomes, publish aggregate impact report.

### 7. GDPR + AI Act compliance is buried in "future notes"

The challenge explicitly calls out "privacy rules are strict (GDPR + AI Act)." The plan mentions this only in the future-version notes at the bottom. For the jury, bring this forward. Key points to make visible:

- AI Act classification: this is not a "high-risk" system because it does not profile, score, or infer emotional states.
- GDPR basis: consent (opt-in), with clear purpose limitation.
- Data minimization: only rough neighborhood, no precise GPS.
- Right to deletion: one-click account removal.

### 8. Onboarding asks too much before showing value

The plan asks for: alias, interests, comfort settings, neighborhood, travel radius, availability, routines — all before showing a single suggestion. That's 7+ steps of input before any payoff. Consider progressive disclosure: show one or two nearby partner-hosted activities immediately, then ask for preferences to improve suggestions.

### 9. No serendipity / weak-tie mechanism

Matching only on shared interests + same neighborhood creates echo chambers. Research on loneliness shows that "weak ties" (bridging across different groups) matter more than bonding within similar clusters. Consider:

- Occasional "wildcard" suggestions outside stated interests.
- Cross-neighborhood activities at central venues.
- Community-hosted events that mix interest groups.

### 10. Municipality dashboard is read-only — no actionable insight

The dashboard shows counts and trends but doesn't tell the municipality what to do. Consider adding:

- "High demand for walking groups in Zuidwijk, but no community host available" → actionable signal to fund a partner.
- "Thursday evenings are most popular but have the fewest hosted options" → scheduling insight.

## Summary

The plan is strong on ethics, privacy, and UX design — but weak on the strategic layer the jury will probe: where AI adds value, what success means quantitatively, how you reach the hardest-to-reach, and why this can't be solved by existing platforms. The prototype itself is well-scoped for a one-day build; the narrative wrapper needs these gaps closed before presenting.
