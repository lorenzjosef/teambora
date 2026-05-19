import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  HeartHandshake,
  Home,
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
  Star,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useVoiceInput } from "./voice";
import businessPlanMarkdown from "../business_plan_v1.md?raw";
import {
  activityImages,
  availabilityOptions,
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
type ViewMode = "business" | "mobile" | "dashboard";
type ChatPerson = (typeof peopleCards)[number];

const onboardingSteps: Step[] = ["welcome", "profile", "interests", "comfort", "calendarConnect", "manualAvailability", "habits"];
const tabSteps: Step[] = ["home", "calendar", "groups", "addEvent", "friends", "settings"];
const isOnboarding = (step: Step) => onboardingSteps.includes(step);
const isTabStep = (step: Step) => tabSteps.includes(step);
const demoSkipInterests: Interest[] = ["coffee", "walking", "museums"];
const demoSkipAvailability = availabilityOptions.slice(1, 3);
const demoSkipRoutines = ["Coffee break · Tuesday 19:00-20:00", "Weekend walk · Saturday 10:00-11:00"];

const formatTime = (slot: AvailabilitySlot) => `${slot.day}, ${slot.startTime}-${slot.endTime}`;
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const weekdayLookup = new Map(weekdays.flatMap((day) => [[day.toLowerCase(), day], [day.slice(0, 3).toLowerCase(), day]]));
const calendarDefaultDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
const minutesFromTime = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
const isMeetupPast = (slot: AvailabilitySlot, now = new Date()) => {
  const meetupDayIndex = weekdays.indexOf(slot.day);
  if (meetupDayIndex === -1) return false;
  const todayIndex = weekdays.indexOf(now.toLocaleDateString("en-US", { weekday: "long" }));
  if (meetupDayIndex < todayIndex) return true;
  if (meetupDayIndex > todayIndex) return false;
  return minutesFromTime(slot.endTime) <= now.getHours() * 60 + now.getMinutes();
};

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
  if (lower.includes("basketball") || lower.includes("basketbal") || lower.includes("hoops")) return "basketball";
  if (lower.includes("fencing") || lower.includes("schermen")) return "fencing";
  if (lower.includes("hackathon") || lower.includes("coding") || lower.includes("startup")) return "hackathons";
  if (lower.includes("football") || lower.includes("soccer")) return "football";
  if (lower.includes("cinema") || lower.includes("movie")) return "cinema";
  return "community_events";
};

function DutchFlag() {
  return (
    <div className="overflow-hidden rounded-sm border border-black/10" aria-label="Dutch flag">
      <div className="h-1.5 w-7 bg-[#AE1C28]" />
      <div className="h-1.5 w-7 bg-white" />
      <div className="h-1.5 w-7 bg-[#21468B]" />
    </div>
  );
}

function ViewToggle({ mode, setMode }: { mode: ViewMode; setMode: (mode: ViewMode) => void }) {
  return (
    <div className="view-toggle" aria-label="Prototype view">
      {(["business", "mobile", "dashboard"] as const).map((item) => (
        <button
          className={`view-toggle-button ${mode === item ? "view-toggle-button-active" : ""}`}
          key={item}
          onClick={() => setMode(item)}
          type="button"
        >
          {item === "business" ? "Business Plan" : item === "mobile" ? "Mobile app" : "Dashboard"}
        </button>
      ))}
    </div>
  );
}

