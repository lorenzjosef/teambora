# Gesellig — Business Plan for “The Lonely City”

**Prepared for:** Hackathon submission review  
**Challenge:** The Lonely City  
**Product:** Gesellig  
**Pilot geography:** Rotterdam, scalable to Amsterdam, The Hague, and other Dutch municipalities  
**Funding context:** €2M seed funding, 18-month impact window  
**Date:** 2026-05-19

---

## 0. One-Sentence Pitch

**Gesellig is an AI-powered, privacy-first coordination platform that helps municipalities turn residents’ free moments into safe, small, real-life social activities — without labelling, diagnosing, or surveilling anyone.**

---

## 1. Executive Summary

Loneliness is a public health challenge, but the current municipal response is structurally limited. Flyers, helplines, and community centers mostly reach people who already engage with civic infrastructure. The residents who most need connection often do not self-identify with “loneliness initiatives,” and any AI solution that appears to diagnose or profile lonely people risks losing trust, violating privacy expectations, and becoming politically unacceptable.

Gesellig solves this by reframing the challenge.

Instead of asking:

> “How can we detect lonely people?”

Gesellig asks:

> “How can we identify moments where residents are open to connection, and coordinate those moments into real human contact?”

Residents opt in through trusted local touchpoints: libraries, cafés, universities, GP waiting rooms, housing associations, sports centers, municipal services, and community partners. They can browse nearby activities without stigma, then improve recommendations by sharing lightweight preferences: interests, rough neighborhood, free time windows, and comfort settings such as public places, small groups, and hosted events.

The AI component acts as a **connection coordinator**, not a loneliness detector. It parses resident intent, matches availability with local activity supply, explains why a suggestion fits, recommends low-pressure “wildcard” activities to build weak ties, and helps municipalities identify aggregate supply gaps. For example: “Thursday evening walks in Kralingen are oversubscribed; recruit two more hosts,” or “Beginner football has high demand but limited public field access.”

Municipalities receive only grouped insights: accepted activities, completed meetups, repeat-meet signals, connection ratings, unmet demand, and partner performance. They do not see names, exact addresses, private messages, rejected suggestions, mental health status, or individual loneliness scores.

The success metric is not app usage. The success metric is repeated real-world social contact.

Within 18 months and a €2M seed budget, Gesellig aims to help a coalition of Dutch municipalities reach 20,000 residents, onboard 6,000 opt-in participants, generate 4,000 accepted activities, complete 2,800 real-life meetups, and create at least 900 repeat-meet signals, with a target of increasing weekly social contact by 15% in participating pilot neighborhoods.

---

## 2. The Challenge

The brief asks for an AI-powered solution that helps municipalities:

1. **Identify** lonely residents.
2. **Reach** residents who do not respond to traditional outreach.
3. **Meaningfully connect** people through real human interaction.
4. Do this without feeling dystopian.
5. Respect consent, dignity, GDPR, and the AI Act.
6. Show measurable impact within 18 months.

The complication is that the literal interpretation of “identify lonely residents” creates the core risk. If a municipality uses AI to infer who is lonely, residents may experience it as surveillance or social scoring. This would undermine adoption and create regulatory, ethical, and political risk.

Gesellig therefore proposes a safer and more effective interpretation:

> **The best way to identify need is not to label people as lonely. It is to identify opt-in demand for connection.**

A resident scanning a QR code, selecting a free time window, choosing “small groups only,” or accepting a local walk is providing a dignified and consent-based signal. The municipality does not need to know whether that person is lonely. It only needs to know that there is demand for connection infrastructure in a given place, time, and activity category.

---

## 3. Core Insight

Loneliness initiatives often fail because they ask people to join under a stigmatizing identity. Gesellig avoids the identity problem by focusing on normal activities.

People may not want to say:

> “I am lonely.”

But they are often willing to say:

> “I’m free Thursday evening.”  
> “I’d like coffee with a small group.”  
> “I prefer public places.”  
> “I might meet these people again.”

That is enough to create a meaningful connection pathway.

Gesellig turns the city into a coordination layer for everyday social activity: coffee, walks, museums, sports, cooking, studying, board games, language practice, and neighborhood events.

---

## 4. Product Overview

Gesellig has two integrated components.

### 4.1 Resident Experience

