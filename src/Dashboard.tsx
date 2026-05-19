import { useCallback, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Info,
  Lightbulb,
  MapPin,
  Mic,
  ShieldCheck,
  Sparkles,
  Square,
  Users,
} from "lucide-react";
import { brandAssets } from "./data";
import { useVoiceInput } from "./voice";
import {
  activityDemand,
  ageGroupStats,
  connectionOutcomes,
  dashboardRanges,
  getLiveDashboardMetrics,
  groupSizeDistribution,
  llmRecommendations,
  municipalityCanSee,
  municipalityCannotSee,
  neighborhoodEngagement,
  partnerPerformance,
  peakTimes,
  satisfactionBreakdown,
  signupChannels,
  userRetention,
  venueUtilization,
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

function GuardrailChip({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-ink">
      <ShieldCheck size={14} className="text-green" />
      {children}
    </span>
  );
}

type DashboardTab = "ai" | "data";

type DashboardAdviceResponse = {
  answer: string;
  recommendations: {
    title: string;
    evidence: string;
    recommendation: string;
  }[];
  fallbackUsed?: boolean;
};

function AiAdvisorView() {
  const { isRecording, start, stop, liveWords, finalText } = useVoiceInput();
  const [draft, setDraft] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isAdvising, setIsAdvising] = useState(false);
  const [adviceResult, setAdviceResult] = useState<DashboardAdviceResponse | null>(null);
  const [adviceError, setAdviceError] = useState("");
  const visiblePrompt = draft || finalText;

  const fallbackAdvice = useCallback((question: string): DashboardAdviceResponse => ({
    answer: `The AI advisor is unavailable, so this uses the local aggregate dashboard data. For "${question}", start with the highest-friction channels and activity types: QR-code signups convert strongly, evening walks have high demand, and public football capacity is constrained.`,
    recommendations: llmRecommendations.slice(0, 3).map((item) => ({
      title: item.title,
      evidence: item.evidence,
      recommendation: item.recommendation,
    })),
    fallbackUsed: true,
  }), []);

  const handleSubmit = useCallback(async () => {
    const text = draft.trim() || finalText.trim() || liveWords.trim();
    if (!text) return;
    if (isRecording) stop();
    if (!draft.trim()) setDraft(text);
    setIsAdvising(true);
    setAdviceResult(null);
    setAdviceError("");
    setShowResult(true);

    try {
      const response = await fetch("/api/dashboard-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          city: "Rotterdam",
          range: "Last 30 days",
          aggregateMetrics: {
            recommendations: llmRecommendations,
            neighborhoods: neighborhoodEngagement,
            activityDemand,
            partners: partnerPerformance,
            signupChannels,
            peakTimes,
          },
        }),
      });

      if (!response.ok) throw new Error("Dashboard advisor unavailable");
      const payload = await response.json() as DashboardAdviceResponse;
      if (!payload || typeof payload.answer !== "string" || !Array.isArray(payload.recommendations)) {
        throw new Error("Dashboard advisor returned invalid data");
      }
      setAdviceResult(payload);
    } catch {
      setAdviceResult(fallbackAdvice(text));
      setAdviceError("Using local aggregate fallback");
    } finally {
      setIsAdvising(false);
    }
  }, [draft, fallbackAdvice, finalText, isRecording, liveWords, stop]);

  return (
    <>
      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Greeting */}
        <div>
          <h1 style={{ margin: 0, fontSize: "48px", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: "#1b1c1c" }}>
            Hello, Rotterdam
          </h1>
          <div style={{ marginTop: "12px", height: "2px", width: "48px", background: "linear-gradient(90deg, #ff8c32, #e86a10)", borderRadius: "2px" }} />
          <p style={{ marginTop: "12px", fontSize: "15px", color: "#78716c", lineHeight: 1.5 }}>
            Ask your AI advisor anything about activity coordination, outreach strategy, or resource allocation.
          </p>
        </div>

        {/* Prompt input */}
        <div style={{ borderRadius: "18px", border: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", padding: "6px 6px 6px 20px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            style={{ flex: 1, border: 0, background: "transparent", fontSize: "15px", outline: "none", color: "#1a1a1a", minWidth: 0 }}
            placeholder="Ask the AI advisor..."
            value={isRecording ? "" : visiblePrompt}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSubmit(); } }}
            readOnly={isRecording}
          />
          <button
            onClick={isRecording ? stop : start}
            style={{
              width: "38px", height: "38px", borderRadius: "10px", border: 0, cursor: "pointer", display: "grid", placeItems: "center",
              background: isRecording ? "#e86a10" : "rgba(0,0,0,0.04)", color: isRecording ? "#fff" : "#78716c", transition: "all 0.15s",
            }}
            type="button"
            aria-label={isRecording ? "Stop" : "Speak"}
          >
            {isRecording ? <Square size={14} /> : <Mic size={14} />}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!visiblePrompt.trim() && !isRecording}
            style={{
              width: "38px", height: "38px", borderRadius: "10px", border: 0, cursor: "pointer", display: "grid", placeItems: "center",
              background: "#1a1a1a", color: "#fff", opacity: (!visiblePrompt.trim() && !isRecording) ? 0.3 : 1, transition: "all 0.15s",
            }}
            type="button"
            aria-label="Submit"
          >
            <ArrowRight size={14} />
          </button>
        </div>
        {isRecording && (
          <p style={{ fontSize: "13px", color: "#78716c", fontStyle: "italic", marginTop: "-16px" }}>{liveWords || "Listening..."}</p>
        )}

        {/* Example prompts */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {[
            "Where should we place QR codes?",
            "Which activities need more hosts?",
            "How to reach new residents in Delfshaven?",
          ].map((ex) => (
            <button
              key={ex}
              onClick={() => { setDraft(ex); }}
              style={{ borderRadius: "10px", border: "1px solid rgba(0,0,0,0.06)", background: "#fff", padding: "8px 14px", fontSize: "12px", fontWeight: 600, color: "#78716c", cursor: "pointer" }}
              type="button"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* AI Recommendations */}
        <div>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 16px" }}>Proactive recommendations</p>
          <div className="grid gap-4 md:grid-cols-2">
            {llmRecommendations.map((item) => (
              <article
                key={item.title}
                style={{
                  borderRadius: "16px",
                  border: "1px solid rgba(0,0,0,0.05)",
                  borderLeft: "3px solid #e86a10",
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(6px)",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#1a1a1a" }}>{item.title}</p>
                    <p style={{ fontSize: "12px", color: "#78716c", margin: "6px 0 0", lineHeight: 1.5 }}>{item.evidence}</p>
                  </div>
                  <span style={{ borderRadius: "6px", background: "rgba(0,0,0,0.04)", padding: "4px 8px", fontSize: "10px", fontWeight: 600, color: "#78716c", whiteSpace: "nowrap" }}>{item.sourceType}</span>
                </div>
                <p style={{ marginTop: "12px", borderRadius: "8px", background: "rgba(255,140,50,0.06)", padding: "10px 12px", fontSize: "13px", lineHeight: 1.5, color: "#1a1a1a" }}>
                  → {item.recommendation}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Privacy note */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "10px", background: "rgba(0,0,0,0.03)", padding: "12px 16px" }}>
          <ShieldCheck size={16} style={{ color: "#22863a", flexShrink: 0 }} />
          <p style={{ fontSize: "12px", color: "#78716c", margin: 0, lineHeight: 1.4 }}>
            AI recommendations are generated from grouped, aggregate data only. No individual resident data is used or visible.
          </p>
        </div>
      </div>

      {/* Result popup */}
      {showResult && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={() => setShowResult(false)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
          <div
            style={{ position: "relative", width: "min(640px, 100%)", maxHeight: "80vh", overflow: "auto", borderRadius: "20px", background: "#fff", padding: "28px", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c2530a", margin: 0 }}>Your request</p>
              <p style={{ marginTop: "8px", fontSize: "14px", fontStyle: "italic", color: "#78716c" }}>"{visiblePrompt}"</p>
            </div>
            {isAdvising ? (
              <div style={{ borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", padding: "18px", fontSize: "13px", color: "#78716c" }}>
                Generating aggregate-only municipal advice...
              </div>
            ) : adviceResult ? (
              <div style={{ borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22863a", margin: 0 }}>AI Response</p>
                  {adviceResult.fallbackUsed || adviceError ? (
                    <span style={{ borderRadius: "999px", background: "rgba(0,0,0,0.05)", padding: "4px 8px", fontSize: "10px", fontWeight: 700, color: "#78716c" }}>Fallback</span>
                  ) : null}
                </div>
                <div style={{ fontSize: "13px", lineHeight: 1.7, color: "#1a1a1a", whiteSpace: "pre-wrap" }}>
                  {adviceResult.answer}
                </div>
                <div style={{ marginTop: "16px", display: "grid", gap: "10px" }}>
                  {adviceResult.recommendations.map((item) => (
                    <div key={item.title} style={{ borderRadius: "10px", background: "rgba(255,140,50,0.06)", padding: "12px" }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#1a1a1a" }}>{item.title}</p>
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#78716c", lineHeight: 1.5 }}>{item.evidence}</p>
                      <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#1a1a1a", lineHeight: 1.5 }}>→ {item.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <button
              onClick={() => {
                setShowResult(false);
                setAdviceResult(null);
              }}
              style={{ marginTop: "20px", width: "100%", borderRadius: "12px", border: 0, background: "#1a1a1a", color: "#fff", padding: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

type DataSection = "users" | "activities" | "geography" | "outcomes" | "privacy";

const dataSections: { id: DataSection; label: string }[] = [
  { id: "users", label: "Users" },
  { id: "activities", label: "Activities" },
  { id: "geography", label: "Geography" },
  { id: "outcomes", label: "Outcomes" },
  { id: "privacy", label: "Privacy" },
];

function DataView({ acceptedCount, feedback }: { acceptedCount: number; feedback: Feedback[] }) {
  const [section, setSection] = useState<DataSection>("users");
  const [activeRange, setActiveRange] = useState<DashboardRange>("30d");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(neighborhoodEngagement[0].name);
  const [showSafety, setShowSafety] = useState(false);
  const metrics = useMemo(() => getLiveDashboardMetrics({ acceptedCount, feedback }), [acceptedCount, feedback]);
  const selected = neighborhoodEngagement.find((item) => item.name === selectedNeighborhood) ?? neighborhoodEngagement[0];
  const safeSelected = selected.participantGroups >= 6;
  const maxAccepted = Math.max(...activityDemand.map((item) => item.acceptedSuggestions + item.unmetDemand));
  const activeRangeLabel = dashboardRanges.find((range) => range.id === activeRange)?.label ?? "Last 30 days";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      {/* Header + section nav */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: 0 }}>Operational data</p>
          <h2 style={{ margin: "6px 0 0", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.03em" }}>Rotterdam · {activeRangeLabel}</h2>
        </div>
        <div style={{ display: "flex", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", background: "#fff", padding: "3px" }}>
          {dashboardRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setActiveRange(range.id)}
              style={{
                borderRadius: "9px", padding: "7px 14px", fontSize: "12px", fontWeight: 600, border: 0, cursor: "pointer",
                background: activeRange === range.id ? "#1a1a1a" : "transparent",
                color: activeRange === range.id ? "#fff" : "#78716c",
                transition: "all 0.15s",
              }}
              type="button"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-screen tabs */}
      <div style={{ display: "flex", gap: "4px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", background: "#fff", padding: "3px", flexWrap: "wrap" }}>
        {dataSections.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              borderRadius: "9px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, border: 0, cursor: "pointer",
              background: section === s.id ? "#1a1a1a" : "transparent",
              color: section === s.id ? "#fff" : "#78716c",
              transition: "all 0.15s",
            }}
            type="button"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* === USERS === */}
      {section === "users" && (
        <>
          {/* Overview metrics */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total sign-ups (30d)", value: metrics.acceptedSuggestions.toLocaleString(), sub: "+18% vs previous period" },
              { label: "Active users", value: "114", sub: "80% of sign-ups" },
              { label: "No-show rate", value: "11%", sub: "↓2% vs last month" },
              { label: "Avg. rating", value: metrics.connectionRating.toFixed(1), sub: "Self-reported" },
            ].map((m) => (
              <article key={m.label} style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: 0 }}>{m.label}</p>
                <p style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.03em", margin: "12px 0 0", color: "#1a1a1a" }}>{m.value}</p>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#22863a", margin: "8px 0 0" }}>{m.sub}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Sign-up channels */}
            <article style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 16px" }}>How people sign up</p>
              <div className="space-y-3">
                {signupChannels.map((ch) => (
                  <div key={ch.channel}>
                    <div className="flex items-center justify-between" style={{ fontSize: "13px" }}>
                      <span style={{ fontWeight: 600 }}>{ch.channel}</span>
                      <span style={{ color: "#78716c" }}>{ch.count} ({ch.pct}%)</span>
                    </div>
                    <div style={{ height: "6px", borderRadius: "4px", background: "rgba(0,0,0,0.04)", overflow: "hidden", marginTop: "4px" }}>
                      <div style={{ height: "100%", borderRadius: "4px", background: "linear-gradient(90deg, #ff8c32, #e86a10)", width: `${ch.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Age groups */}
            <article style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 16px" }}>Statistics per age group</p>
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      {["Age", "Sign-ups", "Active %", "No-show", "Avg/month"].map((h) => (
                        <th key={h} style={{ padding: "8px 0", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ageGroupStats.map((row) => (
                      <tr key={row.group} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                        <td style={{ padding: "8px 0", fontWeight: 600 }}>{row.group}</td>
                        <td style={{ padding: "8px 0" }}>{row.signups}</td>
                        <td style={{ padding: "8px 0" }}>{row.activeRate}%</td>
                        <td style={{ padding: "8px 0", color: row.noShowRate > 15 ? "#c2530a" : "#78716c" }}>{row.noShowRate}%</td>
                        <td style={{ padding: "8px 0" }}>{row.avgActivitiesPerMonth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>

          {/* Retention */}
          <article style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 16px" }}>User retention (weekly active)</p>
            <div className="grid grid-cols-4 gap-4">
              {userRetention.map((w) => (
                <div key={w.week} style={{ borderRadius: "10px", background: "rgba(0,0,0,0.03)", padding: "14px", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#78716c", margin: 0 }}>{w.week}</p>
                  <p style={{ fontSize: "28px", fontWeight: 700, margin: "8px 0 0" }}>{w.active}</p>
                </div>
              ))}
            </div>
          </article>
        </>
      )}

      {/* === ACTIVITIES === */}
      {section === "activities" && (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Activity demand */}
            <article style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: 0 }}>Activity demand</p>
                  <h2 style={{ margin: "6px 0 0", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>Coordination friction</h2>
                </div>
                <BarChart3 size={20} style={{ color: "#c2530a" }} />
              </div>
              <div className="space-y-4">
                {activityDemand.map((activity) => {
                  const total = activity.acceptedSuggestions + activity.unmetDemand;
                  return (
                    <div key={activity.id}>
                      <div className="mb-1 flex items-center justify-between gap-3" style={{ fontSize: "13px" }}>
                        <span style={{ fontWeight: 600 }}>{activity.label}</span>
                        <span style={{ color: "#78716c" }}>{activity.acceptedSuggestions} / {activity.unmetDemand} unmet</span>
                      </div>
                      <div style={{ height: "6px", borderRadius: "4px", background: "rgba(0,0,0,0.04)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: "4px", background: "linear-gradient(90deg, #ff8c32, #e86a10)", width: `${Math.round((total / maxAccepted) * 100)}%` }} />
                      </div>
                      <p style={{ marginTop: "4px", fontSize: "11px", color: "#a8a29e" }}>{activity.frictionNote}</p>
                    </div>
                  );
                })}
              </div>
            </article>

            {/* Peak times */}
            <article style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 16px" }}>Peak activity times</p>
              <div className="space-y-3">
                {peakTimes.map((t) => (
                  <div key={t.slot}>
                    <div className="flex items-center justify-between" style={{ fontSize: "13px" }}>
                      <span style={{ fontWeight: 600 }}>{t.label}</span>
                      <span style={{ color: "#78716c" }}>{t.slot} · {t.pct}%</span>
                    </div>
                    <div style={{ height: "6px", borderRadius: "4px", background: "rgba(0,0,0,0.04)", overflow: "hidden", marginTop: "4px" }}>
                      <div style={{ height: "100%", borderRadius: "4px", background: "linear-gradient(90deg, #22863a, #2ea043)", width: `${t.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Group sizes */}
            <article style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 16px" }}>Group size distribution</p>
              <div className="space-y-3">
                {groupSizeDistribution.map((g) => (
                  <div key={g.size} className="flex items-center gap-4">
                    <span style={{ fontSize: "13px", fontWeight: 600, minWidth: "80px" }}>{g.size}</span>
                    <div style={{ flex: 1, height: "6px", borderRadius: "4px", background: "rgba(0,0,0,0.04)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "4px", background: "#1a1a1a", width: `${g.pct}%` }} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#78716c", minWidth: "50px", textAlign: "right" }}>{g.count} ({g.pct}%)</span>
                  </div>
                ))}
              </div>
            </article>

            {/* Venue utilization */}
            <article style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 16px" }}>Venue utilization</p>
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      {["Venue", "Capacity", "Used", "Util."].map((h) => (
                        <th key={h} style={{ padding: "8px 0", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {venueUtilization.map((v) => (
                      <tr key={v.venue} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                        <td style={{ padding: "8px 0", fontWeight: 600 }}>{v.venue}</td>
                        <td style={{ padding: "8px 0" }}>{v.capacity}</td>
                        <td style={{ padding: "8px 0" }}>{v.used}</td>
                        <td style={{ padding: "8px 0", fontWeight: 600, color: v.utilization >= 90 ? "#c2530a" : "#22863a" }}>{v.utilization}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>

          {/* Partners */}
          <article style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: 0 }}>Partners</p>
                <h2 style={{ margin: "6px 0 0", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>Hosted activities</h2>
              </div>
              <Users size={20} style={{ color: "#c2530a" }} />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {partnerPerformance.map((partner) => (
                <div key={partner.partner} style={{ borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)", padding: "14px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>{partner.partner}</p>
                  <p style={{ fontSize: "11px", color: "#78716c", margin: "2px 0 0" }}>{partner.type}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2" style={{ fontSize: "11px" }}>
                    <span><strong>{partner.hostedActivities}</strong><br />hosted</span>
                    <span><strong>{partner.attendance}</strong><br />attended</span>
                    <span><strong>{partner.repeatContribution}%</strong><br />repeat</span>
                  </div>
                  <p style={{ marginTop: "10px", borderRadius: "8px", background: "rgba(255,140,50,0.06)", padding: "8px 10px", fontSize: "11px", lineHeight: 1.4, color: "#1a1a1a" }}>{partner.recommendation}</p>
                </div>
              ))}
            </div>
          </article>
        </>
      )}

      {/* === GEOGRAPHY === */}
      {section === "geography" && (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <article style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: 0 }}>Neighborhood engagement</p>
                  <h2 style={{ margin: "6px 0 0", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>Rotterdam grouped signals</h2>
                </div>
                <span style={{ borderRadius: "8px", background: "rgba(255,140,50,0.08)", padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: "#c2530a" }}>Min threshold: 6</span>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: "100%", minWidth: "620px", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      {["Neighborhood", "Accepted", "Completion", "Repeat", "Status"].map((h) => (
                        <th key={h} style={{ padding: "10px 0", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {neighborhoodEngagement.map((row) => {
                      const hidden = row.participantGroups < 6;
                      return (
                        <tr key={row.name} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                          <td style={{ padding: "10px 0" }}>
                            <button
                              onClick={() => setSelectedNeighborhood(row.name)}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "8px", padding: "5px 10px", fontSize: "13px", fontWeight: 600, border: 0, cursor: "pointer",
                                background: selectedNeighborhood === row.name ? "#1a1a1a" : "rgba(0,0,0,0.03)",
                                color: selectedNeighborhood === row.name ? "#fff" : "#1a1a1a",
                                transition: "all 0.15s",
                              }}
                              type="button"
                            >
                              <MapPin size={12} />
                              {row.name}
                            </button>
                          </td>
                          <td style={{ padding: "10px 0", fontWeight: 600 }}>{hidden ? "—" : row.acceptedSuggestions}</td>
                          <td style={{ padding: "10px 0" }}>{hidden ? "—" : `${row.completionRate}%`}</td>
                          <td style={{ padding: "10px 0" }}>{hidden ? "—" : `${row.repeatRate}%`}</td>
                          <td style={{ padding: "10px 0", color: "#78716c" }}>{row.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </article>

            <aside style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: 0 }}>Selected</p>
              <h3 style={{ margin: "8px 0 0", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.03em" }}>{selected.name}</h3>
              {safeSelected ? (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: "Accepted", val: String(selected.acceptedSuggestions) },
                    { label: "Completion", val: `${selected.completionRate}%` },
                    { label: "Repeat", val: `${selected.repeatRate}%` },
                  ].map((s) => (
                    <div key={s.label} style={{ borderRadius: "10px", background: "rgba(0,0,0,0.03)", padding: "12px" }}>
                      <p style={{ fontSize: "10px", fontWeight: 600, color: "#a8a29e", margin: 0 }}>{s.label}</p>
                      <p style={{ fontSize: "22px", fontWeight: 700, margin: "6px 0 0" }}>{s.val}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: "16px", borderRadius: "10px", background: "rgba(0,0,0,0.03)", padding: "14px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, margin: 0 }}>Hidden for privacy</p>
                  <p style={{ fontSize: "12px", color: "#78716c", margin: "4px 0 0" }}>Below minimum grouped threshold.</p>
                </div>
              )}
              <div style={{ marginTop: "16px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.06)", padding: "14px" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, margin: 0 }}>Operational note</p>
                <p style={{ fontSize: "12px", color: "#78716c", margin: "4px 0 0", lineHeight: 1.5 }}>
                  {safeSelected ? selected.status : "Wait for larger opt-in group."}
                </p>
              </div>
            </aside>
          </div>
        </>
      )}

      {/* === OUTCOMES === */}
      {section === "outcomes" && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {connectionOutcomes.map((o) => (
              <article key={o.metric} style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: 0 }}>{o.metric}</p>
                <p style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.03em", margin: "12px 0 0", color: "#1a1a1a" }}>{o.value}</p>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#78716c", margin: "8px 0 0" }}>{o.unit}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Satisfaction */}
            <article style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 16px" }}>Satisfaction breakdown</p>
              <div className="space-y-3">
                {satisfactionBreakdown.map((s) => (
                  <div key={s.rating} className="flex items-center gap-4">
                    <span style={{ fontSize: "13px", fontWeight: 600, minWidth: "30px" }}>{"★".repeat(s.rating)}</span>
                    <div style={{ flex: 1, height: "6px", borderRadius: "4px", background: "rgba(0,0,0,0.04)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "4px", background: s.rating >= 4 ? "#22863a" : s.rating === 3 ? "#c2530a" : "#dc2626", width: `${Math.round((s.count / 89) * 100)}%` }} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#78716c", minWidth: "70px", textAlign: "right" }}>{s.count} · {s.label}</span>
                  </div>
                ))}
              </div>
            </article>

            {/* Repeat + completion */}
            <article style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: "0 0 16px" }}>Meetup outcomes</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Completion rate", value: `${metrics.completionRate}%`, desc: "of accepted suggestions" },
                  { label: "Repeat rate", value: `${metrics.repeatRate}%`, desc: "of completed meetups" },
                  { label: "Real-life meetups", value: metrics.completedMeetups.toLocaleString(), desc: "total completed" },
                  { label: "Repeat meetups", value: metrics.repeatMeetups.toLocaleString(), desc: "same pair/group again" },
                ].map((m) => (
                  <div key={m.label} style={{ borderRadius: "10px", background: "rgba(0,0,0,0.03)", padding: "14px" }}>
                    <p style={{ fontSize: "10px", fontWeight: 600, color: "#a8a29e", margin: 0 }}>{m.label}</p>
                    <p style={{ fontSize: "28px", fontWeight: 700, margin: "6px 0 0" }}>{m.value}</p>
                    <p style={{ fontSize: "11px", color: "#78716c", margin: "4px 0 0" }}>{m.desc}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* LLM recommendations */}
          <article style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: 0 }}>Policy suggestions</p>
                <h2 style={{ margin: "6px 0 0", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>From aggregate signals</h2>
              </div>
              <Lightbulb size={20} style={{ color: "#c2530a" }} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {llmRecommendations.map((item) => (
                <div key={item.title} style={{ borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)", padding: "14px" }}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>{item.title}</p>
                    <span style={{ borderRadius: "6px", background: "rgba(0,0,0,0.04)", padding: "4px 8px", fontSize: "10px", fontWeight: 600, color: "#78716c" }}>{item.sourceType}</span>
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: "#78716c", margin: 0 }}>{item.evidence}</p>
                  <p style={{ marginTop: "10px", borderRadius: "8px", background: "rgba(255,140,50,0.06)", padding: "8px 10px", fontSize: "11px", lineHeight: 1.4 }}>
                    → {item.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </>
      )}

      {/* === PRIVACY === */}
      {section === "privacy" && (
        <>
          {/* AI role card */}
          <article style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c2530a", margin: 0 }}>AI coordination role</p>
                <h2 style={{ margin: "10px 0 0", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.2, color: "#1a1a1a" }}>
                  No loneliness detection. No individual scores. Only opt-in activity coordination.
                </h2>
              </div>
              <Sparkles className="shrink-0" size={22} style={{ color: "#c2530a" }} />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {["Interests", "Availability", "Rough area", "Comfort preferences"].map((item) => (
                <div key={item} style={{ borderRadius: "10px", background: "rgba(0,0,0,0.03)", padding: "12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, margin: 0 }}>{item}</p>
                  <p style={{ fontSize: "11px", color: "#78716c", margin: "4px 0 0", lineHeight: 1.4 }}>Matching only.</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <GuardrailChip>consent-based</GuardrailChip>
              <GuardrailChip>no mental-health inference</GuardrailChip>
              <GuardrailChip>no individual resident view</GuardrailChip>
            </div>
          </article>

          {/* Visibility boundary */}
          <article style={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8a29e", margin: 0 }}>Privacy audit</p>
                <h2 style={{ margin: "6px 0 0", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>Visibility boundary</h2>
              </div>
              <button
                onClick={() => setShowSafety((current) => !current)}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "9px", padding: "7px 14px", fontSize: "12px", fontWeight: 600, background: "#fff", cursor: "pointer" }}
                type="button"
              >
                <Info size={13} />
                {showSafety ? "Hide" : "Why safe"}
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div style={{ borderRadius: "12px", background: "rgba(0,0,0,0.03)", padding: "16px" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 10px" }}>Can see</p>
                <div className="flex flex-wrap gap-2">
                  {municipalityCanSee.map((item) => (
                    <span key={item} style={{ borderRadius: "8px", background: "#fff", padding: "5px 10px", fontSize: "12px", fontWeight: 600 }}>{item}</span>
                  ))}
                </div>
              </div>
              <div style={{ borderRadius: "12px", background: "#1a1a1a", padding: "16px", color: "#fff" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 10px" }}>Cannot see</p>
                <div className="flex flex-wrap gap-2">
                  {municipalityCannotSee.map((item) => (
                    <span key={item} style={{ borderRadius: "8px", background: "rgba(255,255,255,0.08)", padding: "5px 10px", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
            {showSafety ? (
              <p style={{ marginTop: "16px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.06)", padding: "12px 14px", fontSize: "12px", lineHeight: 1.5, color: "#78716c" }}>
                Aggregate counters from accepted activities and completed feedback only. Excludes resident settings, contacts, blocked, rejected, and any risk label.
              </p>
            ) : null}
          </article>
        </>
      )}
    </div>
  );
}

export default function Dashboard({ acceptedCount, feedback, onMobile }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("ai");

  return (
    <section
      className="w-full min-h-screen"
      style={{
        background: "radial-gradient(circle at top left, rgba(255, 166, 77, 0.08), transparent 30%), radial-gradient(circle at bottom right, rgba(40, 40, 40, 0.04), transparent 26%), linear-gradient(180deg, #fefcfa 0%, #f7f4f0 100%)",
        padding: "28px 28px 48px",
      }}
    >
      {/* Tab header */}
      <div className="mx-auto mb-8 flex w-full max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img alt="Gezellig" className="h-9 w-9" src={brandAssets.logoMark} />
          <span style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.03em", color: "#1a1a1a" }}>{brandAssets.logoWordmark}</span>
          <DutchFlag />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#78716c" }}>Municipality pilot</span>
        </div>
        <div style={{ display: "flex", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", background: "#fff", padding: "3px" }}>
          {([["ai", "AI Advisor"], ["data", "Data"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                borderRadius: "9px", padding: "8px 18px", fontSize: "13px", fontWeight: 600, border: 0, cursor: "pointer",
                background: activeTab === id ? "#1a1a1a" : "transparent",
                color: activeTab === id ? "#fff" : "#78716c",
                transition: "all 0.15s",
              }}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={onMobile}
          style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "8px 16px", fontSize: "12px", fontWeight: 600, color: "#78716c", cursor: "pointer", background: "#fff" }}
          type="button"
        >
          ← Resident app
        </button>
      </div>

      {activeTab === "ai" ? (
        <AiAdvisorView />
      ) : (
        <DataView acceptedCount={acceptedCount} feedback={feedback} />
      )}
    </section>
  );
}
