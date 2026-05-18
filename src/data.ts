import type { ActivitySession, AvailabilitySlot, ComfortKey, Interest, ResidentProfile } from "./types";

export const brandAssets = {
  logoWordmark: "Gesellig",
  logoMark: "https://www.figma.com/api/mcp/asset/56fe4e24-fc67-49db-bfc9-81042f09c4d7",
  heroImage: "https://www.figma.com/api/mcp/asset/6a35cccc-51a2-4ddb-b303-8a754ceaf661",
  cityCardImage: "https://www.figma.com/api/mcp/asset/62bb4bb6-a083-43a3-8305-ae2948979bee",
  profileCardImage: "https://www.figma.com/api/mcp/asset/aaeeafc5-e073-4507-927a-7aaa80cebaa5",
};

export const peopleCards = [
  {
    name: "Ann James",
    image: "https://www.figma.com/api/mcp/asset/6a35cccc-51a2-4ddb-b303-8a754ceaf661",
    note: "Walking nearby",
    daysLeft: "7 days left",
  },
  {
    name: "Lauren Brand",
    image: "https://www.figma.com/api/mcp/asset/62bb4bb6-a083-43a3-8305-ae2948979bee",
    note: "Museum coffee",
    daysLeft: "7 days left",
  },
  {
    name: "Alex Thomas",
    image: "https://www.figma.com/api/mcp/asset/aaeeafc5-e073-4507-927a-7aaa80cebaa5",
    note: "Board games",
    daysLeft: "4 days left",
  },
];

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
    title: "Depot Boijmans visit + cafe",
    interest: "museums",
    locationName: "Depot Boijmans Van Beuningen",
    neighborhood: "Museumpark",
    isPublicPlace: true,
    isCommunityHosted: true,
    hostName: "Museumpark vrijwilligers",
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
    locationName: "Centrale Bibliotheek",
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
    title: "Beginner padel — no experience needed",
    interest: "padel",
    locationName: "Sportcentrum West",
    neighborhood: "Delfshaven",
    isPublicPlace: true,
    isCommunityHosted: false,
    groupSize: "small_group",
    capacity: 4,
    confirmedCount: 2,
    time: availabilityOptions[1],
    status: "open",
  },
  {
    id: "board-games-katendrecht",
    title: "Board games at Kaapse Brouwers",
    interest: "board_games",
    locationName: "Kaapse Brouwers",
    neighborhood: "Katendrecht",
    isPublicPlace: true,
    isCommunityHosted: true,
    hostName: "Wijkraad Katendrecht",
    groupSize: "small_group",
    capacity: 5,
    confirmedCount: 3,
    time: availabilityOptions[2],
    status: "open",
  },
  {
    id: "cooking-charlois",
    title: "Saturday cooking swap",
    interest: "cooking",
    locationName: "Buurthuis Charlois",
    neighborhood: "Charlois",
    isPublicPlace: true,
    isCommunityHosted: true,
    hostName: "Stichting Buurtwerk",
    groupSize: "small_group",
    capacity: 6,
    confirmedCount: 4,
    time: availabilityOptions[2],
    status: "open",
  },
];

export const neighborhoods = ["Kralingen", "Centrum", "Delfshaven", "Noord", "Museumpark", "Katendrecht", "Charlois", "Feijenoord", "Hillegersberg"];

export const routines = ["Evening walk", "Coffee break", "Museum visit", "Study block", "Weekend market"];
