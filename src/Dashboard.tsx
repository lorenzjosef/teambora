import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { GeselligMark } from "./Brand";
import { brandAssets } from "./data";
import {
  activityDemand,
  dashboardRanges,
  getLiveDashboardMetrics,
  llmRecommendations,
  municipalityCanSee,
  municipalityCannotSee,
  neighborhoodEngagement,
  partnerPerformance,
  type DashboardRange,
} from "./dashboardData";
import type { Feedback } from "./types";

type DashboardProps = {
  acceptedCount: number;
  feedback: Feedback[];
  onMobile: () => void;
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

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-card">
        <GeselligMark className="h-7 w-7" />
      </div>
      <div className="leading-tight">
        <p className="text-[15px] font-black">{brandAssets.logoWordmark}</p>
        <p className="text-[12px] font-medium text-muted">Municipality dashboard</p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <article className="rounded-[8px] border border-line bg-white p-4 shadow-card">
      <p className="text-[12px] font-semibold text-muted">{label}</p>
      <p className="mt-3 text-[34px] font-semibold leading-none tracking-normal">{value}</p>
      <p className="mt-2 text-[12px] font-semibold text-green">{trend}</p>
      <p className="mt-3 border-t border-line pt-3 text-[11px] font-semibold text-muted">Aggregated residents only</p>
    </article>
  );
}

function GuardrailChip({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-ink">
      <ShieldCheck size={14} className="text-green" />
      {children}
    </span>
  );
}

