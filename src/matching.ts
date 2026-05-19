import type { ActivitySession, ActivitySuggestion, Feedback, ResidentProfile } from "./types";

const sameSlot = (a: ActivitySession, profile: ResidentProfile) =>
  profile.availability.some((slot) => slot.day === a.time.day && slot.startTime === a.time.startTime);

const nearby = (session: ActivitySession, profile: ResidentProfile) =>
  session.neighborhood === profile.neighborhood ||
  ["Centrum", "Museumpark"].includes(session.neighborhood) ||
  profile.travelRadiusKm >= 4;

export function rankSuggestions(
  profile: ResidentProfile,
  sessions: ActivitySession[],
  rejectedIds: string[],
  blockedIds: string[],
  feedback: Feedback[],
  limit = 3,
): ActivitySuggestion[] {
  return sessions
    .filter((session) => session.status === "open")
    .filter((session) => !rejectedIds.includes(session.id))
    .filter((session) => !blockedIds.includes(session.id))
    .filter((session) => session.confirmedCount < session.capacity)
    .filter((session) => !profile.comfort.publicPlacesOnly || session.isPublicPlace)
    .filter((session) => profile.comfort.oneToOne || session.groupSize !== "one_to_one")
    .map((session) => {
      const reasons: string[] = [];
      let score = 0;

      if (profile.interests.includes(session.interest)) {
        score += 35;
        reasons.push(`${session.confirmedCount} residents nearby chose ${session.interest.replace("_", " ")}.`);
      }

      if (sameSlot(session, profile)) {
        score += 30;
        reasons.push(`Fits your ${session.time.label} availability.`);
      }

      if (nearby(session, profile)) {
        score += 15;
        reasons.push("Public location within your travel radius.");
      }

      if (profile.comfort.smallGroups && session.groupSize === "small_group") {
        score += 12;
        reasons.push("Small-group setting matches your comfort choice.");
      }

      if (profile.comfort.communityHosted && session.isCommunityHosted) {
        score += 8;
        reasons.push("Hosted by a community partner.");
      }

      const prior = feedback.find((item) => item.suggestionId === session.id);
      if (prior?.wantsRepeat) {
        score += 8;
      }

      return {
        ...session,
        matchScore: Math.min(score, 100),
        matchReasons: reasons.slice(0, 4),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
