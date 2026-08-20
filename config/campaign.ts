export const CAMPAIGN = {
  name: "TEDxBITSGoa Arcade",
  registrationUrl: "",
  // Keep this false until the real dates, form URL, and Google credentials are set.
  enabled: false,
  startsAt: null as string | null,
  endsAt: null as string | null,
  leaderboardSize: 10,
  allowedGoogleWorkspaceDomain: "goa.bits-pilani.ac.in",
} as const;

export function isCampaignLive(now = new Date()): boolean {
  if (!CAMPAIGN.enabled) return false;
  if (CAMPAIGN.startsAt && now < new Date(CAMPAIGN.startsAt)) return false;
  if (CAMPAIGN.endsAt && now > new Date(CAMPAIGN.endsAt)) return false;
  return true;
}