A mobile-first app or lightweight web flow where residents can:

- Browse nearby public activities.
- Join small-group or hosted plans.
- Add free time windows manually or through optional calendar connection.
- Select comfort preferences.
- Receive AI-powered activity suggestions.
- Understand transparent match reasons.
- Message participants without exposing private contact details.
- Block or report unsafe interactions.
- Give post-activity feedback.
- Save “meet again” connections only after real-world interaction.

The product is deliberately framed around positive, low-pressure language:

- “Make a free moment social.”
- “Find a small local plan.”
- “Public places. Small groups. Your choice.”
- “Meet again if it felt good.”

It avoids resident-facing language such as “loneliness risk,” “mental health score,” or “vulnerability.”

### 4.2 Municipality Dashboard

A privacy-preserving operational dashboard where city teams can see:

- Accepted suggestions.
- Completed real-life meetups.
- Repeat-meet rate.
- Average connection rating.
- Activity demand by neighborhood and category.
- Unmet demand by time slot.
- Partner and venue performance.
- Recommended actions to increase connection supply.

Municipalities cannot see:

- Names.
- Exact addresses.
- Phone numbers or emails.
- Private messages.
- Rejected suggestions.
- Individual mental health status.
- Individual loneliness scores.
- Resident-level profiles.

The dashboard helps municipalities fund and coordinate what works without exposing the people they are trying to help.

---

## 5. How the AI Works

Gesellig uses AI for coordination, not diagnosis.

### 5.1 Resident-Side AI Coordinator

The AI coordinator can interpret natural language such as:

- “I’m free from 6 to 8 and want something low-key.”
- “I’m new in Rotterdam and want to meet people through sports.”
- “I’d like coffee but only in a public place.”
- “I want something social, but not too intense.”

It extracts:

- Activity intent.
- Time window.
- Comfort constraints.
- Location range.
- Public or hosted preference.
- Group-size preference.

It then generates suggestions with transparent explanations:

- “Fits your Thursday evening availability.”
- “Public venue within your selected area.”
- “Small group matches your comfort setting.”
- “Hosted by a community partner.”
- “Suggested as a low-pressure wildcard outside your normal routine.”

### 5.2 Municipality-Side AI

The municipality dashboard uses AI to turn aggregate signals into operational recommendations:

- “High walking demand in Kralingen, but evening host capacity is low.”
- “Beginner football is oversubscribed; coordinate public field access.”
- “Quiet coffee tables have high completion rates among students.”
- “Museum weekend demand exceeds available partner slots.”
- “Charlois is below privacy threshold; do not report neighborhood metrics yet.”

This lets municipalities move from broad campaigns to targeted, evidence-based action.

### 5.3 AI Guardrails

Gesellig explicitly does not use AI to:

- Diagnose loneliness.
- Predict mental health conditions.
- Assign vulnerability scores.
- Rank residents by social risk.
- Make eligibility decisions.
- Replace human connection with chatbot conversation.
- Show resident-level AI insights to municipal officials.

The AI is a coordination engine that helps real people meet other real people.

---

## 6. Identification Without Surveillance

The challenge uses the word “identify.” Gesellig addresses this through opt-in behavior rather than algorithmic labelling.

### 6.1 What We Identify

Gesellig identifies:

- Opt-in residents who want to make a free moment social.
- Available time windows.
- Interest and comfort patterns.
- Unmet activity demand.
- Neighborhood-level supply gaps.
- Partner capacity constraints.
- Repeat-connection opportunities.

### 6.2 What We Do Not Identify

Gesellig does not identify:

- “Lonely people.”
- Mental health status.
- Emotional vulnerability.
- Individual risk scores.
- Residents for municipal intervention.

This distinction is the ethical foundation of the product.

The municipality does not need a list of lonely people. It needs a map of where connection can be created safely and measurably.

---

## 7. Reaching Residents Who Do Not Respond to Traditional Outreach

Traditional channels such as flyers, helplines, and community centers reach a self-selected minority. Gesellig uses embedded, trusted touchpoints instead.

### 7.1 Outreach Channels

