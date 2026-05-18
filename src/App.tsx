import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  HeartHandshake,
  Home,
  Image as ImageIcon,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  Phone,
  Plus,
  Send,
  Settings,
  ShieldCheck,
  Square,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { GeselligMark } from "./Brand";
import { useVoiceInput } from "./voice";
import {
  activityImages,
  brandAssets,
  comfortOptions,
  defaultProfile,
  interests,
  neighborhoods,
  peopleCards,
  sessions,
} from "./data";
import Dashboard from "./Dashboard";
import { rankSuggestions } from "./matching";
import type { ActivitySession, ActivitySuggestion, AvailabilitySlot, ComfortKey, Feedback, Interest, ResidentProfile } from "./types";

type Step =
  | "welcome"
  | "profile"
  | "interests"
  | "comfort"
  | "calendarConnect"
  | "manualAvailability"
  | "habits"
  | "home"
  | "calendar"
  | "groups"
  | "friends"
  | "addEvent"
  | "settings"
  | "chat"
  | "confirmed"
  | "participants"
  | "feedback"
  | "feedbackSuccess"
  | "reported";
type ViewMode = "mobile" | "dashboard";
type ChatPerson = (typeof peopleCards)[number];

const onboardingSteps: Step[] = ["welcome", "profile", "interests", "comfort", "calendarConnect", "manualAvailability", "habits"];
const tabSteps: Step[] = ["home", "calendar", "groups", "addEvent", "friends", "settings"];
const isOnboarding = (step: Step) => onboardingSteps.includes(step);
const isTabStep = (step: Step) => tabSteps.includes(step);

const formatTime = (slot: AvailabilitySlot) => `${slot.day}, ${slot.startTime}-${slot.endTime}`;
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const weekdayLookup = new Map(weekdays.flatMap((day) => [[day.toLowerCase(), day], [day.slice(0, 3).toLowerCase(), day]]));
const calendarDefaultDay = new Date().toLocaleDateString("en-US", { weekday: "long" });

type ParsedCalendarInput = AvailabilitySlot & {
  title: string;
  hasTime: boolean;
};

const addMinutes = (time: string, minutes: number) => {
  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  const nextHours = Math.floor(total / 60) % 24;
  const nextMinutes = total % 60;
  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
};

const normalizeTime = (hours: string, minutes: string) => `${hours.padStart(2, "0")}:${minutes}`;

const parseCalendarInput = (input: string): ParsedCalendarInput => {
  const trimmed = input.trim();
  const rangeMatch = trimmed.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\s*[-–—]\s*([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  const timeMatch = rangeMatch ?? trimmed.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  const startTime = timeMatch ? normalizeTime(timeMatch[1], timeMatch[2]) : "";
  const endTime = rangeMatch ? normalizeTime(rangeMatch[3], rangeMatch[4]) : startTime ? addMinutes(startTime, 60) : "";
  const timeText = rangeMatch?.[0] ?? timeMatch?.[0] ?? "";
  const dayMatch = trimmed
    .split(/\s+/)
    .map((word) => word.toLowerCase().replace(/[^a-z]/g, ""))
    .find((word) => weekdayLookup.has(word));
  const day = dayMatch ? weekdayLookup.get(dayMatch)! : calendarDefaultDay;
  const title = (trimmed || "New free window")
    .replace(timeText, "")
    .replace(new RegExp(`\\b(${[...weekdayLookup.keys()].join("|")})\\b`, "i"), "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: title || "Free window",
    label: title || "Free window",
    day,
    startTime,
    endTime,
    hasTime: Boolean(startTime),
  };
};

const getSuggestionImage = (suggestion: ActivitySuggestion) => {
  return activityImages[suggestion.interest];
};

const inferInterestFromText = (text: string): Interest => {
  const lower = text.toLowerCase();
  if (lower.includes("coffee") || lower.includes("cafe")) return "coffee";
  if (lower.includes("museum") || lower.includes("depot")) return "museums";
  if (lower.includes("walk")) return "walking";
  if (lower.includes("board")) return "board_games";
  if (lower.includes("cook")) return "cooking";
  if (lower.includes("study")) return "studying";
  if (lower.includes("padel")) return "padel";
  if (lower.includes("football") || lower.includes("soccer")) return "football";
  if (lower.includes("cinema") || lower.includes("movie")) return "cinema";
  return "community_events";
};

const liveWeek = Array.from({ length: 7 }, (_, index) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + index);
  return {
    date,
    day: date.toLocaleDateString("en-US", { weekday: "short" }),
    monthDay: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
});

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
      <div className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink">
        <GeselligMark className="h-7 w-7" />
      </div>
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

function AroundList({
  blockedContacts,
  onMessage,
}: {
  blockedContacts: string[];
  onMessage: (person: ChatPerson) => void;
}) {
  const visiblePeople = peopleCards.filter((person) => !blockedContacts.includes(person.name));

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {visiblePeople.map((person) => (
        <article className="min-w-[112px] rounded-[18px] bg-tertiary px-3 py-3 text-center shadow-card" key={person.name}>
          <p className="truncate text-[13px] font-semibold tracking-[-0.2px]">{person.name}</p>
          <p className="mt-1 text-[11px] leading-4 text-muted">{person.daysLeft.replace("left", "since last interaction")}</p>
          <button className="mt-3 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold" onClick={() => onMessage(person)} type="button">
            Message
          </button>
        </article>
      ))}
      {visiblePeople.length === 0 ? (
        <div className="min-w-full rounded-[18px] bg-tertiary px-3 py-4 text-center text-[12px] font-semibold text-muted">
          All contacts blocked
        </div>
      ) : null}
    </div>
  );
}

function Progress({ step }: { step: Step }) {
  const activeSteps = isOnboarding(step) ? onboardingSteps : ["home", "calendar", "groups", "friends"];
  const index = Math.max(activeSteps.indexOf(step), 0);
  const progressWidth = `${((index + 1) / activeSteps.length) * 100}%`;

  if (isOnboarding(step)) {
    return (
      <div className="my-6 h-[3px] w-full rounded-full bg-[#eeebe5]">
        <div className="h-full rounded-full bg-orange transition-all" style={{ width: progressWidth }} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1 py-3">
      {activeSteps.map((item, itemIndex) => (
        <span
          className={`h-1.5 rounded-full transition-all ${itemIndex <= index ? "w-5 bg-orange" : "w-1.5 bg-line"}`}
          key={item}
        />
      ))}
    </div>
  );
}

function OnboardingHeader() {
  return (
    <header className="relative flex h-20 items-center justify-center">
      <GeselligMark className="h-14 w-14 text-ink" />
      <div className="absolute right-0 top-3">
        <DutchFlag />
      </div>
    </header>
  );
}

function AppHeader() {
  return (
    <header className="mb-5 flex items-center justify-between">
      <Logo />
      <div className="flex items-center gap-2">
        <DutchFlag />
      </div>
    </header>
  );
}

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <section className="flex flex-1 flex-col">
      <div className="flex flex-1 items-center">
        <div>
          <h1 className="title-lg">Make free moments social.</h1>
          <p className="body-copy mt-2">Find a walk, coffee, museum visit, or local table that fits your time and comfort.</p>
        </div>
      </div>
      <div className="space-y-3 pb-4">
        <button className="cta w-full" onClick={onNext} type="button">
          Continue
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
  const canContinue = profile.displayName.trim().length > 0 && profile.neighborhood.trim().length > 0;

  return (
    <section className="space-y-5">
      <div className="pt-0">
        <h1 className="title-lg">What should people call you?</h1>
        <p className="body-copy mt-2">Use a first name or alias. You can change it later.</p>
      </div>
      <div className="space-y-3">
        <label className="block">
          <span className="mb-2 block text-[12px] font-semibold text-muted">Name or alias</span>
          <input
            className="input"
            onChange={(event) => setProfile({ ...profile, displayName: event.target.value })}
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
          <div className="flex min-w-0 items-start gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-green" size={22} />
            <div>
              <p className="text-[15px] font-semibold">Privacy-first by design</p>
              <p className="body-copy mt-1">
                Municipality dashboards show grouped trends only, never individual resident details.
              </p>
            </div>
          </div>
        </div>
      </div>
      <button
        className="cta w-full disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canContinue}
        onClick={onNext}
        type="button"
      >
        Continue
        <ArrowRight size={17} />
      </button>
    </section>
  );
}

