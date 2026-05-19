export type Interest =
  | "coffee"
  | "cinema"
  | "football"
  | "basketball"
  | "fencing"
  | "hackathons"
  | "padel"
  | "walking"
  | "museums"
  | "board_games"
  | "studying"
  | "cooking"
  | "community_events"
  | "yoga"
  | "cycling"
  | "photography"
  | "music"
  | "gardening"
  | "crafts"
  | "swimming"
  | "dancing"
  | "languages"
  | "other";

export type ComfortKey = "smallGroups" | "oneToOne" | "publicPlacesOnly" | "communityHosted";

export type ComfortPreference = Record<ComfortKey, boolean>;

export type AvailabilitySlot = {
  day: string;
  label: string;
  startTime: string;
  endTime: string;
};

export type ResidentProfile = {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  profileImage: string;
  neighborhood: string;
  travelRadiusKm: number;
  interests: Interest[];
  comfort: ComfortPreference;
  availability: AvailabilitySlot[];
  routines: string[];
};

export type ActivitySession = {
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

export type ActivitySuggestion = ActivitySession & {
  matchScore: number;
  matchReasons: string[];
};

export type Feedback = {
  suggestionId: string;
  attended: boolean;
  feltComfortable: boolean;
  wantsRepeat: boolean;
  connectionRating: 1 | 2 | 3 | 4 | 5;
  reportedIssue: boolean;
};

export type DashboardMetric = {
  label: string;
  value: string;
  trend: string;
};