| Target group | Trusted touchpoints |
|---|---|
| Students | University onboarding, study spaces, student housing, sports associations |
| Elderly residents | GP waiting rooms, pharmacies, libraries, housing associations, community nurses |
| New residents | Municipal move-in letters, registration portals, neighborhood welcome packs |
| New immigrants | Language schools, integration programs, cultural associations, municipal service desks |
| Low-income households | Energy portals, benefits services, housing corporations |
| Socially anxious residents | Anonymous browsing, small groups, hosted events, public-place defaults |
| Recently separated residents | Family support desks, mediation practices, therapy centers |
| Working adults | Employer wellbeing portals, public transport campaigns, local cafés |

### 7.2 Outreach Message

The outreach message is not “Are you lonely?”

It is:

> “Make a free moment social.”

This lowers stigma and reframes participation as normal city life.

### 7.3 Partner-Led Invitation

Partners can invite residents through familiar activities:

- “Join a quiet coffee table at the library.”
- “Walk around the park with a small group.”
- “Try beginner padel with others who are new.”
- “Join a hosted museum visit.”
- “Practice Dutch over coffee.”

These are low-pressure invitations that do not require a resident to adopt a stigmatized identity.

---

## 8. Meaningful Connection: What Success Looks Like

Gesellig does not define success as downloads, clicks, or chatbot conversations.

Success means real-world social contact that residents want to repeat.

### 8.1 Leading Indicators

These show whether the system is functioning:

- Residents reached.
- Residents opted in.
- Activities viewed.
- Suggestions accepted.
- Attendance rate.
- Time from signup to first accepted activity.
- Share of activities in public or hosted settings.

### 8.2 Core Outcome Metric

The core metric is:

> **Repeat-meet signal** — the percentage of completed activities where residents indicate they would meet again or join a similar activity with similar people.

This is stronger than one-off attendance because it suggests actual social comfort and potential relationship formation.

### 8.3 Lagging Impact Metrics

Over time, municipalities should measure:

- Self-reported connection improvement.
- Weekly social contact frequency.
- Resident comfort rating.
- Resident safety rating.
- Repeat participation.
- Partner-hosted capacity.
- Neighborhood-level improvement in social contact.

### 8.4 18-Month Impact Target

Gesellig’s 18-month target is:

> **Increase residents reporting weekly social contact by 15% in participating pilot neighborhoods.**

Supporting targets:

| Metric | 18-month target |
|---|---:|
| Residents reached | 20,000 |
| Opt-in residents | 6,000 |
| AI-generated suggestions | 15,000 |
| Accepted activities | 4,000 |
| Completed meetups | 2,800 |
| Repeat-meet signals | 900 |
| Active community partners | 100 |
| Partner-hosted activity categories | 12+ |

---

## 9. Privacy, GDPR, and AI Act Position

Gesellig is designed around privacy by default.

### 9.1 GDPR Design

| GDPR principle | Product implementation |
|---|---|
| Consent | Residents opt in and can revoke participation. |
| Purpose limitation | Data is used only for activity coordination and aggregate impact measurement. |
| Data minimization | Rough neighborhood, no exact GPS required, alias allowed. |
| Transparency | Residents see why suggestions are made. |
| Right to deletion | Residents can delete their account and activity data. |
| Access control | Municipalities see only grouped trends. |
| Storage limitation | Personal data is retained only as long as needed for coordination and evaluation. |

### 9.2 AI Act Design Position

Gesellig should be positioned as an opt-in coordination and recommendation system, not a high-risk profiling system.

It does not:

- Infer mental health status.
- Score residents socially.
- Decide eligibility for public benefits.
- Enable law enforcement or coercive intervention.
- Create individual risk labels for public authorities.

### 9.3 Safety Features

- Public-place default.
- Hosted-event preference.
- Small-group controls.
- In-app messaging without exposing phone numbers.
- Block and report functionality.
- Human moderation for safety reports.
- Minimum aggregation thresholds in the dashboard.
- No resident-level municipal views.

---

## 10. Why Municipalities Need Gesellig Instead of Existing Platforms

Existing platforms such as Meetup, Nextdoor, and Strava are not built for public-sector loneliness prevention.

| Existing platforms | Gesellig |
|---|---|
| Optimize for engagement and growth. | Optimizes for completed and repeated real-life connection. |
| Can be noisy or intimidating. | Comfort-first, small-group, public-place design. |
| Limited public impact measurement. | Municipality dashboard with aggregate outcomes. |
| Commercial incentives. | Public-interest operating model. |
| Profile browsing and open feeds. | Activity-first matching. |
| No municipal partner coordination. | Built around libraries, cafés, sports centers, universities, and community hosts. |
| No privacy-safe public health reporting. | Grouped trends, thresholds, and no individual scoring. |

