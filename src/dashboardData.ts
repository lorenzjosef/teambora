import type { Feedback, Interest } from "./types";

export type DashboardRange = "30d" | "90d" | "pilot";

export type LiveDashboardInputs = {
  acceptedCount: number;
  feedback: Feedback[];
};

export const dashboardRanges: { id: DashboardRange; label: string }[] = [
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "pilot", label: "Pilot to date" },
];

export const baseDashboardMetrics = {
  acceptedSuggestions: 142,
  completedMeetups: 89,
  repeatMeetups: 34,
  connectionRating: 4.2,
};

export const neighborhoodEngagement = [
  {
    name: "Kralingen",
    acceptedSuggestions: 36,
    completionRate: 72,
    repeatRate: 41,
    participantGroups: 18,
    status: "Strong evening demand",
  },
  {
    name: "Centrum",
    acceptedSuggestions: 29,
    completionRate: 67,
    repeatRate: 34,
    participantGroups: 16,
    status: "Stable hosted uptake",
  },
  {
    name: "Delfshaven",
    acceptedSuggestions: 24,
    completionRate: 61,
    repeatRate: 27,
    participantGroups: 13,
    status: "Needs more venue slots",
  },
  {
    name: "Museumpark",
    acceptedSuggestions: 21,
    completionRate: 69,
    repeatRate: 32,
    participantGroups: 11,
    status: "Weekend supply gap",
  },
  {
    name: "Katendrecht",
    acceptedSuggestions: 18,
    completionRate: 64,
    repeatRate: 38,
    participantGroups: 9,
    status: "Small-group formats work",
  },
  {
    name: "Charlois",
    acceptedSuggestions: 6,
    completionRate: 0,
    repeatRate: 0,
    participantGroups: 4,
    status: "Hidden for privacy",
  },
];

export const activityDemand: {
  id: Interest;
  label: string;
  acceptedSuggestions: number;
  unmetDemand: number;
  frictionNote: string;
}[] = [
  { id: "walking", label: "Walking", acceptedSuggestions: 38, unmetDemand: 19, frictionNote: "Evening hosts fill fastest" },
  { id: "coffee", label: "Coffee", acceptedSuggestions: 31, unmetDemand: 14, frictionNote: "Short notice works well" },
  { id: "museums", label: "Museums", acceptedSuggestions: 24, unmetDemand: 12, frictionNote: "Weekend capacity limited" },
  { id: "board_games", label: "Board games", acceptedSuggestions: 19, unmetDemand: 9, frictionNote: "Venue tables are the bottleneck" },
  { id: "cooking", label: "Cooking", acceptedSuggestions: 15, unmetDemand: 11, frictionNote: "Kitchen slots need partners" },
  { id: "padel", label: "Padel", acceptedSuggestions: 11, unmetDemand: 8, frictionNote: "Beginner sessions over-subscribed" },
  { id: "studying", label: "Studying", acceptedSuggestions: 9, unmetDemand: 7, frictionNote: "Quiet room supply constrained" },
];

export const partnerPerformance = [
  {
    partner: "Bibliotheek Rotterdam",
    type: "Library",
    hostedActivities: 18,
    attendance: 124,
    repeatContribution: 31,
    recommendation: "Add two quiet coffee tables on Tuesday evenings.",
  },
  {
    partner: "Museumpark hosts",
    type: "Museum",
    hostedActivities: 12,
    attendance: 86,
    repeatContribution: 24,
    recommendation: "Open one extra small-group weekend visit.",
  },
  {
    partner: "Sportcentrum West",
    type: "Sport center",
    hostedActivities: 9,
    attendance: 52,
    repeatContribution: 18,
    recommendation: "Reserve beginner padel courts before 19:00.",
  },
  {
    partner: "Neighborhood cafes",
    type: "Cafe network",
    hostedActivities: 15,
    attendance: 73,
    repeatContribution: 22,
    recommendation: "Keep tables public, small, and host-visible.",
  },
  {
    partner: "Community hosts",
    type: "Volunteer network",
    hostedActivities: 14,
    attendance: 69,
    repeatContribution: 27,
    recommendation: "Add more small-group evening walks in Kralingen.",
  },
];

export const llmRecommendations = [
  {
    title: "QR sign-ups convert best",
    evidence: "Users who sign up via QR code are the most likely to accept and attend events.",
    recommendation: "Place more QR codes at libraries, cafes, sport centers, museums, and partner waiting areas.",
    sourceType: "Acquisition pattern",
  },
  {
    title: "Football supply is constrained",
    evidence: "Public football events are consistently overbooked in the Rotterdam pilot.",
    recommendation: "Coordinate more public football field access and add beginner-friendly hosted sessions.",
    sourceType: "Activity demand",
  },
  {
    title: "Life transitions need low-stigma outreach",
    evidence: "Public research often flags separation and divorce as periods with higher social isolation risk.",
    recommendation: "Advertise activity planning through family therapy centers, mediation practices, and municipal family support desks.",
    sourceType: "Population-level outreach",
  },
  {
    title: "Evening walks scale cheaply",
    evidence: "Small-group evening walks have high completion and repeat rates with low venue dependency.",
    recommendation: "Recruit more community hosts for evening walking groups in Kralingen and Centrum.",
    sourceType: "Operational pattern",
  },
];