type PreferencesScreenProps = {
  profile: ResidentProfile;
  setProfile: (profile: ResidentProfile) => void;
  onNext: () => void;
};

function InterestsScreen({ profile, setProfile, onNext }: PreferencesScreenProps) {
  const { isRecording, start, stop, liveWords, matchedInterests } = useVoiceInput();
  const [showManual, setShowManual] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [customInterests, setCustomInterests] = useState<string[]>([]);

  useEffect(() => {
    const missing = matchedInterests.filter((interest) => !profile.interests.includes(interest));
    if (missing.length === 0) return;
    setProfile({ ...profile, interests: [...profile.interests, ...missing] });
  }, [matchedInterests, profile, setProfile]);

  const toggleInterest = (interest: Interest) => {
    if (interest === "other") return;
    const next = profile.interests.includes(interest)
      ? profile.interests.filter((item) => item !== interest)
      : [...profile.interests, interest];
    setProfile({ ...profile, interests: next });
  };

  const addCustomInterest = () => {
    const name = otherText.trim();
    if (!name || customInterests.includes(name)) return;
    setCustomInterests((c) => [...c, name]);
    if (!profile.interests.includes("other")) {
      setProfile({ ...profile, interests: [...profile.interests, "other"] });
    }
    setOtherText("");
  };

  const removeCustom = (name: string) => {
    const next = customInterests.filter((c) => c !== name);
    setCustomInterests(next);
    if (next.length === 0) {
      setProfile({ ...profile, interests: profile.interests.filter((i) => i !== "other") });
    }
  };

  const hasInterests = profile.interests.length > 0;

  if (showManual) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="title-lg">Pick your interests</h1>
          <p className="body-copy mt-2">Select activities you enjoy.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {interests.filter((i) => i.id !== "other").map((item) => (
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
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Something else?</p>
          <div className="flex items-center gap-2">
            <input
              className="min-w-0 flex-1 rounded-full border border-line bg-white px-4 py-2 text-[14px] outline-none shadow-card"
              placeholder="Type your interest"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomInterest(); } }}
            />
            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white disabled:opacity-30"
              disabled={!otherText.trim()}
              onClick={addCustomInterest}
              type="button"
            >
              <ArrowRight size={16} />
            </button>
          </div>
          {customInterests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customInterests.map((name) => (
                <span className="pill pill-active flex items-center gap-1" key={name}>
                  {name}
                  <button className="ml-1 text-white/70 hover:text-white" onClick={() => removeCustom(name)} type="button">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          className="cta w-full disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!hasInterests}
          onClick={onNext}
          type="button"
        >
          Continue
          <ArrowRight size={17} />
        </button>
        <button className="cta-secondary w-full" onClick={() => setShowManual(false)} type="button">
          Back to voice input
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="title-lg">What would you like to do with others?</h1>
        <p className="body-copy mt-2">Tell us what you enjoy — tap the mic and speak freely.</p>
      </div>
      <div className="flex flex-col items-center gap-3 py-4">
        <button
          className={`voice-bubble ${isRecording ? "voice-bubble-active" : ""}`}
          onClick={isRecording ? stop : start}
          type="button"
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? <Square size={28} /> : <Mic size={28} />}
        </button>
        <p className="transcript-live h-6 text-center text-[14px] text-muted">
          {isRecording ? (liveWords || "Listening...") : liveWords ? liveWords : "Tap to speak your interests"}
        </p>
      </div>
      <div className="min-h-[48px]">
        <div className="flex flex-wrap gap-2">
          {profile.interests.filter((id) => id !== "other").map((id) => {
            const item = interests.find((i) => i.id === id);
            return item ? (
              <span className="pill pill-active animate-pop" key={id}>
                {item.label}
              </span>
            ) : null;
          })}
          {customInterests.map((name) => (
            <span className="pill pill-active animate-pop flex items-center gap-1" key={name}>
              {name}
              <button className="ml-1 text-white/70 hover:text-white" onClick={() => removeCustom(name)} type="button">×</button>
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          className="min-w-0 flex-1 rounded-full border border-line bg-white px-4 py-2 text-[14px] outline-none shadow-card"
          placeholder="Add something else"
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomInterest(); } }}
        />
        <button
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white disabled:opacity-30"
          disabled={!otherText.trim()}
          onClick={addCustomInterest}
          type="button"
        >
          <ArrowRight size={16} />
        </button>
      </div>
      <button
        className="cta w-full disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!hasInterests}
        onClick={onNext}
        type="button"
      >
        Continue
        <ArrowRight size={17} />
      </button>
      <button className="cta-secondary w-full" onClick={() => setShowManual(true)} type="button">
        Pick manually instead
      </button>
    </section>
  );
}

function ComfortScreen({ profile, setProfile, onNext }: PreferencesScreenProps) {
  const toggleComfort = (key: ComfortKey) => {
    setProfile({ ...profile, comfort: { ...profile.comfort, [key]: !profile.comfort[key] } });
  };
  const canContinue = Object.values(profile.comfort).some(Boolean);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="title-lg">What feels comfortable?</h1>
        <p className="body-copy mt-2">These choices filter suggestions before anything is shown.</p>
      </div>
      <div className="grid gap-2.5">
        {comfortOptions.map((item) => (
          <button className="rounded-[20px] border border-line bg-white px-4 py-3 text-left shadow-card" key={item.id} onClick={() => toggleComfort(item.id)} type="button">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold tracking-[-0.2px]">{item.label}</p>
                <p className="mt-0.5 text-[13px] text-muted">{item.helper}</p>
              </div>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  profile.comfort[item.id] ? "bg-orange text-white" : "bg-line text-muted"
                }`}
              >
                {profile.comfort[item.id] ? <Check size={16} /> : null}
              </span>
            </div>
          </button>
        ))}
      </div>
      <button
        className="cta mt-2 w-full disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canContinue}
        onClick={onNext}
        type="button"
      >
        Continue
        <ArrowRight size={17} />
      </button>
    </section>
  );
}

type CalendarConnectScreenProps = {
  calendarConnected: boolean;
  onConnect: () => void;
  onManual: () => void;
};

function CalendarConnectScreen({ calendarConnected, onConnect, onManual }: CalendarConnectScreenProps) {
  const freeDays = new Set([1, 3, 4, 5]);
  return (
    <section className="space-y-6">
      <div>
        <h1 className="title-lg">Connect your calendar?</h1>
        <p className="body-copy mt-2">Optional. You can skip and set free windows manually.</p>
      </div>
      <div className="soft-card space-y-4">
        <div className="grid h-44 grid-cols-7 gap-1 rounded-[22px] bg-canvas p-3">
          {liveWeek.map((day, index) => (
            <div
              className={`rounded-2xl p-2 text-center text-[11px] ${
                freeDays.has(index) ? "bg-orange text-white" : "bg-white text-muted"
              }`}
              key={day.monthDay}
            >
              <p className="font-semibold">{day.day}</p>
              <p className="mt-1">{day.monthDay.split(" ")[1]}</p>
              {freeDays.has(index) && <p className="mt-5 text-[10px]">free</p>}
            </div>
          ))}
        </div>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 text-green" size={22} />
          <p className="text-[13px] leading-5 text-muted">
            Demo import only reads free windows. Production needs explicit consent, revocation, and deletion.
          </p>
        </div>
      </div>
      <button className="cta w-full" onClick={onConnect} type="button">
        {calendarConnected ? "Calendar connected ✓" : "Connect calendar"}
        <CalendarDays size={17} />
      </button>
      <button className="cta-secondary w-full" onClick={onManual} type="button">
        Set times manually
      </button>
    </section>
  );
}

type AvailabilityScreenProps = {
  profile: ResidentProfile;
  setProfile: (profile: ResidentProfile) => void;
  onNext: () => void;
};

function ManualAvailabilityScreen({ profile, setProfile, onNext }: AvailabilityScreenProps) {
  const [entryText, setEntryText] = useState("");
  const generatedEntry = useMemo(() => parseCalendarInput(entryText), [entryText]);
  const canAdd = entryText.trim().length > 0 && generatedEntry.hasTime;

  const addGeneratedEntry = () => {
    if (!canAdd) return;
    const exists = profile.availability.some(
      (slot) =>
        slot.label === generatedEntry.label &&
        slot.day === generatedEntry.day &&
        slot.startTime === generatedEntry.startTime,
    );

    setProfile({
      ...profile,
      availability: exists
        ? profile.availability
        : [
            ...profile.availability,
            {
              day: generatedEntry.day,
              label: generatedEntry.label,
              startTime: generatedEntry.startTime,
              endTime: generatedEntry.endTime,
            },
          ],
    });
    setEntryText("");
  };

  return (
    <section className="flex min-h-[650px] flex-col space-y-5">
      <div>
        <h1 className="title-lg">Set your free windows</h1>
        <p className="body-copy mt-2">Add times you are open to making social. Habits come next.</p>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Free moment</span>
          <div className="flex items-center gap-2 rounded-[18px] border border-line bg-white px-3 py-2 shadow-card">
            <input
              className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold tracking-[-0.3px] outline-none placeholder:text-muted"
              onChange={(event) => setEntryText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addGeneratedEntry();
                }
              }}
              placeholder="Tuesday 19:00-20:00"
              value={entryText}
            />
            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white transition active:scale-95 disabled:opacity-30"
              disabled={!canAdd}
              onClick={addGeneratedEntry}
              type="button"
              aria-label="Add to calendar"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1 text-[11px] font-semibold text-muted">
          {["Tuesday 19:00-20:00", "Saturday 10:00-12:00"].map((example) => (
            <button
              className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 shadow-card"
              key={example}
              onClick={() => setEntryText(example)}
              type="button"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] border border-line bg-white px-3 py-2 shadow-card">
        <div className="flex items-center gap-3">
          <CalendarDays className="shrink-0 text-orange" size={17} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold">{entryText.trim() ? generatedEntry.title : "Generated calendar input"}</p>
            <p className="mt-0.5 text-[12px] text-muted">
              {generatedEntry.hasTime ? `${generatedEntry.day}, ${generatedEntry.startTime}-${generatedEntry.endTime}` : "Waiting for a time like 17:00"}
            </p>
          </div>
          {generatedEntry.hasTime ? <Check className="shrink-0 text-green" size={17} /> : null}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Calendar</p>
        {profile.availability.length > 0 ? (
          profile.availability.map((slot) => (
            <div className="flex items-center gap-3 rounded-[18px] border border-line bg-white px-3 py-2.5 shadow-card" key={`${slot.label}-${slot.day}-${slot.startTime}`}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orangeSoft text-[11px] font-semibold text-orange">
                {slot.day.slice(0, 3)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold">{slot.label}</p>
                <p className="text-[12px] text-muted">{slot.startTime}-{slot.endTime}</p>
              </div>
              <button
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-line hover:text-ink"
                onClick={() => setProfile({
                  ...profile,
                  availability: profile.availability.filter((s) => !(s.label === slot.label && s.day === slot.day && s.startTime === slot.startTime)),
                })}
                type="button"
                aria-label="Remove"
              >
                <X size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-[18px] border border-line bg-white px-3 py-2.5 text-[13px] font-semibold text-muted shadow-card">
            No calendar entries yet
          </div>
        )}
      </div>

      <button
        className="cta mt-auto w-full disabled:cursor-not-allowed disabled:opacity-40"
        disabled={profile.availability.length === 0}
        onClick={onNext}
        type="button"
      >
        Continue
        <ArrowRight size={17} />
      </button>
    </section>
  );
}

function HabitsScreen({ profile, setProfile, onNext }: AvailabilityScreenProps) {
  const [entryText, setEntryText] = useState("");
  const generatedHabit = useMemo(() => parseCalendarInput(entryText), [entryText]);
  const canAdd = entryText.trim().length > 0 && generatedHabit.hasTime;

  const habitLabel = generatedHabit.hasTime
    ? `${generatedHabit.title} · ${generatedHabit.day} ${generatedHabit.startTime}-${generatedHabit.endTime}`
    : generatedHabit.title;

  const addHabit = () => {
    if (!canAdd) return;
    setProfile({
      ...profile,
      routines: profile.routines.includes(habitLabel) ? profile.routines : [...profile.routines, habitLabel],
    });
    setEntryText("");
  };

  return (
    <section className="flex min-h-[650px] flex-col space-y-5">
      <div>
        <h1 className="title-lg">Add your habits</h1>
        <p className="body-copy mt-2">Habits are routines you might want to make social. They stay separate from free windows.</p>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Habit</span>
          <div className="flex items-center gap-2 rounded-[18px] border border-line bg-white px-3 py-2 shadow-card">
            <input
              className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold tracking-[-0.3px] outline-none placeholder:text-muted"
              onChange={(event) => setEntryText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addHabit();
                }
              }}
              placeholder="Coffee break Tuesday 19:00-20:00"
              value={entryText}
            />
            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white transition active:scale-95 disabled:opacity-30"
              disabled={!canAdd}
              onClick={addHabit}
              type="button"
              aria-label="Add habit"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1 text-[11px] font-semibold text-muted">
          {["Coffee break Tuesday 19:00-20:00", "Basketball training Thursday 17:00-18:30"].map((example) => (
            <button
              className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 shadow-card"
              key={example}
              onClick={() => setEntryText(example)}
              type="button"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] border border-line bg-white px-3 py-2 shadow-card">
        <div className="flex items-center gap-3">
          <Users className="shrink-0 text-orange" size={17} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold">{entryText.trim() ? generatedHabit.title : "Generated habit"}</p>
            <p className="mt-0.5 text-[12px] text-muted">
              {generatedHabit.hasTime ? `${generatedHabit.day}, ${generatedHabit.startTime}-${generatedHabit.endTime}` : "Waiting for a range like 19:00-20:00"}
            </p>
          </div>
          {generatedHabit.hasTime ? <Check className="shrink-0 text-green" size={17} /> : null}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Habits</p>
        {profile.routines.length > 0 ? (
          profile.routines.map((routine) => (
            <div className="rounded-[18px] border border-line bg-white px-3 py-2.5 text-[13px] font-semibold shadow-card" key={routine}>
              {routine}
            </div>
          ))
        ) : (
          <div className="rounded-[18px] border border-line bg-white px-3 py-2.5 text-[13px] font-semibold text-muted shadow-card">
            No habits yet
          </div>
        )}
      </div>

      <button
        className="cta mt-auto w-full disabled:cursor-not-allowed disabled:opacity-40"
        disabled={profile.routines.length === 0}
        onClick={onNext}
        type="button"
      >
        Continue
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
    <article className="rounded-[24px] bg-white p-3 shadow-card">
      <div className="flex gap-3">
        <div className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-[18px] bg-tertiary">
          <img alt="" className="h-full w-full object-cover" src={getSuggestionImage(suggestion)} />
          <div className="absolute inset-0 bg-black/5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[12px] font-semibold text-muted">{suggestion.hostName ?? "Gesellig"} hosts</p>
            <span className="shrink-0 text-[12px] font-semibold text-orange">{suggestion.matchScore}% fit</span>
          </div>
          <h2 className="mt-1 text-[18px] font-semibold leading-[21px] tracking-[-0.4px]">{suggestion.title}</h2>
          <p className="mt-2 truncate text-[13px] text-muted">{suggestion.neighborhood}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold">
          <CalendarDays size={14} />
          {suggestion.time.day.slice(0, 3)} {suggestion.time.startTime}
        </span>
        <span className="rounded-full bg-tertiary px-2.5 py-1 text-[11px] font-semibold text-muted">
          {suggestion.confirmedCount}/{suggestion.capacity} spots
        </span>
        <button className="rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-white" onClick={() => onAccept(suggestion)} type="button">
          Accept
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-full bg-tertiary text-ink" onClick={() => onReject(suggestion.id)} type="button" aria-label="Reject">
          <X size={15} />
        </button>
      </div>
    </article>
  );
}

type SuggestionsScreenProps = {
  acceptedList: ActivitySuggestion[];
  blockedContacts: string[];
  onCreateEvent: () => void;
  onResetRejected: () => void;
  suggestions: ActivitySuggestion[];
  onAccept: (suggestion: ActivitySuggestion) => void;
  onMessage: (person: ChatPerson) => void;
  onReject: (id: string) => void;
};

const FIXED_PROMPT = "I'm really craving some sushi today, but I only have time from 6pm to 8pm. Please find me a matching event.";
const FIXED_SUGGESTION: ActivitySuggestion = {
  id: "ai-sushi-night",
  title: "Sushi night at Sumo",
  interest: "cooking",
  locationName: "Sumo Rotterdam",
  neighborhood: "Centrum",
  isPublicPlace: true,
  isCommunityHosted: false,
  hostName: "Sumo staff",
  groupSize: "small_group",
  capacity: 6,
  confirmedCount: 2,
  time: { day: "Today", label: "Today evening", startTime: "18:00", endTime: "20:00" },
  status: "open",
  matchScore: 95,
  matchReasons: ["Matches your craving for sushi", "Fits 18:00-20:00 window", "Public restaurant in Centrum"],
};

function AiPromptSection({ onAccept, onCreateEvent }: { onAccept: (s: ActivitySuggestion) => void; onCreateEvent: () => void }) {
  const { isRecording, start, stop, liveWords, finalText } = useVoiceInput();
  const [draft, setDraft] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    const text = draft.trim() || finalText.trim() || liveWords.trim();
    if (!text) return;
    if (isRecording) stop();
    if (!draft.trim()) setDraft(text);
    setShowResult(true);
  };

  return (
    <>
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">What do you feel like doing?</p>
        <div className="flex items-center gap-2 rounded-[18px] border border-line bg-white px-3 py-2 shadow-card">
          <input
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted"
            placeholder="Tell us what you're in the mood for..."
            value={isRecording ? "" : draft || finalText}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSubmit(); } }}
            readOnly={isRecording}
          />
          <button
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${isRecording ? "bg-orange text-white" : "bg-tertiary text-muted"}`}
            onClick={isRecording ? stop : start}
            type="button"
            aria-label={isRecording ? "Stop" : "Speak"}
          >
            <Mic size={14} />
          </button>
          <button
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-white disabled:opacity-30"
            disabled={!draft.trim() && !finalText.trim() && !isRecording}
            onClick={handleSubmit}
            type="button"
            aria-label="Submit"
          >
            <ArrowRight size={14} />
          </button>
        </div>
        {isRecording && (
          <p className="text-[13px] text-muted italic">{liveWords || "Listening..."}</p>
        )}
      </div>

      {showResult && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowResult(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative mx-auto w-full max-w-[430px] animate-slideUp rounded-t-[28px] bg-white px-5 pb-6 pt-4" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-semibold text-orange">Your request</p>
                <p className="mt-1 text-[14px] italic text-muted">"{draft}"</p>
              </div>
              <div className="rounded-[14px] bg-canvas p-3 text-[12px] leading-relaxed text-muted">
                <p className="font-semibold text-ink">Prototype notice</p>
                <p className="mt-1">Since this is a prototype without a live LLM API, we process this fixed prompt instead:</p>
                <p className="mt-2 font-medium text-ink">"{FIXED_PROMPT}"</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-muted">Suggested match</p>
                <div className="mt-2 rounded-[18px] border border-line bg-white p-3 shadow-card">
                  <p className="text-[16px] font-semibold">{FIXED_SUGGESTION.title}</p>
                  <p className="mt-0.5 text-[12px] text-muted">{FIXED_SUGGESTION.time.startTime}-{FIXED_SUGGESTION.time.endTime} · {FIXED_SUGGESTION.locationName}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {FIXED_SUGGESTION.matchReasons.map((r) => (
                      <span className="rounded-full bg-orangeSoft px-2 py-0.5 text-[11px] font-medium text-orange" key={r}>{r}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                className="cta w-full"
                onClick={() => { onAccept(FIXED_SUGGESTION); setShowResult(false); setDraft(""); }}
                type="button"
              >
                Sign up for this
                <ArrowRight size={16} />
              </button>
              <button className="cta-secondary w-full" onClick={() => { setShowResult(false); onCreateEvent(); }} type="button">
                Create your own event instead
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SuggestionsScreen({
  acceptedList,
  blockedContacts,
  onAccept,
  onCreateEvent,
  onMessage,
  onReject,
  onResetRejected,
  suggestions,
}: SuggestionsScreenProps) {
  const acceptedIds = new Set(acceptedList.map((s) => s.id));
  const visibleSuggestions = suggestions.filter((suggestion) => !acceptedIds.has(suggestion.id));

  return (
    <section className="space-y-6">
      <div className="space-y-2 pt-3">
        <h1 className="text-[28px] font-normal leading-[34px] tracking-[-0.7px]">
          Good afternoon<br />
          from <span className="text-orange">Rotterdam</span>
        </h1>
        <span className="inline-flex rounded-full bg-tertiary px-2.5 py-1 text-[12px] font-medium text-muted">Today</span>
      </div>
      <AiPromptSection onAccept={onAccept} onCreateEvent={onCreateEvent} />
      <div className="space-y-3">
        <h2 className="text-[18px] font-semibold tracking-[-0.4px]">Who's around</h2>
        <AroundList blockedContacts={blockedContacts} onMessage={onMessage} />
      </div>
      {acceptedList.length > 0 ? (
        <div className="space-y-2">
          {acceptedList.map((item) => (
            <div className="rounded-[20px] border border-orange bg-orangeSoft px-4 py-3" key={item.id}>
              <p className="text-[12px] font-semibold text-orange">Signed up</p>
              <p className="mt-1 text-[16px] font-semibold">{item.title}</p>
              <p className="text-[12px] text-muted">{formatTime(item.time)}</p>
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold tracking-[-0.4px]">Suggested plans</h2>
        <span className="text-[16px] leading-none text-muted">↕</span>
      </div>
      {visibleSuggestions.length > 0 ? (
        <div className="grid gap-3">
          {visibleSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              onAccept={onAccept}
              onReject={onReject}
              suggestion={suggestion}
            />
          ))}
        </div>
      ) : (
        <div className="soft-card text-center">
          <Users className="mx-auto text-orange" size={30} />
          <p className="mt-3 text-[16px] font-semibold">No matching groups left</p>
          <p className="body-copy mt-1">Reset rejected suggestions or adjust interests and time slots.</p>
          <button className="cta mt-4 w-full" onClick={onResetRejected} type="button">
            Reset suggestions
          </button>
        </div>
      )}
    </section>
  );
}

type AddEventScreenProps = {
  onAdd: (event: ActivitySession) => void;
};

const suggestedInvites = [
  { name: "Daan V.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", reason: "Free this evening" },
  { name: "Sophie K.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", reason: "Shared interest" },
  { name: "Ruben M.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", reason: "Nearby" },
];

function AddEventScreen({ onAdd }: AddEventScreenProps) {
  const [entryText, setEntryText] = useState("");
  const [locationName, setLocationName] = useState("Public place in Rotterdam");
  const [interest, setInterest] = useState<Interest>("community_events");
  const [invited, setInvited] = useState<string[]>([]);
  const generatedEvent = useMemo(() => parseCalendarInput(entryText), [entryText]);
  const canAdd = entryText.trim().length > 0 && generatedEvent.hasTime && locationName.trim().length > 0;

  const updateEntryText = (value: string) => {
    setEntryText(value);
    if (value.trim()) {
      setInterest(inferInterestFromText(value));
    }
  };

  const toggleInvite = (name: string) => {
    setInvited((cur) => cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name]);
  };

  const addEvent = () => {
    if (!canAdd) return;
    onAdd({
      id: `resident-event-${Date.now()}`,
      title: generatedEvent.title,
      interest,
      locationName: locationName.trim(),
      neighborhood: "Rotterdam",
      isPublicPlace: true,
      isCommunityHosted: false,
      hostName: "Resident plan",
      groupSize: "small_group",
      capacity: 6,
      confirmedCount: 1,
      time: {
        day: generatedEvent.day,
        label: generatedEvent.label,
        startTime: generatedEvent.startTime,
        endTime: generatedEvent.endTime,
      },
      status: "open",
    });
    setEntryText("");
    setLocationName("Public place in Rotterdam");
    setInvited([]);
  };

  return (
    <section className="flex min-h-[650px] flex-col space-y-5">
      <div>
        <div className="top-line mb-5" />
        <h1 className="title-lg">Add an event</h1>
        <p className="body-copy mt-2">Create a public plan others can join.</p>
      </div>

      <label className="block space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Plan</span>
        <div className="rounded-[20px] border border-line bg-white p-3 shadow-card">
          <input
            className="w-full bg-transparent text-[15px] font-semibold tracking-[-0.3px] outline-none placeholder:text-muted"
            onChange={(event) => updateEntryText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addEvent();
              }
            }}
            placeholder="Museum visit Friday 19:00-20:00"
            value={entryText}
          />
        </div>
      </label>

      <div className="flex gap-2 overflow-x-auto pb-1 text-[11px] font-semibold text-muted">
        {["Coffee break Tuesday 19:00-20:00", "Basketball training Thursday 17:00-18:00"].map((example) => (
          <button
            className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 shadow-card"
            key={example}
            onClick={() => updateEntryText(example)}
            type="button"
          >
            {example}
          </button>
        ))}
      </div>

      <label className="block space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Public place</span>
        <input
          className="input"
          onChange={(event) => setLocationName(event.target.value)}
          placeholder="Public place in Rotterdam"
          value={locationName}
        />
      </label>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Activity type</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {interests.map((item) => (
            <button
              className={`pill shrink-0 ${interest === item.id ? "pill-active" : ""}`}
              key={item.id}
              onClick={() => setInterest(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] border border-line bg-white px-3 py-3 shadow-card">
        <div className="flex items-center gap-3">
          <CalendarDays className="shrink-0 text-orange" size={17} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold">{entryText.trim() ? generatedEvent.title : "Generated calendar event"}</p>
            <p className="mt-0.5 text-[12px] text-muted">
              {generatedEvent.hasTime
                ? `${generatedEvent.day}, ${generatedEvent.startTime}-${generatedEvent.endTime}`
                : "Waiting for a range like 19:00-20:00"}
            </p>
          </div>
          {generatedEvent.hasTime ? <Check className="shrink-0 text-green" size={17} /> : null}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Suggested invites</p>
        {suggestedInvites.map((p) => (
          <button
            className={`flex w-full items-center gap-3 rounded-[18px] border bg-white px-3 py-2.5 shadow-card transition ${invited.includes(p.name) ? "border-orange" : "border-line"}`}
            key={p.name}
            onClick={() => toggleInvite(p.name)}
            type="button"
          >
            <img src={p.image} alt="" className="h-9 w-9 rounded-full object-cover" />
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[14px] font-semibold">{p.name}</p>
              <p className="text-[11px] text-muted">{p.reason}</p>
            </div>
            {invited.includes(p.name) ? (
              <Check className="shrink-0 text-orange" size={16} />
            ) : (
              <span className="shrink-0 text-[11px] font-semibold text-muted">Invite</span>
            )}
          </button>
        ))}
      </div>

      <button
        className="cta mt-auto w-full disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canAdd}
        onClick={addEvent}
        type="button"
      >
        Add event
        <Plus size={17} />
      </button>
    </section>
  );
}

type ConfirmedPopupProps = {
  confirmed: ActivitySuggestion;
  onDismiss: () => void;
  onViewParticipants: () => void;
  onChat: () => void;
};

function ConfirmedPopup({ confirmed, onDismiss, onViewParticipants, onChat }: ConfirmedPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onDismiss}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative mx-auto w-full max-w-[430px] animate-slideUp rounded-t-[28px] bg-white px-6 pb-8 pt-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-line" />
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex -space-x-3">
            <div className="h-[100px] w-[80px] overflow-hidden rounded-[16px] border-2 border-white shadow-card">
              <img src={brandAssets.heroImage} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="h-[100px] w-[80px] overflow-hidden rounded-[16px] border-2 border-white shadow-card">
              <img src={brandAssets.cityCardImage} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
          <p className="text-[18px] font-semibold tracking-[-0.3px]">Signed up for</p>
          <p className="mt-0.5 text-[22px] font-bold tracking-[-0.5px]">{confirmed.title}</p>
          <p className="mt-2 text-[13px] text-muted">{formatTime(confirmed.time)} · {confirmed.locationName}</p>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button
            className="flex-1 rounded-full border border-line bg-white py-3 text-center text-[14px] font-semibold shadow-card"
            onClick={onViewParticipants}
            type="button"
          >
            View participants
          </button>
          <button
            className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full bg-ink text-white shadow-card"
            onClick={onChat}
            type="button"
            aria-label="Group chat"
          >
            <MessageCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

const participantsList = [
  { name: "Daan V.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", isFriend: true },
  { name: "Sophie K.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", isFriend: false },
  { name: "You", image: "", isFriend: true },
];

function ParticipantsScreen({ activity, onBack, onChat }: { activity: ActivitySuggestion; onBack: () => void; onChat: (person: ChatPerson) => void }) {
  return (
    <section className="flex min-h-[650px] flex-col space-y-5">
      <div className="flex items-center gap-3">
        <button className="cta-secondary h-9 px-3" onClick={onBack} type="button">Back</button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[16px] font-semibold">{activity.title}</p>
          <p className="text-[11px] text-muted">{activity.confirmedCount + 1} participants</p>
        </div>
        <Users className="text-orange" size={20} />
      </div>
      <div className="space-y-3">
        {participantsList.map((p) => (
          <div className="flex items-center gap-3 rounded-[18px] border border-line bg-white px-4 py-3 shadow-card" key={p.name}>
            {p.image ? (
              <img src={p.image} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-orangeSoft text-orange">
                <UserRound size={18} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">{p.name}</p>
              <p className="text-[12px] text-muted">{p.name === "You" ? "That's you" : p.isFriend ? "Connected" : "New face"}</p>
            </div>
            {p.name !== "You" && (
              <button
                className="rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-white"
                onClick={() => onChat({ name: p.name, image: p.image, note: activity.title, daysLeft: "" })}
                type="button"
              >
                Message
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="soft-card mt-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-green" size={20} />
          <div>
            <p className="text-[13px] font-semibold">Public setting</p>
            <p className="text-[12px] text-muted">{activity.locationName} · small group · host present</p>
          </div>
        </div>
      </div>
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
        <p className="mb-3 text-[13px] font-semibold">How connected did you feel?</p>
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

function FeedbackSuccessScreen({
  onFriends,
  onGroups,
}: {
  onFriends: () => void;
  onGroups: () => void;
}) {
  return (
    <section className="flex min-h-[620px] flex-col justify-between space-y-6">
      <div>
        <div className="top-line mb-5" />
        <div className="grid h-16 w-16 place-items-center rounded-full bg-orangeSoft text-orange">
          <HeartHandshake size={28} />
        </div>
        <h1 className="title-lg mt-5">Thanks for sharing</h1>
        <p className="body-copy mt-2">
          Your feedback stays private. It only improves future suggestions and grouped city trends.
        </p>
      </div>
      <div className="space-y-3">
        <button className="cta w-full" onClick={onFriends} type="button">
          See meet-again list
        </button>
        <button className="cta-secondary w-full" onClick={onGroups} type="button">
          Back to groups
        </button>
      </div>
    </section>
  );
}

function ReportedScreen({ onGroups }: { onGroups: () => void }) {
  return (
    <section className="flex min-h-[620px] flex-col justify-between space-y-6">
      <div>
        <div className="top-line mb-5" />
        <div className="grid h-16 w-16 place-items-center rounded-full bg-orangeSoft text-orange">
          <ShieldCheck size={28} />
        </div>
        <h1 className="title-lg mt-5">This activity is hidden</h1>
        <p className="body-copy mt-2">
          We removed it from your suggestions. In production, a community host or moderator would review the report.
        </p>
      </div>
      <button className="cta w-full" onClick={onGroups} type="button">
        Back to groups
      </button>
    </section>
  );
}

function ChatScreen({
  person,
  onBack,
}: {
  person: ChatPerson;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    { id: "host", fromMe: false, text: `Hi, I'm open for ${person.note.toLowerCase()} this week.` },
    { id: "me", fromMe: true, text: "Great, public place works best for me." },
  ]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: `${Date.now()}`, fromMe: true, text }]);
    setDraft("");
  };

  return (
    <section className="flex min-h-[650px] flex-col">
      <div className="flex items-center justify-between gap-3">
        <button className="cta-secondary h-9 px-3" onClick={onBack} type="button">
          Back
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[16px] font-semibold">{person.name}</p>
          <p className="text-[11px] text-muted">Public activity chat</p>
        </div>
        <MessageCircle className="text-orange" size={22} />
      </div>
      <div className="mt-5 flex flex-1 flex-col gap-2">
        {messages.map((message) => (
          <div
            className={`max-w-[78%] rounded-[20px] px-4 py-2 text-[13px] leading-5 ${
              message.fromMe ? "ml-auto bg-ink text-white" : "mr-auto bg-white text-ink shadow-card"
            }`}
            key={message.id}
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-full border border-line bg-white p-2 shadow-card">
        <input
          className="min-w-0 flex-1 bg-transparent px-3 text-[14px] outline-none"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Message"
          value={draft}
        />
        <button className="grid h-10 w-10 place-items-center rounded-full bg-orange text-white" onClick={sendMessage} type="button" aria-label="Send message">
          <Send size={16} />
        </button>
      </div>
    </section>
  );
}

function CalendarScreen({
  onConnectPage,
  onCancelAccepted,
  onManual,
  onFeedback,
  onOpenAccepted,
  acceptedList,
  calendarConnected,
  feedback,
  profile,
}: {
  onConnectPage: () => void;
  onCancelAccepted: () => void;
  onManual: () => void;
  onFeedback: () => void;
  onOpenAccepted: (s: ActivitySuggestion) => void;
  acceptedList: ActivitySuggestion[];
  calendarConnected: boolean;
  feedback: Feedback[];
  profile: ResidentProfile;
}) {
  const attendedIds = new Set(feedback.filter((item) => item.attended).map((item) => item.suggestionId));
  const availabilitySource = calendarConnected ? "Calendar connection" : "Manual onboarding slots";

  return (
    <section className="space-y-5">
      <div>
        <div className="top-line mb-5" />
        <h1 className="title-lg">Your calendar</h1>
        <p className="body-copy mt-2">Free windows from onboarding and meet-ups you join.</p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Free windows</p>
          <span className="text-[11px] font-semibold text-orange">{availabilitySource}</span>
        </div>
        {profile.availability.length > 0 ? (
          profile.availability.map((slot) => (
            <div className="flex items-center gap-3 rounded-[18px] border border-line bg-white px-3 py-2.5 shadow-card" key={`${slot.label}-${slot.day}-${slot.startTime}`}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orangeSoft text-[11px] font-semibold text-orange">
                {slot.day.slice(0, 3)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">{slot.label}</p>
                <p className="text-[12px] text-muted">{slot.startTime}-{slot.endTime}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[18px] border border-line bg-white px-3 py-3 text-[13px] font-semibold text-muted shadow-card">
            No free windows yet
          </div>
        )}
      </div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Meet-ups</p>
      {acceptedList.length > 0 ? (
        <div className="grid gap-3">
          {acceptedList.map((item) => (
            <div className="soft-card" key={item.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-orange">
                    {attendedIds.has(item.id) ? "Attended" : "Signed up"}
                  </p>
                  <p className="mt-1 text-[16px] font-semibold">{item.title}</p>
                  <p className="text-[12px] text-muted">{formatTime(item.time)}</p>
                  <p className="text-[12px] text-muted">{item.locationName}</p>
                </div>
                {attendedIds.has(item.id) ? (
                  <Check className="text-green" size={24} />
                ) : (
                  <CalendarDays className="text-orange" size={24} />
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button className="cta-secondary" onClick={() => onOpenAccepted(item)} type="button">Open</button>
                <button className="cta-secondary" onClick={onCancelAccepted} type="button">Cancel</button>
              </div>
            </div>
          ))}
          <button className="cta w-full" onClick={onFeedback} type="button">
            Add feedback
          </button>
        </div>
      ) : (
        <div className="soft-card text-center">
          <CalendarDays className="mx-auto text-orange" size={28} />
          <p className="mt-3 text-[16px] font-semibold">No meet-ups yet</p>
          <p className="body-copy mt-1">Accept a group activity and it will appear here.</p>
        </div>
      )}
      <button className="cta w-full" onClick={onConnectPage} type="button">
        Calendar connection
      </button>
      <button className="cta-secondary w-full" onClick={onManual} type="button">
        Edit manual slots
      </button>
    </section>
  );
}

function FriendsScreen({
  blockedContacts,
  feedback,
  onMessage,
  onPlan,
}: {
  blockedContacts: string[];
  feedback: Feedback[];
  onMessage: (person: ChatPerson) => void;
  onPlan: () => void;
}) {
  const hasRepeat = feedback.some((item) => item.wantsRepeat);
  const friends = hasRepeat
    ? ["Ann James from the Kralingse Plas walk", "Lauren Brand from Depot Boijmans cafe"]
    : ["Ann James from nearby walks", "Lauren Brand from museum coffee"];
  const visibleFriends = friends
    .map((friend) => ({
      label: friend,
      person: peopleCards.find((person) => friend.startsWith(person.name)) ?? peopleCards[0],
    }))
    .filter((friend) => !blockedContacts.includes(friend.person.name));

  return (
    <section className="space-y-5">
      <div>
        <div className="top-line mb-5" />
        <h1 className="title-lg">People you may meet again</h1>
        <p className="body-copy mt-2">Longer-term connections build from repeat activities, not profile browsing.</p>
      </div>
      {!hasRepeat ? (
        <div className="soft-card border-orange bg-orangeSoft">
          <p className="text-[14px] font-semibold">No repeat contacts yet</p>
          <p className="text-[12px] text-muted">After feedback, people you choose to meet again appear here.</p>
        </div>
      ) : null}
      {visibleFriends.length > 0 ? null : (
        <div className="rounded-[18px] border border-line bg-white px-4 py-3 text-[13px] font-semibold text-muted shadow-card">
          No visible contacts
        </div>
      )}
      {visibleFriends.map((friend, index) => (
        <div className="soft-card flex items-center justify-between" key={friend.label}>
          <div className="flex items-center gap-3">
            <img alt="" className="h-14 w-14 rounded-[18px] object-cover" src={friend.person.image} />
            <div>
              <p className="text-[15px] font-semibold">{friend.label}</p>
              <p className="text-[12px] text-muted">{index === 0 && hasRepeat ? "Meet-again preference saved" : "Suggested through shared activities"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="cta-secondary h-9 px-3" onClick={() => onMessage(friend.person)} type="button">
              Message
            </button>
            <button className="cta-secondary h-9 px-3" onClick={onPlan} type="button">Plan</button>
          </div>
        </div>
      ))}
    </section>
  );
}

type SettingsScreenProps = {
  blockedContacts: string[];
  profile: ResidentProfile;
  setBlockedContacts: (contacts: string[]) => void;
  setProfile: (profile: ResidentProfile) => void;
};

function SettingsScreen({ blockedContacts, profile, setBlockedContacts, setProfile }: SettingsScreenProps) {
  const toggleBlockedContact = (name: string) => {
    setBlockedContacts(
      blockedContacts.includes(name)
        ? blockedContacts.filter((contact) => contact !== name)
        : [...blockedContacts, name],
    );
  };

  const settingInputClass = "w-full bg-transparent text-right text-[14px] font-semibold text-ink outline-none placeholder:text-muted";

  return (
    <section className="space-y-5 pb-4">
      <div>
        <div className="top-line mb-5" />
        <h1 className="title-lg">Settings</h1>
        <p className="body-copy mt-2">Manage your account, privacy, and safety preferences.</p>
      </div>

      <div className="rounded-[24px] border border-line bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-orangeSoft text-orange">
            <UserRound size={24} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold">{profile.displayName || "Alias"}</p>
            <p className="text-[12px] text-muted">{profile.neighborhood} · Public places only</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Account</p>
        <div className="overflow-hidden rounded-[22px] border border-line bg-white shadow-card">
          <label className="flex min-h-14 items-center gap-3 border-b border-line px-4">
            <UserRound className="shrink-0 text-muted" size={18} />
            <span className="text-[14px] font-semibold">Name</span>
            <input
              className={settingInputClass}
              onChange={(event) => setProfile({ ...profile, displayName: event.target.value })}
              value={profile.displayName}
            />
          </label>
          <label className="flex min-h-14 items-center gap-3 border-b border-line px-4">
            <MapPin className="shrink-0 text-muted" size={18} />
            <span className="text-[14px] font-semibold">Neighborhood</span>
            <select
              className="ml-auto bg-transparent text-right text-[14px] font-semibold text-ink outline-none"
              onChange={(event) => setProfile({ ...profile, neighborhood: event.target.value })}
              value={profile.neighborhood}
            >
              {neighborhoods.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="flex min-h-14 items-center gap-3 border-b border-line px-4">
            <Mail className="shrink-0 text-muted" size={18} />
            <span className="text-[14px] font-semibold">Email</span>
            <input
              className={settingInputClass}
              inputMode="email"
              onChange={(event) => setProfile({ ...profile, email: event.target.value })}
              value={profile.email}
            />
          </label>
          <label className="flex min-h-14 items-center gap-3 border-b border-line px-4">
            <Phone className="shrink-0 text-muted" size={18} />
            <span className="text-[14px] font-semibold">Phone</span>
            <input
              className={settingInputClass}
              inputMode="tel"
              onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
              value={profile.phone}
            />
          </label>
          <label className="flex min-h-14 items-center gap-3 px-4">
            <ImageIcon className="shrink-0 text-muted" size={18} />
            <span className="text-[14px] font-semibold">Photo URL</span>
            <input
              className={settingInputClass}
              onChange={(event) => setProfile({ ...profile, profileImage: event.target.value })}
              value={profile.profileImage}
            />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Privacy and safety</p>
        <div className="overflow-hidden rounded-[22px] border border-line bg-white shadow-card">
          <div className="flex min-h-14 items-center gap-3 border-b border-line px-4">
            <ShieldCheck className="shrink-0 text-green" size={18} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">Municipality dashboard</p>
              <p className="text-[12px] text-muted">Grouped trends only</p>
            </div>
            <span className="rounded-full bg-orangeSoft px-3 py-1 text-[11px] font-semibold text-orange">Private</span>
          </div>
          <div className="flex min-h-14 items-center gap-3 px-4">
            <Lock className="shrink-0 text-muted" size={18} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">Exact contact details</p>
              <p className="text-[12px] text-muted">Never shown to city teams</p>
            </div>
            <span className="rounded-full bg-tertiary px-3 py-1 text-[11px] font-semibold text-muted">Hidden</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Blocked contacts</p>
        <div className="overflow-hidden rounded-[22px] border border-line bg-white shadow-card">
          {peopleCards.map((person, index) => {
            const blocked = blockedContacts.includes(person.name);
            return (
              <button
                className={`flex w-full items-center justify-between px-4 py-3 text-left transition active:bg-tertiary ${
                  index < peopleCards.length - 1 ? "border-b border-line" : ""
                }`}
                key={person.name}
                onClick={() => toggleBlockedContact(person.name)}
                type="button"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold">{person.name}</p>
                  <p className="text-[12px] text-muted">{blocked ? "Blocked from chats and people lists" : person.note}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${blocked ? "bg-ink text-white" : "bg-tertiary text-muted"}`}>
                  {blocked ? "Unblock" : "Block"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type BottomNavProps = {
  active: Step;
  onAddEvent: () => void;
  onFriends: () => void;
  onHome: () => void;
  onCalendar: () => void;
  onSettings: () => void;
};

function BottomNav({ active, onAddEvent, onCalendar, onFriends, onHome, onSettings }: BottomNavProps) {
  const itemClass = (target: Step) =>
    `grid justify-items-center gap-1 rounded-2xl px-2 py-1.5 transition ${
      active === target || (target === "groups" && active === "home") ? "bg-orangeSoft text-orange" : ""
    }`;

  return (
    <nav className="bottom-nav">
      <button className={itemClass("groups")} onClick={onHome} type="button">
        <Home size={16} />
        Home
      </button>
      <button className={itemClass("calendar")} onClick={onCalendar} type="button">
        <CalendarDays size={16} />
        Calendar
      </button>
      <button className={itemClass("addEvent")} onClick={onAddEvent} type="button" aria-label="Add event">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white">
          <Plus size={17} />
        </span>
        Add
      </button>
      <button className={itemClass("friends")} onClick={onFriends} type="button">
        <UserRound size={16} />
        Friends
      </button>
      <button className={itemClass("settings")} onClick={onSettings} type="button">
        <Settings size={16} />
        Settings
      </button>
    </nav>
  );
}

export default function App() {
  const [step, setStep] = useState<Step>("welcome");
  const [mode, setMode] = useState<ViewMode>("mobile");
  const [profile, setProfile] = useState<ResidentProfile>(defaultProfile);
  const [acceptedList, setAcceptedList] = useState<ActivitySuggestion[]>([]);
  const [lastAccepted, setLastAccepted] = useState<ActivitySuggestion | null>(null);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [chatPerson, setChatPerson] = useState<ChatPerson | null>(null);
  const [showConfirmedPopup, setShowConfirmedPopup] = useState(false);
  const [userEvents, setUserEvents] = useState<ActivitySession[]>([]);
  const [blockedContacts, setBlockedContacts] = useState<string[]>([]);

  const allSessions = useMemo(() => [...userEvents, ...sessions], [userEvents]);
  const suggestions = useMemo(
    () => rankSuggestions(profile, allSessions, rejectedIds, blockedIds, feedback),
    [allSessions, blockedIds, feedback, profile, rejectedIds],
  );

  const goHome = () => {
    setMode("mobile");
    setStep("groups");
  };
  const goCalendar = () => {
    setMode("mobile");
    setStep("calendar");
  };
  const goFriends = () => {
    setMode("mobile");
    setStep("friends");
  };
  const goAddEvent = () => {
    setMode("mobile");
    setStep("addEvent");
  };
  const goSettings = () => {
    setMode("mobile");
    setStep("settings");
  };
  const importCalendarSlots = () => {
    setCalendarConnected(true);
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const now = new Date();
    const currentDay = now.getDay();
    const generated: AvailabilitySlot[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayName = days[(currentDay + i) % 7 || 7 - 1] || days[d.getDay() === 0 ? 6 : d.getDay() - 1];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

      if (i === 1 || i === 3 || i === 5) {
        generated.push({
          day: dayName,
          label: `${dayLabel} evening`,
          startTime: "18:00",
          endTime: "20:00",
        });
      }
      if (i === 4 || i === 5) {
        generated.push({
          day: dayName,
          label: `${dayLabel} morning`,
          startTime: "10:00",
          endTime: "12:00",
        });
      }
    }

    const merged = generated.reduce<AvailabilitySlot[]>((current, slot) => {
      return current.some((item) => item.label === slot.label) ? current : [...current, slot];
    }, profile.availability);
    setProfile({ ...profile, availability: merged });
    setStep("manualAvailability");
  };

  const acceptSuggestion = (suggestion: ActivitySuggestion) => {
    setAcceptedList((cur) => cur.some((s) => s.id === suggestion.id) ? cur : [...cur, suggestion]);
    setLastAccepted(suggestion);
    setShowConfirmedPopup(true);
  };

  const rejectSuggestion = (id: string) => setRejectedIds((current) => [...current, id]);
  const openChat = (person: ChatPerson) => {
    setChatPerson(person);
    setStep("chat");
  };
  const resetRejected = () => {
    setRejectedIds([]);
    setBlockedIds([]);
  };
  const addUserEvent = (event: ActivitySession) => {
    setUserEvents((current) => [event, ...current]);
    setStep("groups");
  };
  const cancelAccepted = () => {
    if (lastAccepted) {
      setAcceptedList((cur) => cur.filter((s) => s.id !== lastAccepted.id));
    }
    setLastAccepted(null);
    setStep("groups");
  };
  const planWithFriend = () => {
    const next = (suggestions[0] ?? sessions[0]) as ActivitySuggestion;
    if (next) acceptSuggestion(next);
  };

  const submitFeedback = (nextFeedback: Feedback) => {
    setFeedback((current) => [...current.filter((item) => item.suggestionId !== nextFeedback.suggestionId), nextFeedback]);
    setStep("feedbackSuccess");
  };

  const renderScreen = () => {
    if (step === "welcome") {
      return <WelcomeScreen onNext={() => setStep("profile")} />;
    }

    if (step === "profile") {
      return <ProfileScreen onNext={() => setStep("interests")} profile={profile} setProfile={setProfile} />;
    }

    if (step === "interests") {
      return <InterestsScreen onNext={() => setStep("comfort")} profile={profile} setProfile={setProfile} />;
    }

    if (step === "comfort") {
      return <ComfortScreen onNext={() => setStep("calendarConnect")} profile={profile} setProfile={setProfile} />;
    }

    if (step === "calendarConnect") {
      return (
        <CalendarConnectScreen
          calendarConnected={calendarConnected}
          onConnect={importCalendarSlots}
          onManual={() => setStep("manualAvailability")}
        />
      );
    }

    if (step === "manualAvailability") {
      return (
          <ManualAvailabilityScreen
          onNext={() => setStep("habits")}
          profile={profile}
          setProfile={setProfile}
        />
      );
    }

    if (step === "habits") {
      return (
        <HabitsScreen
          onNext={() => setStep("groups")}
          profile={profile}
          setProfile={setProfile}
        />
      );
    }

    if (step === "home") {
      return (
        <SuggestionsScreen
          acceptedList={acceptedList}
          blockedContacts={blockedContacts}
          onAccept={acceptSuggestion}
          onCreateEvent={goAddEvent}
          onMessage={openChat}
          onReject={rejectSuggestion}
          onResetRejected={resetRejected}
          suggestions={suggestions}
        />
      );
    }

    if (step === "calendar") {
      return (
        <CalendarScreen
          acceptedList={acceptedList}
          calendarConnected={calendarConnected}
          feedback={feedback}
          onCancelAccepted={cancelAccepted}
          onFeedback={() => (acceptedList.length > 0 ? setStep("feedback") : setStep("groups"))}
          onConnectPage={() => setStep("calendarConnect")}
          onManual={() => setStep("manualAvailability")}
          onOpenAccepted={(s) => {
            setLastAccepted(s);
            setShowConfirmedPopup(true);
          }}
          profile={profile}
        />
      );
    }

    if (step === "groups") {
      return (
        <SuggestionsScreen
          acceptedList={acceptedList}
          blockedContacts={blockedContacts}
          onAccept={acceptSuggestion}
          onCreateEvent={goAddEvent}
          onMessage={openChat}
          onReject={rejectSuggestion}
          onResetRejected={resetRejected}
          suggestions={suggestions}
        />
      );
    }

    if (step === "friends") {
      return <FriendsScreen blockedContacts={blockedContacts} feedback={feedback} onMessage={openChat} onPlan={planWithFriend} />;
    }

    if (step === "addEvent") {
      return <AddEventScreen onAdd={addUserEvent} />;
    }

    if (step === "settings") {
      return (
        <SettingsScreen
          blockedContacts={blockedContacts}
          profile={profile}
          setBlockedContacts={setBlockedContacts}
          setProfile={setProfile}
        />
      );
    }

    if (step === "chat" && chatPerson) {
      return <ChatScreen person={chatPerson} onBack={goHome} />;
    }

    if (step === "feedbackSuccess") {
      return <FeedbackSuccessScreen onFriends={goFriends} onGroups={goHome} />;
    }

    if (step === "reported") {
      return <ReportedScreen onGroups={goHome} />;
    }

    if (step === "confirmed") {
      return (
        <SuggestionsScreen
          acceptedList={acceptedList}
          blockedContacts={blockedContacts}
          onAccept={acceptSuggestion}
          onCreateEvent={goAddEvent}
          onMessage={openChat}
          onReject={rejectSuggestion}
          onResetRejected={resetRejected}
          suggestions={suggestions}
        />
      );
    }

    if (step === "participants" && lastAccepted) {
      return <ParticipantsScreen activity={lastAccepted} onBack={() => setStep("groups")} onChat={openChat} />;
    }

    if (step === "feedback" && lastAccepted) {
      return <FeedbackScreen onSubmit={submitFeedback} suggestionId={lastAccepted.id} />;
    }

    return null;
  };

  return (
    <main className="app-shell">
      <div className={mode === "dashboard" ? "dashboard-grid" : "prototype-grid"}>
        <ViewToggle mode={mode} setMode={setMode} />
        {mode === "mobile" ? (
          <div className="phone-frame relative">
            <StatusBar />
            <div className="screen-pad">
              {isOnboarding(step) ? <OnboardingHeader /> : null}
              {!isOnboarding(step) && step !== "welcome" && step !== "groups" && step !== "home" ? <AppHeader /> : null}
              {isOnboarding(step) ? <Progress step={step} /> : null}
              {renderScreen()}
            </div>
            {isTabStep(step) ? (
              <BottomNav
                active={step}
                onAddEvent={goAddEvent}
                onCalendar={goCalendar}
                onFriends={goFriends}
                onHome={goHome}
                onSettings={goSettings}
              />
            ) : null}
            {showConfirmedPopup && lastAccepted ? (
              <ConfirmedPopup
                confirmed={lastAccepted}
                onDismiss={() => setShowConfirmedPopup(false)}
                onViewParticipants={() => {
                  setShowConfirmedPopup(false);
                  setStep("participants");
                }}
                onChat={() => {
                  setShowConfirmedPopup(false);
                  openChat({ name: lastAccepted.hostName ?? "Group", image: "", note: "Group chat", daysLeft: "" });
                }}
              />
            ) : null}
          </div>
        ) : (
          <Dashboard
            acceptedCount={acceptedList.length}
            feedback={feedback}
            onMobile={() => {
              setMode("mobile");
              setStep("groups");
            }}
          />
        )}
      </div>
    </main>
  );
}