Gesellig is not a social network. It is civic connection infrastructure.

---

## 11. Operating Model

Gesellig works through a three-sided operating model.

### 11.1 Residents

Residents provide opt-in preferences and feedback. They receive activity suggestions, safety controls, and opportunities for real-world connection.

### 11.2 Community Partners

Partners provide trusted local supply:

- Libraries.
- Cafés.
- Museums.
- Sports centers.
- Universities.
- Housing associations.
- Community centers.
- Volunteer groups.
- Local nonprofits.

### 11.3 Municipalities

Municipalities provide funding, governance, outreach channels, partner coordination, and evaluation. They use the dashboard to decide where to invest.

---

## 12. Business Model

The initial customer is the coalition of Dutch municipalities. Gesellig starts as a publicly funded pilot and can scale into a municipal SaaS and partner coordination platform.

### 12.1 Revenue Streams

1. **Municipality license**
   - Annual subscription based on population and number of active neighborhoods.

2. **Implementation package**
   - Privacy review support, partner onboarding, localization, outreach toolkit, and evaluation setup.

3. **Partner coordination module**
   - Tools for libraries, sports centers, museums, and community hosts to manage capacity.

4. **Impact reporting**
   - Quarterly reporting for councils, public health departments, and grant funders.

### 12.2 Why Municipalities Pay

Gesellig helps municipalities:

- Improve uptake of existing community programs.
- Avoid surveillance-based AI.
- Show measurable impact within 18 months.
- Fund partners based on evidence.
- Reach residents through trusted touchpoints.
- Build long-term social infrastructure.

---

## 13. 18-Month Roadmap

### Phase 1 — Build and Governance Setup (Months 1–3)

**Goal:** Prepare a safe, legally reviewed MVP.

Actions:

- Finalize resident app and dashboard MVP.
- Complete DPIA and AI governance review.
- Set up secure backend infrastructure.
- Onboard first 15–20 partners.
- Prepare outreach materials.
- Establish baseline metrics.
- Run usability tests with students, elderly residents, and community partners.

Deliverables:

- Production-ready MVP.
- Privacy and AI governance documentation.
- Partner onboarding playbook.
- Evaluation baseline.

### Phase 2 — Rotterdam Neighborhood Pilot (Months 4–6)

**Goal:** Prove residents will opt in, accept suggestions, and attend activities.

Actions:

- Launch in 1–2 Rotterdam neighborhoods.
- Focus on public, hosted, small-group activities.
- Use libraries, GP waiting rooms, universities, cafés, and housing partners for outreach.
- Track acceptance, attendance, comfort, safety, and repeat signals.
- Use dashboard insights to identify supply gaps.

Deliverables:

- 1,000 opt-in residents.
- 500 accepted activities.
- First partner performance report.
- Safety and trust review.

### Phase 3 — Multi-Neighborhood Expansion (Months 7–12)

**Goal:** Scale supply and improve matching quality.

Actions:

- Expand to 5–7 neighborhoods.
- Add more activity types.
- Recruit hosts based on dashboard demand.
- Add multilingual onboarding.
- Introduce wildcard weak-tie recommendations.
- Improve AI-generated partner recommendations.

Deliverables:

- 4,000 opt-in residents.
- 2,000 accepted activities.
- 50+ active partners.
- First public aggregate impact report.

### Phase 4 — Coalition Scale-Up (Months 13–18)

**Goal:** Scale to the three-municipality coalition and prove measurable impact.

Actions:

- Deploy to Amsterdam and The Hague pilot areas.
- Compare outcomes across neighborhoods.
- Publish 18-month impact report.
- Prepare procurement model for long-term municipal SaaS.
- Establish resident and privacy advisory board.

Deliverables:

- 6,000+ opt-in residents.
- 4,000+ accepted activities.
- 2,800+ completed meetups.
- 900+ repeat-meet signals.
- 100+ partners.
- Evidence for continuation funding.

---

## 14. Budget Plan — €2M