export const municipalityCanSee = [
  "Grouped trends",
  "Activity uptake",
  "Neighborhood engagement",
  "Repeat rates",
  "Partner capacity gaps",
];

export const municipalityCannotSee = [
  "Names",
  "Exact addresses",
  "Phone or email",
  "Rejected suggestions",
  "Loneliness scores",
  "Mental health status",
];

// --- User Data ---
export const signupChannels = [
  { channel: "QR code scan", count: 68, pct: 48 },
  { channel: "Friend referral", count: 34, pct: 24 },
  { channel: "Municipality website", count: 22, pct: 15 },
  { channel: "Community host invite", count: 12, pct: 8 },
  { channel: "Social media", count: 6, pct: 4 },
];

export const ageGroupStats = [
  { group: "18–24", signups: 14, activeRate: 71, noShowRate: 18, avgActivitiesPerMonth: 2.1 },
  { group: "25–34", signups: 38, activeRate: 82, noShowRate: 12, avgActivitiesPerMonth: 2.8 },
  { group: "35–49", signups: 31, activeRate: 76, noShowRate: 14, avgActivitiesPerMonth: 2.3 },
  { group: "50–64", signups: 29, activeRate: 84, noShowRate: 8, avgActivitiesPerMonth: 3.1 },
  { group: "65+", signups: 30, activeRate: 79, noShowRate: 6, avgActivitiesPerMonth: 3.4 },
];

export const userRetention = [
  { week: "Week 1", active: 142 },
  { week: "Week 2", active: 128 },
  { week: "Week 3", active: 119 },
  { week: "Week 4", active: 114 },
];

// --- Activity Data ---
export const peakTimes = [
  { slot: "Mon–Fri 17:00–19:00", pct: 34, label: "Weekday evening" },
  { slot: "Sat 10:00–12:00", pct: 22, label: "Saturday morning" },
  { slot: "Sun 14:00–17:00", pct: 18, label: "Sunday afternoon" },
  { slot: "Mon–Fri 12:00–13:00", pct: 14, label: "Lunch break" },
  { slot: "Mon–Fri 20:00–22:00", pct: 12, label: "Late evening" },
];

export const groupSizeDistribution = [
  { size: "1-on-1", count: 52, pct: 37 },
  { size: "3–4 people", count: 48, pct: 34 },
  { size: "5–8 people", count: 29, pct: 20 },
  { size: "9+ people", count: 13, pct: 9 },
];

export const venueUtilization = [
  { venue: "Bibliotheek Rotterdam", capacity: 24, used: 18, utilization: 75 },
  { venue: "Sportcentrum West", capacity: 16, used: 9, utilization: 56 },
  { venue: "Museumpark venues", capacity: 12, used: 12, utilization: 100 },
  { venue: "Neighborhood cafes", capacity: 20, used: 15, utilization: 75 },
  { venue: "Public parks / walks", capacity: 40, used: 22, utilization: 55 },
];

// --- Outcome Data ---
export const satisfactionBreakdown = [
  { rating: 5, count: 31, label: "Excellent" },
  { rating: 4, count: 34, label: "Good" },
  { rating: 3, count: 16, label: "Okay" },
  { rating: 2, count: 6, label: "Below expectations" },
  { rating: 1, count: 2, label: "Poor" },
];

export const connectionOutcomes = [
  { metric: "New connections formed", value: 89, unit: "pairs" },
  { metric: "Continued outside app", value: 34, unit: "pairs" },
  { metric: "Avg. meetups before repeat", value: 1.6, unit: "sessions" },
  { metric: "Avg. time to first meetup", value: 3.2, unit: "days" },
];

export const getLiveDashboardMetrics = ({ acceptedCount, feedback }: LiveDashboardInputs) => {
  const repeatCount = feedback.filter((item) => item.wantsRepeat).length;
  const completedCount = feedback.filter((item) => item.attended).length;
  const liveAverage = feedback.length
    ? feedback.reduce((sum, item) => sum + item.connectionRating, 0) / feedback.length
    : baseDashboardMetrics.connectionRating;
  const completedTotal = baseDashboardMetrics.completedMeetups + acceptedCount + completedCount;
  const repeatTotal = baseDashboardMetrics.repeatMeetups + repeatCount;

  return {
    acceptedSuggestions: baseDashboardMetrics.acceptedSuggestions + acceptedCount,
    completedMeetups: completedTotal,
    repeatMeetups: repeatTotal,
    connectionRating: liveAverage,
    completionRate: Math.round((completedTotal / (baseDashboardMetrics.acceptedSuggestions + acceptedCount)) * 100),
    repeatRate: Math.round((repeatTotal / completedTotal) * 100),
  };
};
