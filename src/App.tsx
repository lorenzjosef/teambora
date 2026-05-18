import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Coffee,
  Flag,
  HeartHandshake,
  Home,
  MapPin,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import {
  availabilityOptions,
  brandAssets,
  comfortOptions,
  defaultProfile,
  interests,
  neighborhoods,
  routines,
  sessions,
} from "./data";
import { rankSuggestions } from "./matching";
import type { ActivitySuggestion, AvailabilitySlot, ComfortKey, Feedback, Interest, ResidentProfile } from "./types";

type Step = "welcome" | "profile" | "preferences" | "availability" | "suggestions" | "confirmed" | "feedback";
type ViewMode = "mobile" | "dashboard";

const steps: Step[] = ["welcome", "profile", "preferences", "availability", "suggestions", "confirmed", "feedback"];

const formatTime = (slot: AvailabilitySlot) => `${slot.day}, ${slot.startTime}-${slot.endTime}`;

function DutchFlag() {
  return (
    <div className="overflow-hidden rounded-sm border border-black/10" aria-label="Dutch flag">
      <div className="h-1.5 w-7 bg-[#AE1C28]" />
      <div className="h-1.5 w-7 bg-white" />
      <div className="h-1.5 w-7 bg-[#21468B]" />
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="brand-mark">G</div>
      <div className="leading-none">
        <p className="text-[13px] font-black">{brandAssets.logoWordmark}</p>
        <p className="text-[10px] font-medium text-muted">Rotterdam pilot</p>
      </div>
    </div>
  );
}

function ViewToggle({ mode, setMode }: { mode: ViewMode; setMode: (mode: ViewMode) => void }) {
  return (
    <div className="view-toggle" aria-label="Prototype view">
      {(["mobile", "dashboard"] as const).map((item) => (
        <button
          className={`view-toggle-button ${mode === item ? "view-toggle-button-active" : ""}`}
          key={item}
          onClick={() => setMode(item)}
          type="button"
        >
          {item === "mobile" ? "Mobile app" : "Dashboard"}
        </button>
      ))}
    </div>
  );
}

function StatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="h-2 w-4 rounded-sm border border-ink" />
        <span className="h-2 w-2 rounded-full bg-ink" />
      </div>
    </div>
  );
}

function Progress({ step }: { step: Step }) {
  const index = steps.indexOf(step);
  return (
    <div className="flex items-center justify-center gap-1 py-3">
      {steps.slice(0, -1).map((item, itemIndex) => (
        <span
          className={`h-1.5 rounded-full transition-all ${itemIndex <= index ? "w-5 bg-orange" : "w-1.5 bg-line"}`}
          key={item}
        />
      ))}
    </div>
  );
}

type HeaderProps = {
  step: Step;
  onDashboard: () => void;
};

function AppHeader({ step, onDashboard }: HeaderProps) {
  return (
    <header className="mb-5 flex items-center justify-between">
      <Logo />
      <div className="flex items-center gap-2">
        <DutchFlag />
        {step !== "welcome" ? (
          <button className="cta-secondary h-9 px-3" onClick={onDashboard} type="button">
            Dashboard
          </button>
        ) : null}
      </div>
    </header>
  );
}

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <section className="flex flex-1 flex-col justify-between gap-6">
      <div className="relative -mx-5 -mt-2 min-h-[392px] overflow-hidden bg-orange">
        <img alt="" className="figma-image object-top" src={brandAssets.heroImage} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/55" />
        <div className="absolute left-5 top-5">
          <DutchFlag />
        </div>
        <div className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-ink">
          Rotterdam
        </div>
        <div className="absolute inset-x-6 bottom-7 text-white">
          <div className="mb-4 brand-mark bg-white text-orange shadow-card">G</div>
          <h1 className="title-xl max-w-[260px]">Make free moments social.</h1>
          <p className="mt-3 max-w-[270px] text-[14px] leading-5 text-white/85">
            Find a walk, coffee, museum visit, or local table that fits your time and comfort.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <button className="cta w-full" onClick={onNext} type="button">
          Start with an alias
          <ArrowRight size={17} />
        </button>
        <p className="px-3 text-center text-[11px] leading-4 text-muted">
          Private by default. Only opt-in activity coordination.
        </p>
      </div>
    </section>
  );
}