const renderInlineMarkdown = (text: string): ReactNode[] => {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

function BusinessPlanMarkdown({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const blocks: ReactNode[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) continue;
    if (trimmed === "---") {
      blocks.push(<hr className="my-8 border-line" key={index} />);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push(<h1 className="mt-2 text-[42px] font-semibold leading-[46px] tracking-normal" key={index}>{renderInlineMarkdown(trimmed.slice(2))}</h1>);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(<h2 className="mt-10 text-[26px] font-semibold leading-[32px] tracking-normal" key={index}>{renderInlineMarkdown(trimmed.slice(3))}</h2>);
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push(<h3 className="mt-6 text-[18px] font-semibold leading-6" key={index}>{renderInlineMarkdown(trimmed.slice(4))}</h3>);
      continue;
    }
    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        quoteLines.push(lines[index].trim().slice(2));
        index += 1;
      }
      index -= 1;
      blocks.push(
        <blockquote className="my-5 rounded-[8px] border-l-4 border-orange bg-orangeSoft px-4 py-3 text-[15px] font-semibold leading-6 text-ink" key={index}>
          {quoteLines.map((item) => renderInlineMarkdown(item)).flat()}
        </blockquote>,
      );
      continue;
    }
    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      index -= 1;
      const rows = tableLines
        .filter((row) => !/^\|[-\s|]+\|$/.test(row))
        .map((row) => row.split("|").slice(1, -1).map((cell) => cell.trim()));
      blocks.push(
        <div className="my-5 overflow-x-auto rounded-[8px] border border-line bg-white" key={index}>
          <table className="w-full min-w-[620px] text-left text-[13px]">
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr className={rowIndex === 0 ? "bg-tertiary font-semibold" : "border-t border-line"} key={`${index}-${rowIndex}`}>
                  {row.map((cell) => (
                    <td className="px-4 py-3 align-top" key={cell}>{renderInlineMarkdown(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (/^\d+\.\s/.test(trimmed) || trimmed.startsWith("- ")) {
      const listItems: string[] = [];
      const ordered = /^\d+\.\s/.test(trimmed);
      while (index < lines.length && (ordered ? /^\d+\.\s/.test(lines[index].trim()) : lines[index].trim().startsWith("- "))) {
        listItems.push(lines[index].trim().replace(/^\d+\.\s/, "").replace(/^-\s/, ""));
        index += 1;
      }
      index -= 1;
      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag className={`my-4 space-y-2 text-[15px] leading-7 text-muted ${ordered ? "list-decimal" : "list-disc"} pl-6`} key={index}>
          {listItems.map((item) => <li key={item}>{renderInlineMarkdown(item)}</li>)}
        </ListTag>,
      );
      continue;
    }

    blocks.push(<p className="my-4 text-[15px] leading-7 text-muted" key={index}>{renderInlineMarkdown(trimmed)}</p>);
  }

  return <div>{blocks}</div>;
}

function BusinessPlanView() {
  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-5 rounded-[8px] border border-line bg-white px-5 py-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img alt="" className="h-12 w-12 rounded-[16px]" src={brandAssets.logoMark} />
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-orange">Business Plan</p>
                <h1 className="text-[28px] font-semibold leading-tight tracking-normal">{brandAssets.logoWordmark}</h1>
              </div>
            </div>
            <span className="rounded-full bg-tertiary px-3 py-1.5 text-[12px] font-semibold text-muted">The Lonely City · Rotterdam pilot</span>
          </div>
        </div>
        <article className="rounded-[8px] border border-line bg-white px-6 py-7 shadow-card md:px-10 md:py-10">
          <BusinessPlanMarkdown markdown={businessPlanMarkdown} />
        </article>
      </div>
    </section>
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
  const regionalPlans: Record<string, string> = {
    "Lauren Brand": "Planning museum coffee in Centrum",
    "Youssef El Amrani": "Joining basketball in Delfshaven",
    "Nora van Dijk": "Joining civic hackathon in Centrum",
    "Mila de Boer": "Trying fencing in Noord",
    "Ann James": "Walking near Kralingen",
  };
  const visiblePeople = peopleCards
    .filter((person) => !blockedContacts.includes(person.name) && regionalPlans[person.name])
    .sort((a, b) => Object.keys(regionalPlans).indexOf(a.name) - Object.keys(regionalPlans).indexOf(b.name))
    .slice(0, 2);

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {visiblePeople.map((person) => (
        <article className="min-w-[112px] rounded-[18px] bg-tertiary px-3 py-3 text-center shadow-card" key={person.name}>
          <p className="truncate text-[13px] font-semibold tracking-[-0.2px]">{person.name}</p>
          <p className="mt-1 min-h-8 text-[11px] leading-4 text-muted">{regionalPlans[person.name]}</p>
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

function OnboardingHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="relative flex items-center justify-center py-3">
      <button
        className="absolute left-0 inline-flex items-center gap-1.5 text-[13px] font-bold text-ink transition active:scale-95"
        onClick={onBack}
        type="button"
        aria-label="Back"
      >
        <ArrowLeft size={22} strokeWidth={2.6} />
        Back
      </button>
      <div className="flex items-center gap-2">
        <img alt="" className="h-8 w-8 object-contain" src={brandAssets.logoMark} />
        <span className="text-base font-bold tracking-tight">{brandAssets.logoWordmark}</span>
      </div>
      <div className="absolute right-0">
        <DutchFlag />
      </div>
    </header>
  );
}

function BackButton({ label = "Back", onBack }: { label?: string; onBack: () => void }) {
  return (
    <button className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted transition hover:text-ink" onClick={onBack} type="button">
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <section className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="grid h-24 w-24 place-items-center rounded-[32px] bg-white shadow-card">
          <img alt="" className="h-16 w-16 object-contain" src={brandAssets.logoMark} />
        </div>
        <span className="text-2xl font-bold tracking-tight">{brandAssets.logoWordmark}</span>
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
  const setRecommendedComfort = () => {
    setProfile({
      ...profile,
      comfort: {
        ...profile.comfort,
        smallGroups: true,
        publicPlacesOnly: true,
      },
    });
  };

  const toggleOptionalComfort = (key: "communityHosted" | "oneToOne") => {
    setProfile({ ...profile, comfort: { ...profile.comfort, [key]: !profile.comfort[key] } });
  };

  const continueWithRecommended = () => {
    setProfile({
      ...profile,
      comfort: {
        ...profile.comfort,
        smallGroups: true,
        publicPlacesOnly: true,
      },
    });
    onNext();
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="title-lg">Start with easy plans</h1>
        <p className="body-copy mt-2">We will show small activities in public places first. You can change this later.</p>
      </div>

      <button className="soft-card w-full text-left" onClick={setRecommendedComfort} type="button">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-orangeSoft text-orange">
            <Users size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[17px] font-semibold leading-5">Public small groups</p>
              <span className="rounded-full bg-orange px-3 py-1 text-[11px] font-semibold text-white">Default</span>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-muted">2-5 people in visible places, like libraries, cafes, museums, or parks.</p>
          </div>
        </div>
      </button>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Optional</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`rounded-[20px] border px-3 py-3 text-left transition ${
              profile.comfort.communityHosted ? "border-orange bg-orangeSoft text-orange" : "border-line bg-white text-ink"
            }`}
            onClick={() => toggleOptionalComfort("communityHosted")}
            type="button"
          >
            <ShieldCheck size={18} />
            <p className="mt-2 text-[13px] font-semibold leading-4">Host nearby</p>
          </button>
          <button
            className={`rounded-[20px] border px-3 py-3 text-left transition ${
              profile.comfort.oneToOne ? "border-orange bg-orangeSoft text-orange" : "border-line bg-white text-ink"
            }`}
            onClick={() => toggleOptionalComfort("oneToOne")}
            type="button"
          >
            <UserRound size={18} />
            <p className="mt-2 text-[13px] font-semibold leading-4">Also show 1:1</p>
          </button>
        </div>
      </div>

      <button className="cta w-full" onClick={continueWithRecommended} type="button">
        Use this setup
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
  return (
    <section className="space-y-6">
      <div>
        <h1 className="title-lg">Connect your calendar?</h1>
        <p className="body-copy mt-2">Optional. You can skip and set free windows manually.</p>
      </div>
      <div className="soft-card">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 text-green" size={22} />
          <p className="text-[13px] leading-5 text-muted">
            I myself wouldn't want to connect my calendar to a sketchy vibe-coded app, so that button just simulates that behaviour.
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
  onOpen: (suggestion: ActivitySuggestion) => void;
  suggestion: ActivitySuggestion;
  onAccept: (suggestion: ActivitySuggestion) => void;
  onReject: (id: string) => void;
};

function SuggestionCard({ onAccept, onOpen, onReject, suggestion }: SuggestionCardProps) {
  return (
    <article
      className="cursor-pointer rounded-[24px] bg-white p-3 shadow-card transition active:scale-[0.99]"
      onClick={() => onOpen(suggestion)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(suggestion);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex gap-3">
        <div className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-[18px] bg-tertiary">
          <img alt="" className="h-full w-full object-cover" src={getSuggestionImage(suggestion)} />
          <div className="absolute inset-0 bg-black/5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[12px] font-semibold text-muted">{suggestion.hostName ?? "Gezellig"} hosts</p>
            <span className="shrink-0 text-[12px] font-semibold text-orange">{suggestion.matchScore}% fit</span>
          </div>
          <h2 className="mt-1 text-[18px] font-semibold leading-[21px] tracking-[-0.4px]">{suggestion.title}</h2>
          <p className="mt-2 truncate text-[13px] text-muted">{suggestion.neighborhood}</p>
          {suggestion.id === WILDCARD_SUGGESTION.id ? (
            <p className="mt-2 line-clamp-2 text-[12px] leading-4 text-muted">{suggestion.matchReasons[0]}</p>
          ) : null}
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
        <button
          className="rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-white"
          onClick={(event) => {
            event.stopPropagation();
            onAccept(suggestion);
          }}
          type="button"
        >
          Accept
        </button>
        <button
          className="grid h-9 w-9 place-items-center rounded-full bg-tertiary text-ink"
          onClick={(event) => {
            event.stopPropagation();
            onReject(suggestion.id);
          }}
          type="button"
          aria-label="Reject"
        >
          <X size={15} />
        </button>
      </div>
    </article>
  );
}

function SuggestionDetailSheet({
  onAccept,
  onClose,
  onReject,
  suggestion,
}: {
  onAccept: (suggestion: ActivitySuggestion) => void;
  onClose: () => void;
  onReject: (id: string) => void;
  suggestion: ActivitySuggestion;
}) {
  const openSpots = suggestion.capacity - suggestion.confirmedCount;
  const participants = getParticipantsForActivity(suggestion);

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative mx-auto flex max-h-[calc(100%-18px)] w-full animate-slideUp flex-col rounded-t-[28px] bg-white px-5 pb-6 pt-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        <div className="min-h-0 overflow-y-auto">
          <div className="relative h-40 overflow-hidden rounded-[22px] bg-tertiary">
            <img alt="" className="h-full w-full object-cover" src={getSuggestionImage(suggestion)} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <p className="text-[12px] font-semibold">{suggestion.hostName ?? "Gezellig"} hosts</p>
              <h2 className="mt-1 text-[22px] font-bold leading-[25px] tracking-[-0.5px]">{suggestion.title}</h2>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-[16px] bg-tertiary px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">When</p>
              <p className="mt-1 text-[13px] font-semibold">{suggestion.time.day.slice(0, 3)} {suggestion.time.startTime}</p>
            </div>
            <div className="rounded-[16px] bg-tertiary px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Where</p>
              <p className="mt-1 truncate text-[13px] font-semibold">{suggestion.neighborhood}</p>
            </div>
            <div className="rounded-[16px] bg-tertiary px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Fit</p>
              <p className="mt-1 text-[13px] font-semibold text-orange">{suggestion.matchScore}%</p>
            </div>
          </div>

          <div className="mt-4 rounded-[18px] border border-line bg-white p-4 shadow-card">
            <p className="text-[13px] font-semibold">Event details</p>
            <div className="mt-3 space-y-2 text-[13px] leading-5 text-muted">
              <p><span className="font-semibold text-ink">Location:</span> {suggestion.locationName}</p>
              <p><span className="font-semibold text-ink">Time:</span> {formatTime(suggestion.time)}</p>
              <p><span className="font-semibold text-ink">Group:</span> {suggestion.groupSize === "small_group" ? "Small group" : "One-to-one"} · {openSpots} spots left</p>
              <p><span className="font-semibold text-ink">Setting:</span> {suggestion.isPublicPlace ? "Public place" : "Private setting"}{suggestion.isCommunityHosted ? " · host present" : ""}</p>
            </div>
          </div>

          <div className="mt-4 rounded-[18px] border border-line bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold">Participants</p>
              <span className="text-[12px] font-semibold text-muted">{suggestion.confirmedCount + 1}/{suggestion.capacity}</span>
            </div>
            <div className="mt-3 space-y-2">
              {participants.map((participant) => (
                <div className="flex items-center gap-3" key={participant.name}>
                  <ParticipantAvatar participant={participant} className="h-9 w-9 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{participant.name}</p>
                    <p className="text-[11px] text-muted">{participant.name === "You" ? "You will join after accepting" : participant.isFriend ? "Met before" : "New participant"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {suggestion.matchReasons.length > 0 ? (
            <div className="mt-4 rounded-[18px] bg-orangeSoft p-4">
              <p className="text-[13px] font-semibold text-orange">Why this matches</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {suggestion.matchReasons.map((reason) => (
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink" key={reason}>{reason}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
          <button
            className="cta h-11"
            onClick={() => {
              onAccept(suggestion);
              onClose();
            }}
            type="button"
          >
            Accept plan
          </button>
          <button
            className="grid h-11 w-11 place-items-center rounded-full bg-tertiary text-ink"
            onClick={() => {
              onReject(suggestion.id);
              onClose();
            }}
            type="button"
            aria-label="Reject suggestion"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

type SuggestionsScreenProps = {
  acceptedList: ActivitySuggestion[];
  blockedContacts: string[];
  feedback: Feedback[];
  matchCandidates: ActivitySuggestion[];
  onCreateEvent: (prompt?: string) => void;
  onResetRejected: () => void;
  profile: ResidentProfile;
  suggestions: ActivitySuggestion[];
  onAccept: (suggestion: ActivitySuggestion) => void;
  onMessage: (person: ChatPerson) => void;
  onReject: (id: string) => void;
};

type MatchApiResponse = {
  suggestion: ActivitySuggestion | null;
  explanation: string;
  fallbackUsed?: boolean;
};

const WILDCARD_SUGGESTION: ActivitySuggestion = {
  id: "wildcard-local-event",
  title: "Wildcard: low-pressure local event",
  interest: "community_events",
  locationName: "Centrale Bibliotheek Rotterdam",
  neighborhood: "Centrum",
  isPublicPlace: true,
  isCommunityHosted: true,
  hostName: "Community hosts",
  groupSize: "small_group",
  capacity: 8,
  confirmedCount: 4,
  time: { day: "Friday", label: "Fri evening", startTime: "18:30", endTime: "20:00" },
  status: "open",
  matchScore: 72,
  matchReasons: ["Not based on your usual interests — suggested to help you meet people outside your normal routine."],
};

function AiPromptSection({
  feedback,
  matchCandidates,
  onAccept,
  onCreateEvent,
  profile,
  suggestions,
}: {
  feedback: Feedback[];
  matchCandidates: ActivitySuggestion[];
  onAccept: (s: ActivitySuggestion) => void;
  onCreateEvent: (prompt?: string) => void;
  profile: ResidentProfile;
  suggestions: ActivitySuggestion[];
}) {
  const { isRecording, start, stop, liveWords, finalText } = useVoiceInput();
  const [draft, setDraft] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchApiResponse | null>(null);
  const [matchError, setMatchError] = useState("");
  const selectLocalFallback = (text: string) => {
    const interest = inferInterestFromText(text);
    return matchCandidates.find((candidate) => candidate.interest === interest) ?? suggestions[0] ?? WILDCARD_SUGGESTION;
  };

  const handleSubmit = async () => {
    const text = draft.trim() || finalText.trim() || liveWords.trim();
    if (!text) return;
    if (isRecording) stop();
    if (!draft.trim()) setDraft(text);
    setShowResult(true);
    setIsMatching(true);
    setMatchError("");
    setMatchResult(null);

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          profile: {
            neighborhood: profile.neighborhood,
            travelRadiusKm: profile.travelRadiusKm,
            interests: profile.interests,
            comfort: profile.comfort,
            availability: profile.availability,
            routines: profile.routines,
          },
          feedbackSummary: {
            completed: feedback.filter((item) => item.attended).length,
            wantsRepeat: feedback.filter((item) => item.wantsRepeat).length,
            averageRating: feedback.length
              ? Math.round((feedback.reduce((sum, item) => sum + item.connectionRating, 0) / feedback.length) * 10) / 10
              : null,
          },
          candidates: matchCandidates.slice(0, 8),
        }),
      });

      if (!response.ok) throw new Error("Matcher unavailable");
      const payload = await response.json() as MatchApiResponse;
      if (!payload || (payload.suggestion !== null && typeof payload.suggestion?.id !== "string")) {
        throw new Error("Matcher returned invalid data");
      }
      setMatchResult({
        suggestion: payload.suggestion ?? selectLocalFallback(text),
        explanation: payload.explanation || "We found the closest available activity from your current options.",
        fallbackUsed: payload.fallbackUsed,
      });
    } catch {
      setMatchResult({
        suggestion: selectLocalFallback(text),
        explanation: "Best available plan based on your activity criteria.",
        fallbackUsed: true,
      });
      setMatchError("Criteria fit");
    } finally {
      setIsMatching(false);
    }
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
        <div className="absolute inset-0 z-50 flex items-end justify-center" onClick={() => setShowResult(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full animate-slideUp rounded-t-[28px] bg-white px-5 pb-6 pt-4" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-semibold text-orange">Your request</p>
                <p className="mt-1 text-[14px] italic text-muted">"{draft}"</p>
              </div>
              {isMatching ? (
                <div className="rounded-[18px] border border-line bg-white p-4 text-[13px] font-semibold text-muted shadow-card">
                  Matching your request with available public activities...
                </div>
              ) : matchResult?.suggestion ? (
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold text-muted">Suggested match</p>
                    {matchResult.fallbackUsed || matchError ? (
                      <span className="rounded-full bg-tertiary px-2 py-1 text-[10px] font-semibold text-muted">Criteria fit</span>
                    ) : (
                      <span className="rounded-full bg-orangeSoft px-2 py-1 text-[10px] font-semibold text-orange">OpenAI matched</span>
                    )}
                  </div>
                  <div className="mt-2 rounded-[18px] border border-line bg-white p-3 shadow-card">
                    <p className="text-[16px] font-semibold">{matchResult.suggestion.title}</p>
                    <p className="mt-0.5 text-[12px] text-muted">{matchResult.suggestion.time.startTime}-{matchResult.suggestion.time.endTime} · {matchResult.suggestion.locationName}</p>
                    <p className="mt-2 text-[12px] leading-5 text-muted">{matchResult.explanation}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {matchResult.suggestion.matchReasons.map((r) => (
                        <span className="rounded-full bg-orangeSoft px-2 py-0.5 text-[11px] font-medium text-orange" key={r}>{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[18px] border border-line bg-white p-4 text-[13px] font-semibold text-muted shadow-card">
                  No suitable activity was found. You can create your own event instead.
                </div>
              )}
              <button
                className="cta w-full disabled:cursor-not-allowed disabled:opacity-40"
                disabled={isMatching || !matchResult?.suggestion}
                onClick={() => {
                  if (!matchResult?.suggestion) return;
                  onAccept(matchResult.suggestion);
                  setShowResult(false);
                  setDraft("");
                  setMatchResult(null);
                }}
                type="button"
              >
                Sign up for this
                <ArrowRight size={16} />
              </button>
              <button className="cta-secondary w-full" onClick={() => { setShowResult(false); onCreateEvent(draft.trim() || finalText.trim() || liveWords.trim()); }} type="button">
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
  feedback,
  matchCandidates,
  onAccept,
  onCreateEvent,
  onMessage,
  onReject,
  onResetRejected,
  profile,
  suggestions,
}: SuggestionsScreenProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<ActivitySuggestion | null>(null);
  const [wildcardHidden, setWildcardHidden] = useState(false);
  const acceptedIds = new Set(acceptedList.map((s) => s.id));
  const baseSuggestions = suggestions.filter((suggestion) => !acceptedIds.has(suggestion.id));
  const showWildcard = !wildcardHidden && !acceptedIds.has(WILDCARD_SUGGESTION.id);
  const visibleSuggestions = showWildcard
    ? [...baseSuggestions.slice(0, 2), WILDCARD_SUGGESTION]
    : baseSuggestions.slice(0, 3);
  const rejectSuggestion = (id: string) => {
    if (id === WILDCARD_SUGGESTION.id) {
      setWildcardHidden(true);
      return;
    }
    onReject(id);
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2 pt-3">
        <h1 className="text-[28px] font-normal leading-[34px] tracking-[-0.7px]">
          Good afternoon<br />
          from <span className="text-orange">Rotterdam</span>
        </h1>
        <span className="inline-flex rounded-full bg-tertiary px-2.5 py-1 text-[12px] font-medium text-muted">Today</span>
      </div>
      <AiPromptSection feedback={feedback} matchCandidates={matchCandidates} onAccept={onAccept} onCreateEvent={onCreateEvent} profile={profile} suggestions={suggestions} />
      <div className="space-y-3">
        <h2 className="text-[18px] font-semibold tracking-[-0.4px]">Who's around</h2>
        <AroundList blockedContacts={blockedContacts} onMessage={onMessage} />
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold tracking-[-0.4px]">Suggested plans</h2>
        <span className="rounded-full bg-tertiary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
          Criteria fit
        </span>
      </div>
      {visibleSuggestions.length > 0 ? (
        <div className="grid gap-3">
          {visibleSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              onAccept={onAccept}
              onOpen={setSelectedSuggestion}
              onReject={rejectSuggestion}
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
      {selectedSuggestion ? (
        <SuggestionDetailSheet
          onAccept={onAccept}
          onClose={() => setSelectedSuggestion(null)}
          onReject={rejectSuggestion}
          suggestion={selectedSuggestion}
        />
      ) : null}
    </section>
  );
}

type AddEventScreenProps = {
  onAdd: (event: ActivitySession) => void;
  onBack: () => void;
  initialPrompt?: string;
};

const suggestedInvites = [
  { name: "Daan V.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", reason: "Free this evening" },
  { name: "Sophie K.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", reason: "Shared interest" },
  { name: "Ruben M.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", reason: "Nearby" },
];

const buildEventDraftFromPrompt = (prompt: string) => {
  const parsed = parseCalendarInput(prompt);
  const interest = inferInterestFromText(prompt);
  const lower = prompt.toLowerCase();
  const defaults: Record<Interest, { title: string; locationName: string; neighborhood: string; capacity: number; hosted: boolean }> = {
    basketball: { title: "Casual basketball run", locationName: "Lloyd Multiplein outdoor court", neighborhood: "Delfshaven", capacity: 10, hosted: false },
    fencing: { title: "Beginner fencing lesson", locationName: "Schermzaal Rotterdam Noord", neighborhood: "Noord", capacity: 8, hosted: true },
    hackathons: { title: "Civic tech hackathon table", locationName: "Cambridge Innovation Center Rotterdam", neighborhood: "Centrum", capacity: 12, hosted: true },
    football: { title: "Beginner five-a-side football", locationName: "Vroesenpark sports field", neighborhood: "Noord", capacity: 10, hosted: false },
    coffee: { title: "Coffee meetup", locationName: "Hopper Coffee Rotterdam", neighborhood: "Centrum", capacity: 4, hosted: false },
    museums: { title: "Museum visit", locationName: "Depot Boijmans Van Beuningen", neighborhood: "Museumpark", capacity: 5, hosted: true },
    walking: { title: "Evening walk", locationName: "Kralingse Plas entrance", neighborhood: "Kralingen", capacity: 6, hosted: true },
    board_games: { title: "Board games table", locationName: "Kaapse Brouwers", neighborhood: "Katendrecht", capacity: 6, hosted: true },
    cooking: { title: "Cooking swap", locationName: "Buurthuis Charlois", neighborhood: "Charlois", capacity: 6, hosted: true },
    studying: { title: "Study table", locationName: "Centrale Bibliotheek Rotterdam", neighborhood: "Centrum", capacity: 6, hosted: true },
    padel: { title: "Beginner padel", locationName: "Sportcentrum West", neighborhood: "Delfshaven", capacity: 4, hosted: false },
    cinema: { title: "Cinema visit", locationName: "LantarenVenster", neighborhood: "Katendrecht", capacity: 5, hosted: false },
    community_events: { title: "Low-pressure local event", locationName: "Centrale Bibliotheek Rotterdam", neighborhood: "Centrum", capacity: 8, hosted: true },
    yoga: { title: "Beginner yoga session", locationName: "Wijkcentrum Kralingen", neighborhood: "Kralingen", capacity: 8, hosted: true },
    cycling: { title: "Easy cycling loop", locationName: "Erasmusbrug meeting point", neighborhood: "Centrum", capacity: 6, hosted: false },
    photography: { title: "Phone photography walk", locationName: "Fenixloods entrance", neighborhood: "Katendrecht", capacity: 7, hosted: true },
    music: { title: "Open mic circle", locationName: "Delfshaven community stage", neighborhood: "Delfshaven", capacity: 9, hosted: true },
    gardening: { title: "Community garden hour", locationName: "DakAkker Rotterdam", neighborhood: "Centrum", capacity: 6, hosted: true },
    crafts: { title: "Repair and mending table", locationName: "Het Nieuwe Instituut cafe", neighborhood: "Museumpark", capacity: 6, hosted: true },
    swimming: { title: "Easy lane swim meetup", locationName: "Oostelijk Zwembad", neighborhood: "Kralingen", capacity: 6, hosted: false },
    dancing: { title: "Beginner dance class", locationName: "Dansschool Rotterdam", neighborhood: "Centrum", capacity: 10, hosted: true },
    languages: { title: "Dutch-English language table", locationName: "Centrale Bibliotheek Rotterdam", neighborhood: "Centrum", capacity: 8, hosted: true },
    other: { title: "Local meetup", locationName: "Public place in Rotterdam", neighborhood: "Centrum", capacity: 6, hosted: true },
  };
  const fallback = defaults[interest];
  const time = parsed.hasTime
    ? { day: parsed.day, startTime: parsed.startTime, endTime: parsed.endTime }
    : lower.includes("morning")
      ? { day: "Saturday", startTime: "10:00", endTime: "12:00" }
      : lower.includes("afternoon")
        ? { day: "Saturday", startTime: "14:00", endTime: "16:00" }
        : lower.includes("evening") || lower.includes("night")
          ? { day: "Thursday", startTime: "18:30", endTime: "20:00" }
          : { day: "Thursday", startTime: "18:00", endTime: "20:00" };

  return {
    title: prompt.trim() ? fallback.title : "",
    interest,
    locationName: prompt.trim() ? fallback.locationName : "Public place in Rotterdam",
    neighborhood: prompt.trim() ? fallback.neighborhood : "Centrum",
    capacity: prompt.trim() ? fallback.capacity : 6,
    isCommunityHosted: prompt.trim() ? fallback.hosted : false,
    ...time,
  };
};

function AddEventScreen({ initialPrompt = "", onAdd, onBack }: AddEventScreenProps) {
  const initialDraft = buildEventDraftFromPrompt(initialPrompt);
  const [wizardStep, setWizardStep] = useState(0);
  const [title, setTitle] = useState(initialDraft.title);
  const [day, setDay] = useState(initialDraft.day);
  const [startTime, setStartTime] = useState(initialDraft.startTime);
  const [endTime, setEndTime] = useState(initialDraft.endTime);
  const [locationName, setLocationName] = useState(initialDraft.locationName);
  const [neighborhood, setNeighborhood] = useState(initialDraft.neighborhood);
  const [interest, setInterest] = useState<Interest>(initialDraft.interest);
  const [capacity, setCapacity] = useState(initialDraft.capacity);
  const [isPublicPlace, setIsPublicPlace] = useState(true);
  const [isCommunityHosted, setIsCommunityHosted] = useState(initialDraft.isCommunityHosted);
  const [invited, setInvited] = useState<string[]>([]);
  const [inviteSearch, setInviteSearch] = useState("");
  const groupSize: ActivitySession["groupSize"] = capacity === 2 ? "one_to_one" : "small_group";
  const inviteOptions = [
    ...peopleCards
      .filter((person) => person.name !== "Alex Thomas")
      .map((person) => ({ name: person.name, image: person.image, reason: person.note ? `Friend · ${person.note}` : "Friend" })),
    ...suggestedInvites.map((person) => ({ ...person, reason: `Suggested · ${person.reason}` })),
  ];
  const filteredInviteOptions = inviteOptions.filter((person) => {
    const query = inviteSearch.trim().toLowerCase();
    if (!query) return true;
    return person.name.toLowerCase().includes(query) || person.reason.toLowerCase().includes(query);
  });

  const canContinue = [
    title.trim().length > 0 && startTime.trim().length > 0 && endTime.trim().length > 0,
    locationName.trim().length > 0 && neighborhood.trim().length > 0,
    Boolean(interest) && capacity > 0,
    true,
    title.trim().length > 0 && locationName.trim().length > 0,
  ][wizardStep];

  const setTitleFromExample = (value: string) => {
    const parsed = parseCalendarInput(value);
    setTitle(parsed.title);
    if (parsed.hasTime) {
      setDay(parsed.day);
      setStartTime(parsed.startTime);
      setEndTime(parsed.endTime);
    }
    setInterest(inferInterestFromText(value));
  };

  const toggleInvite = (name: string) => {
    setInvited((cur) => cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name]);
  };

  const addEvent = () => {
    if (!canContinue) return;
    onAdd({
      id: `resident-event-${Date.now()}`,
      title: title.trim(),
      interest,
      locationName: locationName.trim(),
      neighborhood,
      isPublicPlace,
      isCommunityHosted,
      hostName: "Resident plan",
      groupSize,
      capacity,
      confirmedCount: Math.min(capacity, Math.max(1, invited.length + 1)),
      time: {
        day,
        label: `${day} ${startTime}`,
        startTime,
        endTime,
      },
      status: "open",
    });
    setTitle("");
    setLocationName("Public place in Rotterdam");
    setNeighborhood("Centrum");
    setInvited([]);
    setInviteSearch("");
    setWizardStep(0);
  };

  const goBack = () => {
    if (wizardStep === 0) {
      onBack();
      return;
    }
    setWizardStep((current) => current - 1);
  };

  const goNext = () => {
    if (!canContinue) return;
    setWizardStep((current) => Math.min(current + 1, 4));
  };

  const stepLabel = ["Name & time", "Place", "Activity", "Invite people", "Overview"][wizardStep];

  return (
    <section className="flex min-h-[650px] flex-col space-y-5">
      <BackButton onBack={goBack} />
      <div>
        <h1 className="text-[28px] font-normal leading-[34px] tracking-[-0.7px]">Add an event</h1>
        <p className="body-copy mt-2">Step {wizardStep + 1} of 5 · {stepLabel}</p>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <span className={`h-1.5 rounded-full ${index <= wizardStep ? "bg-orange" : "bg-line"}`} key={index} />
        ))}
      </div>

      {wizardStep === 0 ? (
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Event name</span>
            <input className="input" onChange={(event) => setTitle(event.target.value)} placeholder="Museum visit" value={title} />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="block space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Day</span>
              <select className="input px-2" onChange={(event) => setDay(event.target.value)} value={day}>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Start</span>
              <input className="input px-2" onChange={(event) => setStartTime(event.target.value)} type="time" value={startTime} />
            </label>
            <label className="block space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">End</span>
              <input className="input px-2" onChange={(event) => setEndTime(event.target.value)} type="time" value={endTime} />
            </label>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 text-[11px] font-semibold text-muted">
            {["Coffee break Tuesday 19:00-20:00", "Basketball training Thursday 17:00-18:00"].map((example) => (
              <button
                className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 shadow-card"
                key={example}
                onClick={() => setTitleFromExample(example)}
                type="button"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {wizardStep === 1 ? (
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Location</span>
            <input className="input" onChange={(event) => setLocationName(event.target.value)} placeholder="Public place in Rotterdam" value={locationName} />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Neighborhood</span>
            <select className="input" onChange={(event) => setNeighborhood(event.target.value)} value={neighborhood}>
              {neighborhoods.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <button className="soft-card w-full text-left" onClick={() => setIsPublicPlace(!isPublicPlace)} type="button">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold">Public place</p>
                <p className="text-[12px] text-muted">Shown as the setting in event details.</p>
              </div>
              <span className={`grid h-8 w-8 place-items-center rounded-full ${isPublicPlace ? "bg-orange text-white" : "bg-line"}`}>
                {isPublicPlace ? <Check size={16} /> : null}
              </span>
            </div>
          </button>
        </div>
      ) : null}

      {wizardStep === 2 ? (
        <div className="space-y-4">
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
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Capacity, including you</span>
            <select className="input" onChange={(event) => setCapacity(Number(event.target.value))} value={capacity}>
              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((count) => (
                <option key={count} value={count}>{count} people</option>
              ))}
            </select>
          </label>
          <button className="soft-card w-full text-left" onClick={() => setIsCommunityHosted(!isCommunityHosted)} type="button">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold">Host present</p>
                <p className="text-[12px] text-muted">Adds host-present signal to event details.</p>
              </div>
              <span className={`grid h-8 w-8 place-items-center rounded-full ${isCommunityHosted ? "bg-orange text-white" : "bg-line"}`}>
                {isCommunityHosted ? <Check size={16} /> : null}
              </span>
            </div>
          </button>
        </div>
      ) : null}

      {wizardStep === 3 ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Invite people</p>
            <input
              className="input"
              onChange={(event) => setInviteSearch(event.target.value)}
              placeholder="Search friends or suggested invites"
              value={inviteSearch}
            />
          </div>
          {filteredInviteOptions.map((p) => (
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
          {filteredInviteOptions.length === 0 ? (
            <div className="rounded-[18px] border border-line bg-white px-4 py-3 text-[13px] font-semibold text-muted shadow-card">
              No people found
            </div>
          ) : null}
          <button className="cta-secondary mt-2 w-full" onClick={goNext} type="button">Skip invites</button>
        </div>
      ) : null}

      {wizardStep === 4 ? (
        <div className="space-y-3">
          <div className="rounded-[18px] border border-line bg-white p-4 shadow-card">
            <p className="text-[16px] font-semibold">{title || "Untitled event"}</p>
            <p className="mt-1 text-[12px] text-muted">{day}, {startTime}-{endTime} · {locationName}</p>
          </div>
          <div className="rounded-[18px] border border-line bg-white p-4 shadow-card">
            <p className="text-[13px] font-semibold">Event details</p>
            <div className="mt-3 space-y-2 text-[13px] leading-5 text-muted">
              <p><span className="font-semibold text-ink">Location:</span> {locationName}</p>
              <p><span className="font-semibold text-ink">Time:</span> {day}, {startTime}-{endTime}</p>
              <p><span className="font-semibold text-ink">Capacity:</span> {capacity} people, including you</p>
              <p><span className="font-semibold text-ink">Setting:</span> {isPublicPlace ? "Public place" : "Private setting"}{isCommunityHosted ? " · host present" : ""}</p>
              <p><span className="font-semibold text-ink">Invited:</span> {invited.length ? invited.join(", ") : "No one yet"}</p>
            </div>
          </div>
        </div>
      ) : null}

      <button
        className="cta mt-auto w-full disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canContinue}
        onClick={wizardStep === 4 ? addEvent : goNext}
        type="button"
      >
        {wizardStep === 4 ? "Add event" : "Continue"}
        {wizardStep === 4 ? <Plus size={17} /> : <ArrowRight size={17} />}
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

type Participant = {
  name: string;
  image: string;
  isFriend: boolean;
};

const participantsList: Participant[] = [
  { name: "Daan V.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", isFriend: true },
  { name: "Sophie K.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", isFriend: false },
  { name: "Nora van Dijk", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80", isFriend: false },
  { name: "Youssef El Amrani", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80", isFriend: false },
  { name: "Mila de Boer", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", isFriend: false },
  { name: "Jasper Visser", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", isFriend: false },
  { name: "Priya Sharma", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", isFriend: false },
  { name: "Samira Bakker", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80", isFriend: false },
  { name: "Thomas Meijer", image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&q=80", isFriend: false },
];

const getParticipantsForActivity = (activity: ActivitySuggestion) => {
  if (activity.id === "repeat-coffee-lauren") {
    const lauren = peopleCards.find((person) => person.name === "Lauren Brand") ?? peopleCards[1];
    return [
      { name: lauren.name, image: lauren.image, isFriend: true },
      { name: "You", image: "", isFriend: true },
    ];
  }

  const total = Math.min(activity.capacity, activity.confirmedCount + 1);
  return [...participantsList.slice(0, Math.max(total - 1, 0)), { name: "You", image: "", isFriend: true }].slice(0, total);
};

const repeatCoffeeInvitation: ActivitySuggestion = {
  id: "repeat-coffee-lauren",
  title: "Coffee again at Hopper",
  interest: "coffee",
  locationName: "Hopper Coffee Rotterdam",
  neighborhood: "Centrum",
  isPublicPlace: true,
  isCommunityHosted: false,
  hostName: "Lauren Brand",
  groupSize: "small_group",
  capacity: 4,
  confirmedCount: 1,
  time: { day: "Thursday", label: "Thu afternoon", startTime: "16:00", endTime: "17:00" },
  status: "open",
  matchScore: 96,
  matchReasons: ["You met last week", "Coffee worked well before", "Public cafe in Centrum"],
};

const previousMeetups: ActivitySuggestion[] = [
  {
    id: "previous-library-coffee",
    title: "Library coffee table",
    interest: "coffee",
    locationName: "Centrale Bibliotheek cafe",
    neighborhood: "Centrum",
    isPublicPlace: true,
    isCommunityHosted: true,
    hostName: "Bibliotheek Rotterdam",
    groupSize: "small_group",
    capacity: 6,
    confirmedCount: 5,
    time: { day: "Monday", label: "Mon afternoon", startTime: "15:30", endTime: "16:30" },
    status: "completed",
    matchScore: 91,
    matchReasons: ["Completed public meetup", "Small group setting", "Community host present"],
  },
  {
    id: "previous-kralingen-walk",
    title: "Short walk near Kralingen",
    interest: "walking",
    locationName: "Kralingse Plas entrance",
    neighborhood: "Kralingen",
    isPublicPlace: true,
    isCommunityHosted: true,
    hostName: "Rotterdam Library Walks",
    groupSize: "small_group",
    capacity: 5,
    confirmedCount: 4,
    time: { day: "Sunday", label: "Sun morning", startTime: "10:00", endTime: "11:00" },
    status: "completed",
    matchScore: 88,
    matchReasons: ["Completed public meetup", "Near your area", "Low-pressure activity"],
  },
];

function ParticipantAvatar({ participant, className }: { participant: Participant; className: string }) {
  if (participant.image) {
    return <img src={participant.image} alt="" className={`${className} object-cover`} />;
  }

  return (
    <div className={`${className} grid place-items-center bg-orangeSoft text-orange`}>
      <UserRound size={18} />
    </div>
  );
}

function RepeatInvitationPopup({
  onAccept,
  onChat,
  onDismiss,
}: {
  onAccept: () => void;
  onChat: () => void;
  onDismiss: () => void;
}) {
  const inviter = peopleCards.find((person) => person.name === "Lauren Brand") ?? peopleCards[1];

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center overflow-hidden rounded-[44px]" onClick={onDismiss}>
      <div className="absolute inset-0 bg-black/35" />
      <div
        className="relative mx-auto max-h-[calc(100%-18px)] w-full animate-slideUp overflow-y-auto rounded-t-[28px] bg-white px-6 pb-8 pt-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-line" />
        <div className="flex items-start gap-4">
          <img alt="" className="h-16 w-16 shrink-0 rounded-[20px] object-cover shadow-card" src={inviter.image} />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-orange">Invitation from last week</p>
            <h2 className="mt-1 text-[22px] font-bold leading-[26px] tracking-[-0.5px]">Lauren wants to drink coffee again</h2>
            <p className="mt-2 text-[13px] leading-5 text-muted">
              You met at museum coffee last week. She invited you to {repeatCoffeeInvitation.locationName} on Thursday.
            </p>
          </div>
        </div>
        <div className="mt-5 rounded-[18px] bg-tertiary px-4 py-3">
          <p className="text-[14px] font-semibold">{repeatCoffeeInvitation.title}</p>
          <p className="mt-1 text-[12px] text-muted">
            {formatTime(repeatCoffeeInvitation.time)} · {repeatCoffeeInvitation.neighborhood}
          </p>
        </div>
        <div className="mt-6 grid grid-cols-[1fr_auto_auto] gap-3">
          <button className="cta h-11" onClick={onAccept} type="button">
            Accept
          </button>
          <button className="cta-secondary h-11 px-4" onClick={onChat} type="button">
            Message
          </button>
          <button className="cta-secondary h-11 px-4" onClick={onDismiss} type="button">
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmedPopup({ confirmed, onDismiss, onViewParticipants, onChat }: ConfirmedPopupProps) {
  const participants = getParticipantsForActivity(confirmed);

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
            {participants.slice(0, 4).map((participant) => (
              <div className="h-[100px] w-[80px] overflow-hidden rounded-[16px] border-2 border-white shadow-card" key={participant.name}>
                <ParticipantAvatar participant={participant} className="h-full w-full" />
              </div>
            ))}
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

function ParticipantsScreen({ activity, onBack, onChat }: { activity: ActivitySuggestion; onBack: () => void; onChat: (person: ChatPerson) => void }) {
  const participants = getParticipantsForActivity(activity);

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
        {participants.map((p) => (
          <div className="flex items-center gap-3 rounded-[18px] border border-line bg-white px-4 py-3 shadow-card" key={p.name}>
            <ParticipantAvatar participant={p} className="h-10 w-10 rounded-full" />
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
  activity: ActivitySuggestion;
  blockedContacts: string[];
  existingFeedback?: Feedback;
  onBack: () => void;
  onToggleBlockContact: (name: string) => void;
  onSubmit: (feedback: Feedback) => void;
};

function FeedbackScreen({ activity, blockedContacts, existingFeedback, onBack, onSubmit, onToggleBlockContact }: FeedbackScreenProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(existingFeedback?.connectionRating ?? 4);
  const [wantsRepeat, setWantsRepeat] = useState(existingFeedback?.wantsRepeat ?? true);
  const [feedbackText, setFeedbackText] = useState(existingFeedback?.feedbackText ?? "");
  const [reportText, setReportText] = useState(existingFeedback?.reportText ?? "");
  const attendees = getParticipantsForActivity(activity).filter((participant) => participant.name !== "You");

  return (
    <section className="space-y-6">
      <BackButton onBack={onBack} />
      <div>
        <div className="top-line mb-5" />
        <h1 className="title-lg">Rate this meet-up</h1>
        <p className="mt-2 text-[14px] font-semibold">{activity.title}</p>
        <p className="text-[12px] text-muted">{formatTime(activity.time)} · {activity.locationName}</p>
        <p className="body-copy mt-2">Feedback stays private. Dashboard receives only grouped trends.</p>
      </div>
      <div className="soft-card">
        <p className="mb-3 text-[13px] font-semibold">How was the meet-up?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              className={`grid h-11 flex-1 place-items-center rounded-2xl ${
                rating >= value ? "bg-orangeSoft text-orange" : "bg-canvas text-muted"
              }`}
              key={value}
              onClick={() => setRating(value as 1 | 2 | 3 | 4 | 5)}
              aria-label={`${value} stars`}
              type="button"
            >
              <Star size={18} fill={rating >= value ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </div>
      <div className="soft-card">
        <label className="text-[13px] font-semibold" htmlFor="feedback-text">Feedback</label>
        <textarea
          className="input mt-3 min-h-24 resize-none py-3"
          id="feedback-text"
          onChange={(event) => setFeedbackText(event.target.value)}
          placeholder="What worked well, or what should be different next time?"
          value={feedbackText}
        />
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
      <div className="soft-card">
        <label className="text-[13px] font-semibold" htmlFor="report-text">Report an issue</label>
        <p className="mt-1 text-[12px] text-muted">Optional. Use this for safety, host, or venue issues.</p>
        <textarea
          className="input mt-3 min-h-20 resize-none py-3"
          id="report-text"
          onChange={(event) => setReportText(event.target.value)}
          placeholder="Describe what happened"
          value={reportText}
        />
      </div>
      <div className="soft-card space-y-3">
        <div>
          <p className="text-[13px] font-semibold">People from this meet-up</p>
          <p className="mt-1 text-[12px] text-muted">Block an attendee if you do not want to see or chat with them again.</p>
        </div>
        <div className="space-y-2">
          {attendees.map((attendee) => {
            const isBlocked = blockedContacts.includes(attendee.name);
            return (
              <button
                className="flex w-full items-center justify-between gap-3 rounded-[16px] bg-canvas px-3 py-2 text-left"
                key={attendee.name}
                onClick={() => onToggleBlockContact(attendee.name)}
                type="button"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <ParticipantAvatar participant={attendee} className="h-8 w-8 rounded-full" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold">{attendee.name}</p>
                    <p className="text-[11px] text-muted">{attendee.isFriend ? "Connected attendee" : "Attendee"}</p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${isBlocked ? "bg-ink text-white" : "bg-white text-muted"}`}>
                  {isBlocked ? "Unblock" : "Block"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <button
        className="cta w-full"
        onClick={() =>
          onSubmit({
            suggestionId: activity.id,
            attended: true,
            feltComfortable: true,
            wantsRepeat,
            connectionRating: rating,
            reportedIssue: reportText.trim().length > 0,
            feedbackText: feedbackText.trim(),
            reportText: reportText.trim(),
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
  onFeedback: (activity: ActivitySuggestion) => void;
  onOpenAccepted: (s: ActivitySuggestion) => void;
  acceptedList: ActivitySuggestion[];
  calendarConnected: boolean;
  feedback: Feedback[];
  profile: ResidentProfile;
}) {
  const [meetupView, setMeetupView] = useState<"upcoming" | "previous">("upcoming");
  const feedbackById = new Map(feedback.map((item) => [item.suggestionId, item]));
  const attendedIds = new Set(feedback.filter((item) => item.attended).map((item) => item.suggestionId));
  const availabilitySource = calendarConnected ? "Calendar connection" : "Manual onboarding slots";
  const upcomingMeetups = acceptedList.filter((item) => !isMeetupPast(item.time) && !attendedIds.has(item.id));
  const acceptedPreviousMeetups = acceptedList.filter((item) => isMeetupPast(item.time) || attendedIds.has(item.id));
  const previousIds = new Set(acceptedPreviousMeetups.map((item) => item.id));
  const allPreviousMeetups = [
    ...acceptedPreviousMeetups,
    ...previousMeetups.filter((item) => !previousIds.has(item.id)),
  ];
  const displayedMeetups = meetupView === "upcoming" ? upcomingMeetups : allPreviousMeetups;

  return (
    <section className="space-y-5">
      <div className="pt-3">
        <h1 className="text-[28px] font-normal leading-[34px] tracking-[-0.7px]">Your calendar</h1>
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Meet-ups</p>
          <span className="text-[11px] font-semibold text-orange">{upcomingMeetups.length} upcoming</span>
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-full border border-line bg-white p-1 shadow-card">
          {(["upcoming", "previous"] as const).map((item) => (
            <button
              className={`rounded-full px-2 py-2 text-[11px] font-semibold capitalize ${meetupView === item ? "bg-ink text-white" : "text-muted"}`}
              key={item}
              onClick={() => setMeetupView(item)}
              type="button"
            >
              {item} {item === "previous" ? allPreviousMeetups.length : upcomingMeetups.length}
            </button>
          ))}
        </div>
      </div>
      {displayedMeetups.length > 0 ? (
        <div className="grid gap-3">
          {displayedMeetups.map((item) => {
            const itemFeedback = feedbackById.get(item.id);
            const isPrevious = meetupView === "previous";
            return (
            <div className="soft-card" key={item.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-orange">
                    {isPrevious ? itemFeedback ? "Rated" : "Previous meet-up" : "Signed up"}
                  </p>
                  <p className="mt-1 text-[16px] font-semibold">{item.title}</p>
                  <p className="text-[12px] text-muted">{formatTime(item.time)}</p>
                  <p className="text-[12px] text-muted">{item.locationName}</p>
                  {isPrevious && itemFeedback ? (
                    <div className="mt-2 flex gap-0.5 text-orange">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star key={value} size={13} fill={itemFeedback.connectionRating >= value ? "currentColor" : "none"} />
                      ))}
                    </div>
                  ) : null}
                </div>
                {isPrevious ? (
                  <Check className="text-green" size={24} />
                ) : (
                  <CalendarDays className="text-orange" size={24} />
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button className="cta-secondary" onClick={() => onOpenAccepted(item)} type="button">Open</button>
                {isPrevious ? (
                  <button className="cta-secondary" onClick={() => onFeedback(item)} type="button">
                    {itemFeedback ? "Edit rating" : "Rate"}
                  </button>
                ) : (
                  <button className="cta-secondary" onClick={onCancelAccepted} type="button">Cancel</button>
                )}
              </div>
              {!isPrevious ? (
                <p className="mt-2 rounded-[14px] bg-tertiary px-3 py-2 text-[11px] font-semibold text-muted">
                  Feedback opens after the meet-up has ended.
                </p>
              ) : null}
            </div>
          )})}
        </div>
      ) : (
        <div className="soft-card text-center">
          <CalendarDays className="mx-auto text-orange" size={28} />
          <p className="mt-3 text-[16px] font-semibold">{meetupView === "upcoming" ? "No upcoming meet-ups" : "No previous meet-ups"}</p>
          <p className="body-copy mt-1">{meetupView === "upcoming" ? "Accept a group activity and it will appear here." : "Completed meet-ups will appear here for rating and feedback."}</p>
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
  acceptedFriends,
  blockedContacts,
  feedback,
  friendInvites,
  onMessage,
  onAcceptInvite,
  onBlockContact,
}: {
  acceptedFriends: string[];
  blockedContacts: string[];
  feedback: Feedback[];
  friendInvites: string[];
  onMessage: (person: ChatPerson) => void;
  onAcceptInvite: (name: string) => void;
  onBlockContact: (name: string) => void;
}) {
  const [filter, setFilter] = useState<"friends" | "suggested" | "invites">("friends");
  const [search, setSearch] = useState("");
  const [invitedSuggestedFriends, setInvitedSuggestedFriends] = useState<string[]>([]);
  const hasRepeat = feedback.some((item) => item.wantsRepeat);
  const acceptedFriendRows = acceptedFriends.map((name) => {
    const person = peopleCards.find((item) => item.name === name) ?? { name, image: "", note: "Accepted invite", daysLeft: "" };
    return {
      kind: "friends" as const,
      label: `${name} from nearby walks`,
      helper: "Accepted invite",
      person,
    };
  });
  const baseRows = [
    {
      kind: "invites" as const,
      label: "Ann James from nearby walks",
      helper: "Suggested through shared activities",
      person: peopleCards.find((person) => person.name === "Ann James") ?? peopleCards[0],
    },
    {
      kind: "friends" as const,
      label: hasRepeat ? "Lauren Brand from Depot Boijmans cafe" : "Lauren Brand from museum coffee",
      helper: hasRepeat ? "Meet-again preference saved" : "Current connection",
      person: peopleCards.find((person) => person.name === "Lauren Brand") ?? peopleCards[1],
    },
    ...acceptedFriendRows,
    {
      kind: "suggested" as const,
      label: "Daan V. from evening walks",
      helper: "Suggested invite",
      person: { name: "Daan V.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", note: "Evening walks", daysLeft: "" },
    },
    {
      kind: "suggested" as const,
      label: "Sophie K. from museum coffee",
      helper: "Suggested invite",
      person: { name: "Sophie K.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", note: "Museums", daysLeft: "" },
    },
  ];
  const rows = baseRows
    .filter((row) => row.kind === filter)
    .filter((row) => !blockedContacts.includes(row.person.name))
    .filter((row) => row.label.toLowerCase().includes(search.trim().toLowerCase()) || row.person.name.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((row) => row.kind !== "invites" || friendInvites.includes(row.person.name));
  const acceptInvite = (name: string) => {
    onAcceptInvite(name);
    setFilter("friends");
  };
  const counts = {
    invites: baseRows.filter((row) => row.kind === "invites" && friendInvites.includes(row.person.name)).length,
    friends: baseRows.filter((row) => row.kind === "friends" && !blockedContacts.includes(row.person.name)).length,
    suggested: baseRows.filter((row) => row.kind === "suggested").length,
  };

  return (
    <section className="space-y-5">
      <div className="pt-3">
        <h1 className="text-[28px] font-normal leading-[34px] tracking-[-0.7px]">People you may<br />meet again</h1>
        <p className="body-copy mt-2">Longer-term connections build from repeat activities, not profile browsing.</p>
      </div>
      <input
        className="input"
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search names"
        value={search}
      />
      <div className="grid grid-cols-3 gap-1 rounded-full border border-line bg-white p-1 shadow-card">
        {(["friends", "suggested", "invites"] as const).map((item) => (
          <button
            className={`rounded-full px-2 py-2 text-[11px] font-semibold capitalize ${filter === item ? "bg-ink text-white" : "text-muted"}`}
            key={item}
            onClick={() => setFilter(item)}
            type="button"
          >
            {item} {counts[item] > 0 ? counts[item] : ""}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="rounded-[18px] border border-line bg-white px-4 py-3 text-[13px] font-semibold text-muted shadow-card">
          No matches
        </div>
      ) : null}
      {rows.map((friend) => (
        <div className="soft-card flex items-center justify-between gap-3" key={friend.label}>
          <div className="flex items-center gap-3">
            <img alt="" className="h-14 w-14 rounded-[18px] object-cover" src={friend.person.image} />
            <div className="min-w-0">
              <p className="text-[15px] font-semibold">{friend.label}</p>
              <p className="text-[12px] text-muted">{friend.helper}</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {friend.kind === "invites" ? (
              <button className="rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-white" onClick={() => acceptInvite(friend.person.name)} type="button">
                Accept
              </button>
            ) : null}
            <button className="cta-secondary h-9 px-3" onClick={() => onMessage(friend.person)} type="button">
              Message
            </button>
            {friend.kind === "suggested" ? (
              <button
                className={`h-9 rounded-full px-3 text-[12px] font-semibold ${
                  invitedSuggestedFriends.includes(friend.person.name)
                    ? "bg-line text-muted"
                    : "bg-tertiary text-ink"
                }`}
                disabled={invitedSuggestedFriends.includes(friend.person.name)}
                onClick={() => setInvitedSuggestedFriends((current) => current.includes(friend.person.name) ? current : [...current, friend.person.name])}
                type="button"
              >
                {invitedSuggestedFriends.includes(friend.person.name) ? "Invited" : "Invite"}
              </button>
            ) : null}
            <button className="grid h-9 w-9 place-items-center rounded-full bg-tertiary text-muted" onClick={() => onBlockContact(friend.person.name)} type="button" aria-label={`Block ${friend.person.name}`}>
              <X size={15} />
            </button>
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
  const toggleComfort = (key: ComfortKey) => {
    setProfile({ ...profile, comfort: { ...profile.comfort, [key]: !profile.comfort[key] } });
  };

  const settingInputClass = "w-full bg-transparent text-right text-[14px] font-semibold text-ink outline-none placeholder:text-muted";
  const activeComfortLabels = comfortOptions
    .filter((option) => profile.comfort[option.id])
    .map((option) => option.label.toLowerCase());

  return (
    <section className="space-y-5 pb-4">
      <div className="pt-3">
        <h1 className="text-[28px] font-normal leading-[34px] tracking-[-0.7px]">Settings</h1>
        <p className="body-copy mt-2">Manage your account, privacy, and safety preferences.</p>
      </div>

      <div className="rounded-[24px] border border-line bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div
            className="group relative grid h-14 w-14 shrink-0 cursor-default place-items-center rounded-[18px] bg-orangeSoft text-orange ring-1 ring-orange/10 transition hover:bg-orange hover:text-white hover:ring-orange/40"
            title="Profile photo editing is disabled in this demo"
          >
            <UserRound size={24} />
            <span className="absolute -bottom-1 -right-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-black text-orange shadow-card ring-1 ring-line transition group-hover:text-ink">
              Edit
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold">{profile.displayName || "Alias"}</p>
            <p className="text-[12px] text-muted">
              {profile.neighborhood} · {activeComfortLabels[0] ?? "Comfort settings"}
            </p>
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
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Comfort and privacy</p>
        <div className="grid grid-cols-2 gap-2">
          {comfortOptions.map((option) => (
            <button
              className={`rounded-[20px] border px-3 py-3 text-left shadow-card transition ${
                profile.comfort[option.id] ? "border-orange bg-orangeSoft text-orange" : "border-line bg-white text-ink"
              }`}
              key={option.id}
              onClick={() => toggleComfort(option.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-4">{option.label}</p>
                  <p className={`mt-1 text-[11px] leading-4 ${profile.comfort[option.id] ? "text-orange" : "text-muted"}`}>
                    {option.helper}
                  </p>
                </div>
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${profile.comfort[option.id] ? "bg-orange text-white" : "bg-tertiary text-muted"}`}>
                  {profile.comfort[option.id] ? <Check size={13} /> : null}
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="rounded-[18px] bg-tertiary px-4 py-3">
          <p className="text-[12px] font-semibold text-ink">Private by default</p>
          <p className="mt-1 text-[12px] leading-5 text-muted">
            These settings only guide matching. They are not shown as profile labels to other residents or the municipality.
          </p>
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
          {blockedContacts.length === 0 ? (
            <div className="px-4 py-4">
              <p className="text-[14px] font-semibold">No blocked contacts</p>
              <p className="mt-1 text-[12px] text-muted">You can block someone from Friends or archived meet-up feedback.</p>
            </div>
          ) : (
          blockedContacts.map((name, index) => {
            const person = peopleCards.find((item) => item.name === name);
            return (
              <button
                className={`flex w-full items-center justify-between px-4 py-3 text-left transition active:bg-tertiary ${
                  index < blockedContacts.length - 1 ? "border-b border-line" : ""
                }`}
                key={name}
                onClick={() => toggleBlockedContact(name)}
                type="button"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold">{name}</p>
                  <p className="text-[12px] text-muted">{person?.note ?? "Blocked from chats and people lists"}</p>
                </div>
                <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-white">
                  Unblock
                </span>
              </button>
            );
          })
          )}
        </div>
      </div>
    </section>
  );
}

type BottomNavProps = {
  acceptedCount: number;
  active: Step;
  friendInviteCount: number;
  onAddEvent: () => void;
  onFriends: () => void;
  onHome: () => void;
  onCalendar: () => void;
  onSettings: () => void;
};

function BottomNav({ acceptedCount, active, friendInviteCount, onAddEvent, onCalendar, onFriends, onHome, onSettings }: BottomNavProps) {
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
        <span className="relative">
          <CalendarDays size={16} />
          {acceptedCount > 0 ? (
            <span className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-orange px-1 text-[9px] font-bold leading-none text-white">
              {acceptedCount}
            </span>
          ) : null}
        </span>
        Calendar
      </button>
      <button className={itemClass("addEvent")} onClick={() => onAddEvent()} type="button" aria-label="Add event">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white">
          <Plus size={17} />
        </span>
        Add
      </button>
      <button className={itemClass("friends")} onClick={onFriends} type="button">
        <span className="relative">
          <UserRound size={16} />
          {friendInviteCount > 0 ? (
            <span className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-orange px-1 text-[9px] font-bold leading-none text-white">
              {friendInviteCount}
            </span>
          ) : null}
        </span>
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
  const [mode, setMode] = useState<ViewMode>("business");
  const [returnStep, setReturnStep] = useState<Step>("groups");
  const [profile, setProfile] = useState<ResidentProfile>(defaultProfile);
  const [acceptedList, setAcceptedList] = useState<ActivitySuggestion[]>([]);
  const [lastAccepted, setLastAccepted] = useState<ActivitySuggestion | null>(null);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [feedbackTarget, setFeedbackTarget] = useState<ActivitySuggestion | null>(null);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [chatPerson, setChatPerson] = useState<ChatPerson | null>(null);
  const [showConfirmedPopup, setShowConfirmedPopup] = useState(false);
  const [showRepeatInvitation, setShowRepeatInvitation] = useState(false);
  const [repeatInvitationShown, setRepeatInvitationShown] = useState(false);
  const [blockedContacts, setBlockedContacts] = useState<string[]>([]);
  const [friendInvites, setFriendInvites] = useState<string[]>(["Ann James"]);
  const [acceptedFriends, setAcceptedFriends] = useState<string[]>([]);
  const [llmSuggestions, setLlmSuggestions] = useState<ActivitySuggestion[] | null>(null);
  const [llmSuggestionKey, setLlmSuggestionKey] = useState("");
  const [eventPromptDraft, setEventPromptDraft] = useState("");

  const candidateSuggestions = useMemo(
    () => rankSuggestions(profile, sessions, rejectedIds, blockedIds, feedback, 12),
    [blockedIds, feedback, profile, rejectedIds],
  );
  const candidateSuggestionKey = useMemo(() => candidateSuggestions.map((item) => item.id).join("|"), [candidateSuggestions]);
  const suggestions = useMemo(() => {
    return (llmSuggestions && llmSuggestionKey === candidateSuggestionKey && llmSuggestions.length > 0 ? llmSuggestions : candidateSuggestions).slice(0, 3);
  }, [candidateSuggestionKey, candidateSuggestions, llmSuggestionKey, llmSuggestions]);

  useEffect(() => {
    const onHomepage = mode === "mobile" && (step === "groups" || step === "home");
    if (!onHomepage || repeatInvitationShown) return;

    const timer = window.setTimeout(() => {
      setShowRepeatInvitation(true);
      setRepeatInvitationShown(true);
    }, 20000);

    return () => window.clearTimeout(timer);
  }, [mode, repeatInvitationShown, step]);

  useEffect(() => {
    const onSuggestionsPage = mode === "mobile" && (step === "groups" || step === "home" || step === "confirmed");
    if (!onSuggestionsPage || candidateSuggestions.length === 0) return;

    const controller = new AbortController();

    fetch("/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        profile: {
          neighborhood: profile.neighborhood,
          travelRadiusKm: profile.travelRadiusKm,
          interests: profile.interests,
          comfort: profile.comfort,
          availability: profile.availability,
          routines: profile.routines,
        },
        feedbackSummary: {
          completed: feedback.filter((item) => item.attended).length,
          wantsRepeat: feedback.filter((item) => item.wantsRepeat).length,
        },
        candidates: candidateSuggestions,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Suggestion generator unavailable");
        return response.json() as Promise<{ suggestions?: ActivitySuggestion[] }>;
      })
      .then((payload) => {
        if (!payload.suggestions || payload.suggestions.length === 0) throw new Error("No generated suggestions");
        setLlmSuggestions(payload.suggestions);
        setLlmSuggestionKey(candidateSuggestionKey);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLlmSuggestions(null);
        setLlmSuggestionKey("");
      });

    return () => controller.abort();
  }, [candidateSuggestionKey, candidateSuggestions, feedback, mode, profile, step]);

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
  const goAddEvent = (prompt = "") => {
    setMode("mobile");
    setEventPromptDraft(prompt);
    setReturnStep(isTabStep(step) || step === "calendar" ? step : "groups");
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

      if (i === 1 || i === 3) {
        generated.push({
          day: dayName,
          label: `${dayLabel} evening`,
          startTime: "18:00",
          endTime: "20:00",
        });
      }
      if (i === 5) {
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
    setReturnStep("calendarConnect");
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
    const calendarEvent: ActivitySuggestion = {
      ...event,
      matchScore: 100,
      matchReasons: ["Created by you"],
    };
    setAcceptedList((current) => [calendarEvent, ...current]);
    setLastAccepted(calendarEvent);
    setStep("calendar");
  };
  const cancelAccepted = () => {
    if (lastAccepted) {
      setAcceptedList((cur) => cur.filter((s) => s.id !== lastAccepted.id));
    }
    setLastAccepted(null);
    setStep("groups");
  };
  const acceptFriendInvite = (name: string) => {
    setFriendInvites((current) => current.filter((item) => item !== name));
    setAcceptedFriends((current) => current.includes(name) ? current : [...current, name]);
  };

  const blockContact = (name: string) => {
    setBlockedContacts((current) => current.includes(name) ? current : [...current, name]);
    setFriendInvites((current) => current.filter((item) => item !== name));
    setAcceptedFriends((current) => current.filter((item) => item !== name));
  };

  const toggleBlockedContact = (name: string) => {
    setBlockedContacts((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  };

  const submitFeedback = (nextFeedback: Feedback) => {
    setFeedback((current) => [...current.filter((item) => item.suggestionId !== nextFeedback.suggestionId), nextFeedback]);
    setFeedbackTarget(null);
    setStep("feedbackSuccess");
  };

  const openFeedback = (activity: ActivitySuggestion) => {
    setReturnStep("calendar");
    setFeedbackTarget(activity);
    setStep("feedback");
  };

  const goBackToReturnStep = () => {
    setStep(returnStep);
  };

  const goBackInOnboarding = () => {
    if (step === "profile") setStep("welcome");
    if (step === "interests") setStep("profile");
    if (step === "comfort") setStep("interests");
    if (step === "calendarConnect") setStep("comfort");
    if (step === "manualAvailability") goBackToReturnStep();
    if (step === "habits") setStep("manualAvailability");
  };

  const completeOnboardingWithDefaults = () => {
    setProfile((current) => {
      const hasComfortSelection = Object.values(current.comfort).some(Boolean);

      return {
        ...current,
        displayName: current.displayName.trim() ? current.displayName : defaultProfile.displayName,
        neighborhood: current.neighborhood.trim() ? current.neighborhood : defaultProfile.neighborhood,
        interests: current.interests.length > 0 ? current.interests : demoSkipInterests,
        comfort: hasComfortSelection
          ? current.comfort
          : {
              ...current.comfort,
              smallGroups: true,
              oneToOne: false,
              publicPlacesOnly: true,
              communityHosted: true,
            },
        availability: current.availability.length > 0 ? current.availability : demoSkipAvailability,
        routines: current.routines.length > 0 ? current.routines : demoSkipRoutines,
      };
    });
    setStep("groups");
  };

  const acceptRepeatInvitation = () => {
    setShowRepeatInvitation(false);
    acceptSuggestion(repeatCoffeeInvitation);
  };

  const dismissRepeatInvitation = () => {
    setShowRepeatInvitation(false);
    setRepeatInvitationShown(true);
  };

  const chatWithRepeatInviter = () => {
    setShowRepeatInvitation(false);
    openChat(peopleCards.find((person) => person.name === "Lauren Brand") ?? peopleCards[1]);
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
          onManual={() => {
            setReturnStep("calendarConnect");
            setStep("manualAvailability");
          }}
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
          feedback={feedback}
          matchCandidates={candidateSuggestions}
          onAccept={acceptSuggestion}
          onCreateEvent={goAddEvent}
          onMessage={openChat}
          onReject={rejectSuggestion}
          onResetRejected={resetRejected}
          profile={profile}
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
          onFeedback={openFeedback}
          onConnectPage={() => setStep("calendarConnect")}
          onManual={() => {
            setReturnStep("calendar");
            setStep("manualAvailability");
          }}
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
          feedback={feedback}
          matchCandidates={candidateSuggestions}
          onAccept={acceptSuggestion}
          onCreateEvent={goAddEvent}
          onMessage={openChat}
          onReject={rejectSuggestion}
          onResetRejected={resetRejected}
          profile={profile}
          suggestions={suggestions}
        />
      );
    }

    if (step === "friends") {
      return (
        <FriendsScreen
          acceptedFriends={acceptedFriends}
          blockedContacts={blockedContacts}
          feedback={feedback}
          friendInvites={friendInvites}
          onAcceptInvite={acceptFriendInvite}
          onBlockContact={blockContact}
          onMessage={openChat}
        />
      );
    }

    if (step === "addEvent") {
      return <AddEventScreen initialPrompt={eventPromptDraft} onAdd={addUserEvent} onBack={goBackToReturnStep} />;
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
          feedback={feedback}
          matchCandidates={candidateSuggestions}
          onAccept={acceptSuggestion}
          onCreateEvent={goAddEvent}
          onMessage={openChat}
          onReject={rejectSuggestion}
          onResetRejected={resetRejected}
          profile={profile}
          suggestions={suggestions}
        />
      );
    }

    if (step === "participants" && lastAccepted) {
      return <ParticipantsScreen activity={lastAccepted} onBack={() => setStep("groups")} onChat={openChat} />;
    }

    if (step === "feedback" && feedbackTarget) {
      return (
        <FeedbackScreen
          activity={feedbackTarget}
          blockedContacts={blockedContacts}
          existingFeedback={feedback.find((item) => item.suggestionId === feedbackTarget.id)}
          onBack={goBackToReturnStep}
          onToggleBlockContact={toggleBlockedContact}
          onSubmit={submitFeedback}
        />
      );
    }

    return null;
  };

  return (
    <main className="app-shell">
      <div className={mode === "mobile" ? "prototype-grid" : "dashboard-grid"}>
        <ViewToggle mode={mode} setMode={setMode} />
        {mode === "business" ? (
          <BusinessPlanView />
        ) : mode === "mobile" ? (
          <div className="relative w-full max-w-[390px]">
            {isOnboarding(step) ? (
              <button
                className="absolute right-0 top-0 z-30 -translate-y-[calc(100%+8px)] rounded-full border border-line bg-white px-4 py-2 text-[12px] font-semibold text-ink shadow-card transition active:scale-[0.98] md:-right-2 md:top-4 md:-translate-y-0 md:translate-x-full"
                onClick={completeOnboardingWithDefaults}
                type="button"
              >
                Skip onboarding
              </button>
            ) : null}
            <div className="phone-frame relative">
              <StatusBar />
              <div className="screen-pad">
                {isOnboarding(step) && step !== "welcome" ? <OnboardingHeader onBack={goBackInOnboarding} /> : null}
                {isOnboarding(step) && step !== "welcome" ? <Progress step={step} /> : null}
                {renderScreen()}
              </div>
              {isTabStep(step) ? (
                <BottomNav
                  acceptedCount={acceptedList.length}
                  active={step}
                  friendInviteCount={friendInvites.length}
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
              {showRepeatInvitation && !showConfirmedPopup ? (
                <RepeatInvitationPopup
                  onAccept={acceptRepeatInvitation}
                  onChat={chatWithRepeatInviter}
                  onDismiss={dismissRepeatInvitation}
                />
              ) : null}
            </div>
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
