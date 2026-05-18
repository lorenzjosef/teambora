import type { ActivitySession, AvailabilitySlot, ComfortKey, Interest, ResidentProfile } from "./types";

export const brandAssets = {
  // Replace these with exported final assets later. Current URLs are temporary Figma MCP assets.
  logoWordmark: "Gesellig",
  heroImage: "https://www.figma.com/api/mcp/asset/58671598-5f0c-4cc5-a796-4246eb3fc022",
  cityCardImage: "https://www.figma.com/api/mcp/asset/4384670a-a387-4af9-8206-69c81d48fbd0",
  profileCardImage: "https://www.figma.com/api/mcp/asset/762e0a2d-e4d4-41e2-9141-4ede891e1727",
};

export const interests: { id: Interest; label: string }[] = [
  { id: "coffee", label: "Coffee" },
  { id: "cinema", label: "Cinema" },
  { id: "football", label: "Football" },
  { id: "padel", label: "Padel" },
  { id: "walking", label: "Walking" },
  { id: "museums", label: "Museums" },
  { id: "board_games", label: "Board games" },
  { id: "studying", label: "Study session" },
  { id: "cooking", label: "Cooking" },
  { id: "community_events", label: "Local events" },
];

export const comfortOptions: { id: ComfortKey; label: string; helper: string }[] = [
  { id: "smallGroups", label: "Small groups", helper: "2-5 people" },
  { id: "oneToOne", label: "1:1 optional", helper: "Only if you choose it" },
  { id: "publicPlacesOnly", label: "Public places", helper: "Visible venues first" },
  { id: "communityHosted", label: "Hosted events", helper: "Partner or venue present" },
];

export const availabilityOptions: AvailabilitySlot[] = [
  { day: "Wednesday", label: "Wed afternoon", startTime: "15:00", endTime: "17:00" },
  { day: "Thursday", label: "Thu evening", startTime: "18:30", endTime: "20:00" },
  { day: "Saturday", label: "Sat morning", startTime: "10:00", endTime: "12:00" },
  { day: "Sunday", label: "Sun afternoon", startTime: "14:00", endTime: "16:00" },
];

export const defaultProfile: ResidentProfile = {
  id: "resident-demo",
  displayName: "Alex",
  neighborhood: "Kralingen",
  travelRadiusKm: 4,
  interests: ["walking", "coffee", "museums"],
  comfort: {
    smallGroups: true,
    oneToOne: false,
    publicPlacesOnly: true,
    communityHosted: true,
  },
  availability: [availabilityOptions[1]],
  routines: ["Evening walk", "Museum visit"],
};

export const sessions: ActivitySession[] = [
  {
    id: "walk-kralingse-plas",
    title: "Evening walk around Kralingse Plas",
    interest: "walking",
    locationName: "Kralingse Plas entrance",
    neighborhood: "Kralingen",
    isPublicPlace: true,
    isCommunityHosted: true,
    hostName: "Rotterdam Library Walks",
    groupSize: "small_group",
    capacity: 5,
    confirmedCount: 3,
    time: availabilityOptions[1],
    status: "open",
  },
  {
    id: "museum-coffee",
    title: "Museum visit with coffee after",
    interest: "museums",
    locationName: "Depot Boijmans cafe",
    neighborhood: "Museumpark",
    isPublicPlace: true,
    isCommunityHosted: true,
    hostName: "Museumpark desk",
    groupSize: "small_group",
    capacity: 4,
    confirmedCount: 2,
    time: availabilityOptions[3],
    status: "open",
  },
  {
    id: "coffee-study",
    title: "Quiet coffee and study table",
    interest: "coffee",
    locationName: "Central Library cafe",
    neighborhood: "Centrum",
    isPublicPlace: true,
    isCommunityHosted: true,
    hostName: "Bibliotheek Rotterdam",
    groupSize: "small_group",
    capacity: 6,
    confirmedCount: 4,
    time: availabilityOptions[0],
    status: "open",
  },
  {
    id: "padel-intro",
    title: "Beginner padel court",
    interest: "padel",
    locationName: "Sportpark Noord",
    neighborhood: "Noord",
    isPublicPlace: true,
    isCommunityHosted: false,
    groupSize: "small_group",
    capacity: 4,
    confirmedCount: 4,
    time: availabilityOptions[1],
    status: "open",
  },
];

export const neighborhoods = ["Kralingen", "Centrum", "Delfshaven", "Noord", "Museumpark"];

export const routines = ["Evening walk", "Coffee break", "Museum visit", "Study block", "Weekend market"];