function LaunchScreen({ onLaunch, onMobile }: { onLaunch: () => void; onMobile: () => void }) {
  return (
    <section className="w-full">
      <div className="mx-auto grid min-h-[calc(100vh-96px)] w-full max-w-2xl place-items-center">
        <div className="w-full overflow-hidden rounded-xl border border-black/10 shadow-2xl">
          {/* Electron-style titlebar */}
          <div className="flex h-9 items-center gap-2 bg-[#1e1e1e] px-4">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            <span className="ml-3 text-[11px] font-medium text-white/50">Gesellig — Municipality Dashboard</span>
          </div>
          {/* App body */}
          <div className="flex flex-col items-center bg-[#0f0f0f] px-8 pb-10 pt-14 text-center">
            <div className="mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-white shadow-lg">
              <GeselligMark className="h-12 w-12 text-ink" />
            </div>
            <h1 className="text-[28px] font-bold tracking-[-0.5px] text-white">Gesellig</h1>
            <p className="mt-1 text-[13px] font-medium text-white/40">Municipality operational dashboard</p>
            <div className="mt-6 flex items-center gap-2">
              <DutchFlag />
              <span className="text-[12px] font-semibold text-white/60">Rotterdam pilot</span>
            </div>
            <p className="mt-8 max-w-sm text-[13px] leading-5 text-white/50">
              Aggregated activity coordination signals. Privacy-safe recommendations without resident-level records.
            </p>
            <div className="mt-8 flex gap-3">
              <button
                className="flex h-11 items-center gap-2 rounded-lg bg-orange px-6 text-[13px] font-semibold text-white transition hover:brightness-110"
                onClick={onLaunch}
                type="button"
              >
                Open dashboard
                <ArrowRight size={15} />
              </button>
              <button
                className="flex h-11 items-center gap-2 rounded-lg border border-white/15 px-5 text-[13px] font-semibold text-white/70 transition hover:bg-white/5"
                onClick={onMobile}
                type="button"
              >
                <ArrowLeft size={14} />
                Mobile app
              </button>
            </div>
            <p className="mt-10 text-[11px] text-white/30">v1.0.0-pilot · One municipality · Grouped metrics only</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Dashboard({ acceptedCount, feedback, onMobile }: DashboardProps) {
  const [isLaunched, setIsLaunched] = useState(false);
  const [activeRange, setActiveRange] = useState<DashboardRange>("30d");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(neighborhoodEngagement[0].name);
  const [showSafety, setShowSafety] = useState(false);
  const metrics = useMemo(() => getLiveDashboardMetrics({ acceptedCount, feedback }), [acceptedCount, feedback]);
  const selected = neighborhoodEngagement.find((item) => item.name === selectedNeighborhood) ?? neighborhoodEngagement[0];
  const safeSelected = selected.participantGroups >= 6;
  const maxAccepted = Math.max(...activityDemand.map((item) => item.acceptedSuggestions + item.unmetDemand));
  const activeRangeLabel = dashboardRanges.find((range) => range.id === activeRange)?.label ?? "Last 30 days";

  if (!isLaunched) {
    return <LaunchScreen onLaunch={() => setIsLaunched(true)} onMobile={onMobile} />;
  }

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 rounded-[8px] border border-line bg-surface px-5 py-4 shadow-card lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <Logo />
            <DutchFlag />
            <span className="rounded-full border border-ink bg-ink px-3 py-1.5 text-[12px] font-semibold text-white">Rotterdam</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border border-line bg-white p-1">
              {dashboardRanges.map((range) => (
                <button
                  className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
                    activeRange === range.id ? "bg-orange text-white" : "text-muted hover:text-ink"
                  }`}
                  key={range.id}
                  onClick={() => setActiveRange(range.id)}
                  type="button"
                >
                  {range.label}
                </button>
              ))}
            </div>
            <button className="cta-secondary h-10 rounded-full px-4" onClick={onMobile} type="button">
              <ArrowLeft size={16} />
              Mobile app
            </button>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Suggestions accepted" trend="+18% vs previous period" value={metrics.acceptedSuggestions.toLocaleString()} />
          <MetricCard label="Real-life meetups" trend={`${metrics.completionRate}% completion rate`} value={metrics.completedMeetups.toLocaleString()} />
          <MetricCard label="Repeat meetups" trend={`${metrics.repeatRate}% of completed meetups`} value={metrics.repeatMeetups.toLocaleString()} />
          <MetricCard label="Avg. connection rating" trend="Self-reported after activity" value={metrics.connectionRating.toFixed(1)} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
          <article className="rounded-[8px] border border-line bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-orange">AI coordination role</p>
                <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-normal">
                  No loneliness detection. No individual scores. Only opt-in activity coordination.
                </h1>
              </div>
              <Sparkles className="shrink-0 text-orange" size={24} />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {["Interests", "Availability", "Rough area", "Comfort preferences"].map((item) => (
                <div className="rounded-[8px] bg-tertiary px-3 py-3" key={item}>
                  <p className="text-[13px] font-semibold">{item}</p>
                  <p className="mt-1 text-[12px] leading-4 text-muted">Used for matching and scheduling only.</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <GuardrailChip>consent-based</GuardrailChip>
              <GuardrailChip>no mental-health inference</GuardrailChip>
              <GuardrailChip>no individual resident view</GuardrailChip>
              <GuardrailChip>neighborhood thresholding</GuardrailChip>
            </div>
          </article>

          <article className="rounded-[8px] border border-line bg-ink p-5 text-white shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/60">Current lens</p>
                <h2 className="mt-2 text-[24px] font-semibold tracking-normal">Rotterdam · {activeRangeLabel}</h2>
              </div>
              <button
                className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-3 text-[12px] font-semibold text-ink"
                onClick={() => setShowSafety((current) => !current)}
                type="button"
              >
                {showSafety ? <EyeOff size={15} /> : <Eye size={15} />}
                Why safe
              </button>
            </div>
            <p className="mt-4 text-[13px] leading-5 text-white/70">
              This view helps municipal teams spot where coordination friction is high: too few hosts, undersupplied venues,
              or time slots that do not match resident opt-in availability.
            </p>
            {showSafety ? (
              <div className="mt-5 rounded-[8px] border border-white/15 bg-white/10 p-4">
                <p className="text-[13px] font-semibold">Safety model</p>
                <p className="mt-2 text-[12px] leading-5 text-white/70">
                  Counts are aggregated, neighborhood rows need a minimum group threshold, and rejected suggestions stay out
                  of municipal reporting.
                </p>
              </div>
            ) : null}
          </article>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[8px] border border-line bg-white p-5 shadow-card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Neighborhood engagement</p>
                <h2 className="mt-1 text-[22px] font-semibold tracking-normal">Rotterdam grouped activity signals</h2>
              </div>
              <span className="rounded-full bg-orangeSoft px-3 py-1.5 text-[12px] font-semibold text-orange">Minimum group threshold: 6</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-[0.08em] text-muted">
                    <th className="py-3 font-semibold">Neighborhood</th>
                    <th className="py-3 font-semibold">Accepted</th>
                    <th className="py-3 font-semibold">Completion</th>
                    <th className="py-3 font-semibold">Repeat</th>
                    <th className="py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {neighborhoodEngagement.map((row) => {
                    const hidden = row.participantGroups < 6;
                    return (
                      <tr className="border-b border-line last:border-0" key={row.name}>
                        <td className="py-3">
                          <button
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${
                              selectedNeighborhood === row.name ? "bg-ink text-white" : "bg-tertiary text-ink hover:bg-orangeSoft"
                            }`}
                            onClick={() => setSelectedNeighborhood(row.name)}
                            type="button"
                          >
                            <MapPin size={14} />
                            {row.name}
                          </button>
                        </td>
                        <td className="py-3 font-semibold">{hidden ? "Hidden" : row.acceptedSuggestions}</td>
                        <td className="py-3">{hidden ? "Hidden" : `${row.completionRate}%`}</td>
                        <td className="py-3">{hidden ? "Hidden" : `${row.repeatRate}%`}</td>
                        <td className="py-3 text-muted">{row.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="rounded-[8px] border border-line bg-white p-5 shadow-card">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Selected detail</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-normal">{selected.name}</h3>
            {safeSelected ? (
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-[8px] bg-tertiary p-3">
                  <p className="text-[11px] text-muted">Accepted</p>
                  <p className="mt-1 text-[20px] font-semibold">{selected.acceptedSuggestions}</p>
                </div>
                <div className="rounded-[8px] bg-tertiary p-3">
                  <p className="text-[11px] text-muted">Completion</p>
                  <p className="mt-1 text-[20px] font-semibold">{selected.completionRate}%</p>
                </div>
                <div className="rounded-[8px] bg-tertiary p-3">
                  <p className="text-[11px] text-muted">Repeat</p>
                  <p className="mt-1 text-[20px] font-semibold">{selected.repeatRate}%</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[8px] bg-tertiary p-4">
                <p className="text-[13px] font-semibold">Hidden for privacy</p>
                <p className="mt-1 text-[12px] leading-5 text-muted">This neighborhood is below the minimum grouped threshold.</p>
              </div>
            )}
            <div className="mt-4 rounded-[8px] border border-line p-4">
              <p className="text-[13px] font-semibold">Operational note</p>
              <p className="mt-1 text-[12px] leading-5 text-muted">
                {safeSelected ? selected.status : "Wait for a larger opt-in group before reporting engagement metrics."}
              </p>
            </div>
          </aside>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[8px] border border-line bg-white p-5 shadow-card">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Activity demand</p>
                <h2 className="mt-1 text-[22px] font-semibold tracking-normal">Where coordination friction is highest</h2>
              </div>
              <BarChart3 className="text-orange" size={22} />
            </div>
            <div className="space-y-4">
              {activityDemand.map((activity) => {
                const total = activity.acceptedSuggestions + activity.unmetDemand;
                return (
                  <div key={activity.id}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-[13px]">
                      <span className="font-semibold">{activity.label}</span>
                      <span className="text-muted">{activity.acceptedSuggestions} accepted · {activity.unmetDemand} unmet</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-tertiary">
                      <div className="h-full rounded-full bg-orange" style={{ width: `${Math.round((total / maxAccepted) * 100)}%` }} />
                    </div>
                    <p className="mt-1 text-[12px] text-muted">{activity.frictionNote}</p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-[8px] border border-line bg-white p-5 shadow-card">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Partner/event performance</p>
                <h2 className="mt-1 text-[22px] font-semibold tracking-normal">Hosted activities and repeat contribution</h2>
              </div>
              <Users className="text-orange" size={22} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {partnerPerformance.map((partner) => (
                <div className="rounded-[8px] border border-line p-4" key={partner.partner}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-semibold">{partner.partner}</p>
                      <p className="text-[12px] text-muted">{partner.type}</p>
                    </div>
                    <ChevronRight className="text-muted" size={17} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
                    <span><strong>{partner.hostedActivities}</strong><br />hosted</span>
                    <span><strong>{partner.attendance}</strong><br />attended</span>
                    <span><strong>{partner.repeatContribution}%</strong><br />repeat</span>
                  </div>
                  <p className="mt-3 rounded-[8px] bg-orangeSoft px-3 py-2 text-[12px] leading-5 text-ink">{partner.recommendation}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="rounded-[8px] border border-line bg-white p-5 shadow-card">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">LLM recommendations</p>
              <h2 className="mt-1 text-[22px] font-semibold tracking-normal">Hardcoded policy suggestions from aggregate signals</h2>
            </div>
            <Lightbulb className="text-orange" size={22} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {llmRecommendations.map((item) => (
              <div className="rounded-[8px] border border-line p-4" key={item.title}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[14px] font-semibold">{item.title}</p>
                  <span className="shrink-0 rounded-full bg-tertiary px-2.5 py-1 text-[11px] font-semibold text-muted">{item.sourceType}</span>
                </div>
                <p className="text-[12px] leading-5 text-muted">{item.evidence}</p>
                <p className="mt-3 rounded-[8px] bg-orangeSoft px-3 py-2 text-[12px] leading-5 text-ink">
                  Recommendation: {item.recommendation}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-[8px] bg-tertiary px-4 py-3 text-[12px] leading-5 text-muted">
            These suggestions are generated from grouped trends and public outreach assumptions. They do not infer a condition
            for any resident or neighborhood.
          </p>
        </article>

        <article className="rounded-[8px] border border-line bg-white p-5 shadow-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Privacy audit</p>
              <h2 className="mt-1 text-[22px] font-semibold tracking-normal">Municipality visibility boundary</h2>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold"
              onClick={() => setShowSafety((current) => !current)}
              type="button"
            >
              <Info size={15} />
              {showSafety ? "Hide explanation" : "Why this is safe"}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[8px] bg-tertiary p-4">
              <p className="mb-3 text-[14px] font-semibold">Can see</p>
              <div className="flex flex-wrap gap-2">
                {municipalityCanSee.map((item) => (
                  <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold" key={item}>{item}</span>
                ))}
              </div>
            </div>
            <div className="rounded-[8px] bg-ink p-4 text-white">
              <p className="mb-3 text-[14px] font-semibold">Cannot see</p>
              <div className="flex flex-wrap gap-2">
                {municipalityCannotSee.map((item) => (
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white/85" key={item}>{item}</span>
                ))}
              </div>
            </div>
          </div>
          {showSafety ? (
            <p className="mt-4 rounded-[8px] border border-line bg-surface px-4 py-3 text-[13px] leading-5 text-muted">
              The dashboard receives aggregate counters from accepted activities and completed feedback only. It excludes
              resident settings data, contact details, blocked contacts, rejected suggestions, and any diagnosis or risk label.
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
}