type ProfileScreenProps = {
  profile: ResidentProfile;
  setProfile: (profile: ResidentProfile) => void;
  onNext: () => void;
};

function ProfileScreen({ profile, setProfile, onNext }: ProfileScreenProps) {
  return (
    <section className="space-y-6">
      <div>
        <div className="top-line mb-5" />
        <h1 className="title-lg">What should people call you?</h1>
        <p className="body-copy mt-2">Use a first name or alias. You can change it later.</p>
      </div>
      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-[12px] font-semibold text-muted">Name or alias</span>
          <input
            className="input"
            onChange={(event) => setProfile({ ...profile, displayName: event.target.value })}
            placeholder="Alex"
            value={profile.displayName}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[12px] font-semibold text-muted">Neighborhood</span>
          <select
            className="input"
            onChange={(event) => setProfile({ ...profile, neighborhood: event.target.value })}
            value={profile.neighborhood}
          >
            {neighborhoods.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <div className="soft-card">
          <div className="flex gap-3">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[22px] bg-orangeSoft">
              <img alt="" className="figma-image object-top" src={brandAssets.profileCardImage} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink/35" />
            </div>
            <div className="flex min-w-0 items-start gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-green" size={20} />
              <div>
                <p className="text-[14px] font-semibold">Privacy-first by design</p>
                <p className="body-copy mt-1">
                  Municipality dashboards show grouped trends only, never individual resident details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button className="icon-button ml-auto" onClick={onNext} type="button" aria-label="Continue">
        <ArrowRight size={20} />
      </button>
    </section>
  );
}

type PreferencesScreenProps = {
  profile: ResidentProfile;
  setProfile: (profile: ResidentProfile) => void;
  onNext: () => void;
};

function PreferencesScreen({ profile, setProfile, onNext }: PreferencesScreenProps) {
  const toggleInterest = (interest: Interest) => {
    const next = profile.interests.includes(interest)
      ? profile.interests.filter((item) => item !== interest)
      : [...profile.interests, interest];
    setProfile({ ...profile, interests: next });
  };

  const toggleComfort = (key: ComfortKey) => {
    setProfile({ ...profile, comfort: { ...profile.comfort, [key]: !profile.comfort[key] } });
  };

  return (
    <section className="space-y-6">
      <div>
        <div className="top-line mb-5" />
        <h1 className="title-lg">What would you like to do with others?</h1>
        <p className="body-copy mt-2">Pick normal activities. You decide your comfort boundaries.</p>
      </div>
      <div>
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Interests</p>
        <div className="flex flex-wrap gap-2">
          {interests.map((item) => (
            <button
              className={`pill ${profile.interests.includes(item.id) ? "pill-active" : ""}`}
              key={item.id}
              onClick={() => toggleInterest(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3">
        {comfortOptions.map((item) => (
          <button className="soft-card text-left" key={item.id} onClick={() => toggleComfort(item.id)} type="button">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[14px] font-semibold">{item.label}</p>
                <p className="text-[12px] text-muted">{item.helper}</p>
              </div>
              <span
                className={`grid h-7 w-7 place-items-center rounded-full ${
                  profile.comfort[item.id] ? "bg-orange text-white" : "bg-line text-muted"
                }`}
              >
                {profile.comfort[item.id] ? <Check size={16} /> : null}
              </span>
            </div>
          </button>
        ))}
      </div>
      <button className="cta w-full" onClick={onNext} type="button">
        Set availability
        <CalendarDays size={17} />
      </button>
    </section>
  );
}

type AvailabilityScreenProps = {
  profile: ResidentProfile;
  setProfile: (profile: ResidentProfile) => void;
  onNext: () => void;
  calendarConnected: boolean;
  setCalendarConnected: (connected: boolean) => void;
};

function AvailabilityScreen({
  calendarConnected,
  profile,
  setCalendarConnected,
  setProfile,
  onNext,
}: AvailabilityScreenProps) {
  const toggleSlot = (slot: AvailabilitySlot) => {
    const exists = profile.availability.some((item) => item.label === slot.label);
    setProfile({
      ...profile,
      availability: exists
        ? profile.availability.filter((item) => item.label !== slot.label)
        : [...profile.availability, slot],
    });
  };

  const toggleRoutine = (routine: string) => {
    setProfile({
      ...profile,
      routines: profile.routines.includes(routine)
        ? profile.routines.filter((item) => item !== routine)
        : [...profile.routines, routine],
    });
  };

  const toggleCalendarConnection = () => {
    const nextConnected = !calendarConnected;
    setCalendarConnected(nextConnected);

    if (nextConnected) {
      const importedSlots = [availabilityOptions[0], availabilityOptions[1]];
      const merged = importedSlots.reduce<AvailabilitySlot[]>((current, slot) => {
        return current.some((item) => item.label === slot.label) ? current : [...current, slot];
      }, profile.availability);
      setProfile({ ...profile, availability: merged });
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <div className="top-line mb-5" />
        <h1 className="title-lg">When could a routine become social?</h1>
        <p className="body-copy mt-2">Add time manually or preview a consented calendar import.</p>
      </div>
      <div className="soft-card space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-orangeSoft text-orange">
              <CalendarDays size={19} />
            </span>
            <div>
              <p className="text-[14px] font-semibold">Calendar preview</p>
              <p className="text-[12px] text-muted">Future opt-in sync, demo uses local slots.</p>
            </div>
          </div>
          <button
            className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
              calendarConnected ? "bg-orange text-white" : "bg-canvas text-ink"
            }`}
            onClick={toggleCalendarConnection}
            type="button"
          >
            {calendarConnected ? "Connected" : "Connect"}
          </button>
        </div>
        {calendarConnected ? (
          <p className="rounded-2xl bg-canvas px-3 py-2 text-[12px] text-muted">
            Demo import added two free windows. In production this would require explicit consent and revocation.
          </p>
        ) : null}
        <div className="grid grid-cols-4 gap-2">
          {availabilityOptions.map((slot) => {
            const active = profile.availability.some((item) => item.label === slot.label);
            return (
              <button
                className={`calendar-cell ${active ? "calendar-cell-active" : ""}`}
                key={slot.label}
                onClick={() => toggleSlot(slot)}
                type="button"
              >
                <span className="font-semibold">{slot.day.slice(0, 3)}</span>
                <span className="mt-auto flex items-center gap-1 text-muted">
                  <Clock3 size={12} />
                  {slot.startTime}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-3">
        {availabilityOptions.map((slot) => {
          const active = profile.availability.some((item) => item.label === slot.label);
          return (
            <button
              className={`soft-card text-left ${active ? "border-orange bg-orangeSoft" : ""}`}
              key={slot.label}
              onClick={() => toggleSlot(slot)}
              type="button"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold">{slot.label}</p>
                  <p className="text-[12px] text-muted">{formatTime(slot)}</p>
                </div>
                {active ? <Check className="text-orange" size={18} /> : null}
              </div>
            </button>
          );
        })}
      </div>
      <div>
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Routines</p>
        <div className="flex flex-wrap gap-2">
          {routines.map((routine) => (
            <button
              className={`pill ${profile.routines.includes(routine) ? "pill-active" : ""}`}
              key={routine}
              onClick={() => toggleRoutine(routine)}
              type="button"
            >
              {routine}
            </button>
          ))}
        </div>
      </div>
      <button className="cta w-full" onClick={onNext} type="button">
        Find shared activities
        <ArrowRight size={17} />
      </button>
    </section>
  );
}

type SuggestionCardProps = {
  suggestion: ActivitySuggestion;
  onAccept: (suggestion: ActivitySuggestion) => void;
  onReject: (id: string) => void;
};

function SuggestionCard({ suggestion, onAccept, onReject }: SuggestionCardProps) {
  return (
    <article className="soft-card space-y-4">
      <div className="relative h-24 overflow-hidden rounded-[22px] bg-orangeSoft">
        <img alt="" className="figma-image object-top" src={brandAssets.cityCardImage} />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/20 to-transparent" />
        <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold">
          {suggestion.isCommunityHosted ? "Hosted public place" : "Public place"}
        </div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold text-orange">{suggestion.matchScore}% coordination fit</p>
          <h2 className="mt-1 text-[19px] font-semibold leading-tight">{suggestion.title}</h2>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orangeSoft text-orange">
          {suggestion.interest === "coffee" ? <Coffee size={22} /> : <Users size={22} />}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[12px]">
        <span className="rounded-2xl bg-canvas px-3 py-2">
          <MapPin className="mr-1 inline" size={13} />
          {suggestion.neighborhood}
        </span>
        <span className="rounded-2xl bg-canvas px-3 py-2">
          <Users className="mr-1 inline" size={13} />
          {suggestion.confirmedCount}/{suggestion.capacity} spots
        </span>
      </div>
      <ul className="space-y-2">
        {suggestion.matchReasons.map((reason) => (
          <li className="flex gap-2 text-[12px] leading-4 text-muted" key={reason}>
            <Check className="mt-0.5 shrink-0 text-green" size={14} />
            {reason}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button className="cta flex-1" onClick={() => onAccept(suggestion)} type="button">
          Accept
        </button>
        <button className="cta-secondary w-12 px-0" onClick={() => onReject(suggestion.id)} type="button" aria-label="Reject">
          <X size={17} />
        </button>
      </div>
    </article>
  );
}

type SuggestionsScreenProps = {
  suggestions: ActivitySuggestion[];
  onAccept: (suggestion: ActivitySuggestion) => void;
  onReject: (id: string) => void;
};

function SuggestionsScreen({ suggestions, onAccept, onReject }: SuggestionsScreenProps) {
  return (
    <section className="space-y-5">
      <div>
        <div className="top-line mb-5" />
        <h1 className="title-lg">3 shared activities that fit your moment</h1>
        <p className="body-copy mt-2">Ranked by interest, time, comfort, and rough travel radius.</p>
      </div>
      <div className="grid gap-4">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            onAccept={onAccept}
            onReject={onReject}
            suggestion={suggestion}
          />
        ))}
      </div>
    </section>
  );
}

type ConfirmedScreenProps = {
  confirmed: ActivitySuggestion;
  onCancel: () => void;
  onReport: () => void;
  onFeedback: () => void;
};

function ConfirmedScreen({ confirmed, onCancel, onFeedback, onReport }: ConfirmedScreenProps) {
  return (
    <section className="flex min-h-[650px] flex-col space-y-5">
      <div>
        <div className="top-line mb-5" />
        <p className="text-[12px] font-semibold text-orange">Confirmed</p>
        <h1 className="title-lg mt-1">{confirmed.title}</h1>
        <p className="body-copy mt-2">{formatTime(confirmed.time)} at {confirmed.locationName}</p>
      </div>
      <div className="soft-card space-y-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-green" size={22} />
          <div>
            <p className="text-[14px] font-semibold">Safe first meet</p>
            <p className="body-copy mt-1">Public place, small group, and host or venue visibility before arrival.</p>
          </div>
        </div>
        <div className="grid gap-2 text-[13px]">
          <span className="rounded-2xl bg-canvas px-3 py-2">Public location: yes</span>
          <span className="rounded-2xl bg-canvas px-3 py-2">Open spots: {confirmed.capacity - confirmed.confirmedCount}</span>
          <span className="rounded-2xl bg-canvas px-3 py-2">Host: {confirmed.hostName ?? "Venue contact"}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="cta-secondary" onClick={onCancel} type="button">Cancel</button>
        <button className="cta-secondary" onClick={onReport} type="button">Report/block</button>
      </div>
      <button className="cta mt-auto w-full" onClick={onFeedback} type="button">
        Add feedback
        <HeartHandshake size={17} />
      </button>
    </section>
  );
}

type FeedbackScreenProps = {
  onSubmit: (feedback: Feedback) => void;
  suggestionId: string;
};

function FeedbackScreen({ onSubmit, suggestionId }: FeedbackScreenProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [wantsRepeat, setWantsRepeat] = useState(true);

  return (
    <section className="space-y-6">
      <div>
        <div className="top-line mb-5" />
        <h1 className="title-lg">How did it feel?</h1>
        <p className="body-copy mt-2">Feedback stays private. Dashboard receives only grouped trends.</p>
      </div>
      <div className="soft-card">
        <p className="mb-3 text-[13px] font-semibold">Connection after activity</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              className={`grid h-10 flex-1 place-items-center rounded-2xl text-[13px] font-semibold ${
                rating === value ? "bg-orange text-white" : "bg-canvas text-muted"
              }`}
              key={value}
              onClick={() => setRating(value as 1 | 2 | 3 | 4 | 5)}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <button className="soft-card w-full text-left" onClick={() => setWantsRepeat(!wantsRepeat)} type="button">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold">Meet again?</p>
            <p className="text-[12px] text-muted">Used to build longer-term connections over time.</p>
          </div>
          <span className={`grid h-8 w-8 place-items-center rounded-full ${wantsRepeat ? "bg-orange text-white" : "bg-line"}`}>
            {wantsRepeat ? <Check size={16} /> : null}
          </span>
        </div>
      </button>
      <button
        className="cta w-full"
        onClick={() =>
          onSubmit({
            suggestionId,
            attended: true,
            feltComfortable: true,
            wantsRepeat,
            connectionRating: rating,
            reportedIssue: false,
          })
        }
        type="button"
      >
        Share feedback
        <ArrowRight size={17} />
      </button>
    </section>
  );
}

type BottomNavProps = {
  onDashboard: () => void;
  onHome: () => void;
  onCalendar: () => void;
};

function BottomNav({ onCalendar, onDashboard, onHome }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      <button className="grid justify-items-center gap-1" onClick={onHome} type="button">
        <Home size={16} />
        Home
      </button>
      <button className="grid justify-items-center gap-1" onClick={onCalendar} type="button">
        <CalendarDays size={16} />
        Calendar
      </button>
      <button className="grid justify-items-center gap-1" type="button">
        <Users size={16} />
        Groups
      </button>
      <button className="grid justify-items-center gap-1" onClick={onDashboard} type="button">
        <Flag size={16} />
        Impact
      </button>
    </nav>
  );
}

type DashboardProps = {
  acceptedCount: number;
  completedCount: number;
  feedback: Feedback[];
  onMobile: () => void;
  rejectedCount: number;
};

function Dashboard({ acceptedCount, completedCount, feedback, onMobile, rejectedCount }: DashboardProps) {
  const repeatCount = feedback.filter((item) => item.wantsRepeat).length;
  const avgConnection = feedback.length
    ? (feedback.reduce((sum, item) => sum + item.connectionRating, 0) / feedback.length).toFixed(1)
    : "4.2";

  const metrics = [
    { label: "Suggestions accepted", value: `${18 + acceptedCount}`, trend: "+12% this week" },
    { label: "Meetups completed", value: `${9 + completedCount}`, trend: "62% completion" },
    { label: "Repeat meetups", value: `${5 + repeatCount}`, trend: "30-day signal" },
    { label: "Connection pulse", value: avgConnection, trend: "grouped average" },
  ];

  return (
    <section className="dashboard-panel">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-orange">Municipality view</p>
          <h2 className="mt-2 text-2xl font-semibold">Anonymous impact dashboard</h2>
          <p className="body-copy mt-2 max-w-xl">
            City teams see grouped activity trends only. No resident profile, exact location, or individual feedback is exposed.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <DutchFlag />
          <button className="cta-secondary" onClick={onMobile} type="button">
            Mobile app
          </button>
        </div>
      </div>
      <div className="relative mb-4 h-44 overflow-hidden rounded-[28px] bg-orange">
        <img alt="" className="figma-image object-top opacity-80" src={brandAssets.cityCardImage} />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/35 to-transparent" />
        <div className="absolute bottom-5 left-5 max-w-sm text-white">
          <p className="text-[13px] font-semibold">Low-stigma city entry points</p>
          <p className="mt-1 text-[12px] leading-5 text-white/75">
            Libraries, campuses, cafes, museums, and sports clubs invite residents into shared activities.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div className="metric-card" key={metric.label}>
            <p className="text-[12px] font-semibold text-muted">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
            <p className="mt-1 text-[12px] text-green">{metric.trend}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="metric-card">
          <p className="text-[13px] font-semibold">Popular activity types</p>
          {[
            ["Walking", "78%"],
            ["Coffee", "64%"],
            ["Museums", "49%"],
            ["Board games", "36%"],
          ].map(([label, value]) => (
            <div className="mt-3" key={label}>
              <div className="mb-1 flex justify-between text-[12px] text-muted">
                <span>{label}</span>
                <span>{value}</span>
              </div>
              <div className="h-2 rounded-full bg-canvas">
                <div className="h-2 rounded-full bg-orange" style={{ width: value }} />
              </div>
            </div>
          ))}
        </div>
        <div className="metric-card">
          <p className="text-[13px] font-semibold">Privacy guardrails</p>
          <ul className="mt-3 space-y-2 text-[12px] leading-4 text-muted">
            <li>Neighborhood slices suppressed below group threshold.</li>
            <li>Rejected suggestions: {rejectedCount} grouped only.</li>
            <li>No personal or health inference.</li>
            <li>Consent withdrawal planned for production.</li>
          </ul>
        </div>
      </div>
      <div className="mt-4 rounded-3xl bg-ink p-4 text-white">
        <p className="text-[13px] font-semibold">Reach strategy</p>
        <p className="mt-2 text-[12px] leading-5 text-white/70">
          QR invites from libraries, cafes, universities, museums, sports clubs, and municipal pages. Framed as free-time
          activity planning, not needs-based outreach.
        </p>
      </div>
    </section>
  );
}

export default function App() {
  const [step, setStep] = useState<Step>("welcome");
  const [mode, setMode] = useState<ViewMode>("mobile");
  const [profile, setProfile] = useState<ResidentProfile>(defaultProfile);
  const [accepted, setAccepted] = useState<ActivitySuggestion | null>(null);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [calendarConnected, setCalendarConnected] = useState(false);

  const suggestions = useMemo(
    () => rankSuggestions(profile, sessions, rejectedIds, blockedIds, feedback),
    [blockedIds, feedback, profile, rejectedIds],
  );

  const goDashboard = () => setMode("dashboard");
  const goHome = () => {
    setMode("mobile");
    setStep("suggestions");
  };
  const goCalendar = () => {
    setMode("mobile");
    setStep("availability");
  };

  const acceptSuggestion = (suggestion: ActivitySuggestion) => {
    setAccepted(suggestion);
    setStep("confirmed");
  };

  const rejectSuggestion = (id: string) => setRejectedIds((current) => [...current, id]);

  const submitFeedback = (nextFeedback: Feedback) => {
    setFeedback((current) => [...current.filter((item) => item.suggestionId !== nextFeedback.suggestionId), nextFeedback]);
    setMode("dashboard");
  };

  const renderScreen = () => {
    if (step === "welcome") {
      return <WelcomeScreen onNext={() => setStep("profile")} />;
    }

    if (step === "profile") {
      return <ProfileScreen onNext={() => setStep("preferences")} profile={profile} setProfile={setProfile} />;
    }

    if (step === "preferences") {
      return <PreferencesScreen onNext={() => setStep("availability")} profile={profile} setProfile={setProfile} />;
    }

    if (step === "availability") {
      return (
        <AvailabilityScreen
          calendarConnected={calendarConnected}
          onNext={() => setStep("suggestions")}
          profile={profile}
          setCalendarConnected={setCalendarConnected}
          setProfile={setProfile}
        />
      );
    }

    if (step === "suggestions") {
      return <SuggestionsScreen onAccept={acceptSuggestion} onReject={rejectSuggestion} suggestions={suggestions} />;
    }

    if (step === "confirmed" && accepted) {
      return (
        <ConfirmedScreen
          confirmed={accepted}
          onCancel={() => setStep("suggestions")}
          onFeedback={() => setStep("feedback")}
          onReport={() => {
            setBlockedIds((current) => [...current, accepted.id]);
            setAccepted(null);
            setStep("suggestions");
          }}
        />
      );
    }

    if (step === "feedback" && accepted) {
      return <FeedbackScreen onSubmit={submitFeedback} suggestionId={accepted.id} />;
    }

    return null;
  };

  return (
    <main className="app-shell">
      <div className="prototype-grid">
        <ViewToggle mode={mode} setMode={setMode} />
        {mode === "mobile" ? (
          <div className="phone-frame">
            <StatusBar />
            <div className="screen-pad">
              {step !== "welcome" ? <AppHeader onDashboard={goDashboard} step={step} /> : null}
              <Progress step={step} />
              {renderScreen()}
            </div>
            {step !== "welcome" ? (
              <BottomNav onCalendar={goCalendar} onDashboard={goDashboard} onHome={goHome} />
            ) : null}
          </div>
        ) : (
          <Dashboard
            acceptedCount={accepted ? 1 : 0}
            completedCount={feedback.length}
            feedback={feedback}
            onMobile={() => setMode("mobile")}
            rejectedCount={rejectedIds.length + blockedIds.length}
          />
        )}
      </div>
    </main>
  );
}