| Category | Budget | Purpose |
|---|---:|---|
| Product and engineering | €550,000 | Resident app, dashboard, backend, AI coordination, security, integrations |
| Privacy, legal, and governance | €180,000 | DPIA, GDPR review, AI Act review, audits, resident governance |
| Partner onboarding | €300,000 | Recruiting and training libraries, cafés, sports centers, museums, universities, hosts |
| Outreach and acquisition | €300,000 | QR campaigns, municipal channels, GP/pharmacy/housing/university touchpoints |
| Activity microgrants | €300,000 | Venue slots, hosted events, volunteer support, small-group activity supply |
| Impact evaluation | €180,000 | Baseline, surveys, independent evaluation, outcome reporting |
| Safety and moderation | €120,000 | Reporting, escalation, safeguarding, moderation processes |
| Operations and contingency | €70,000 | Project management, localization, accessibility, unexpected needs |
| **Total** | **€2,000,000** | 18-month pilot and scale-up |

---

## 15. Prototype and Evidence

The current prototype demonstrates the central product concept:

- Mobile-first resident flow.
- Alias-based onboarding.
- Interests and comfort preferences.
- Calendar or manual free-window input.
- AI-style activity request.
- Transparent match reasons.
- Activity acceptance.
- Participant view and chat.
- Safety/reporting concept.
- Feedback and repeat-meet signal.
- Friends/meet-again list.
- Municipality dashboard.
- Aggregate privacy boundary.
- Activity demand and partner recommendations.

The prototype is intentionally scoped to show the experience and operating logic rather than production infrastructure. The next improvements before deployment are:

1. Secure backend handling for any third-party API tokens.
2. Stronger simulated AI coordinator for the demo.
3. “See activities first” onboarding to reduce friction.
4. A visible explanation of opt-in identification.
5. Wildcard weak-tie suggestions.
6. Dashboard action buttons for municipal interventions.

---

## 16. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Residents fear surveillance. | No loneliness scores, opt-in only, clear privacy boundary, aggregate dashboard. |
| Low uptake from hard-to-reach groups. | Embed invitations in trusted touchpoints instead of relying on flyers. |
| Activities do not create lasting connection. | Optimize for repeat-meet signals, not one-off attendance. |
| Partner capacity becomes bottleneck. | Dashboard identifies supply gaps and directs funding to partners. |
| Safety incidents. | Public-place defaults, hosted events, block/report flows, escalation policy. |
| Legal concerns. | DPIA, data minimization, consent, deletion rights, no emotional inference. |
| AI overpromising. | Position AI as coordination support, not diagnosis. |
| Digital exclusion. | Library support, partner-assisted sign-up, simple web app, phone-supported onboarding. |

---

## 17. Strategic Fit for the Challenge

| Challenge requirement | Gesellig response |
|---|---|
| Identify lonely residents | Identifies opt-in connection demand, not labelled lonely individuals. |
| Reach people beyond traditional outreach | Uses trusted touchpoints embedded in everyday services. |
| Meaningfully connect residents | Coordinates real-world, small-group, public activities. |
| AI-powered | AI supports intent parsing, matching, demand prediction, and partner recommendations. |
| Not dystopian | No diagnosis, no social score, no individual municipal view. |
| GDPR and AI Act sensitive | Consent, minimization, purpose limitation, aggregation thresholds. |
| 18-month measurable impact | Clear roadmap, budget, KPIs, and outcome targets. |
| Not a chatbot replacement | AI enables human meetings; it does not substitute for them. |

---

## 18. The Winning Logic

Gesellig is built around one strategic decision:

> **Do not build a loneliness detector. Build a connection coordinator.**

This gives municipalities what they actually need:

- A way to reach residents without stigma.
- A way to coordinate existing community capacity.
- A way to measure real human connection.
- A way to use AI without surveillance.
- A way to justify continued funding with evidence.

The city does not need to know who is lonely.  
The city needs to know where connection can be made easier.

Gesellig makes that possible.

---

## 19. Closing Statement

Gesellig turns municipal loneliness spending into measurable connection infrastructure.

It respects residents by never labelling them.  
It respects privacy by showing municipalities only grouped trends.  
It respects the brief by using AI to enable real human connection at scale.  
It respects reality by focusing on small, public, repeatable activities that people actually want to join.

**Gesellig: make a free moment social.**
