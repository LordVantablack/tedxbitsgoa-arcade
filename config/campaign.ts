export const CAMPAIGN = {
  name: "TEDxBITSGoa Arcade",
  registrationUrl: "",
  // Turn this off again when the event closes.
  enabled: true,
  startsAt: null as string | null,
  endsAt: null as string | null,
  leaderboardSize: 10,
  allowedGoogleWorkspaceDomain: "goa.bits-pilani.ac.in",
  leaderboardEligibleEmailGlob: "f2026[0-9][0-9][0-9][0-9]@goa.bits-pilani.ac.in",
} as const;

const LEADERBOARD_ELIGIBLE_EMAIL = /^f2026\d{4}@goa\.bits-pilani\.ac\.in$/;

export function isLeaderboardEligibleEmail(email: string): boolean {
  return LEADERBOARD_ELIGIBLE_EMAIL.test(email.trim().toLowerCase());
}

export function isCampaignLive(now = new Date()): boolean {
  if (!CAMPAIGN.enabled) return false;
  if (CAMPAIGN.startsAt && now < new Date(CAMPAIGN.startsAt)) return false;
  if (CAMPAIGN.endsAt && now > new Date(CAMPAIGN.endsAt)) return false;
  return true;
}
