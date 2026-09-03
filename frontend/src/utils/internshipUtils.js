/**
 * Internship utility functions for resolving primary active tracks and deduplicating
 * candidates who have multiple historical internship records.
 */

export function isTrackOngoing(status) {
  if (!status) return true;
  return status !== "completed" && status !== "terminated";
}

/**
 * Returns the single primary/current internship for a given intern ID.
 * Prioritizes active/ongoing tracks, fallback to the latest created track.
 */
export function getPrimaryInternship(internId, internships = []) {
  if (!internId || !Array.isArray(internships)) return null;

  const tracks = internships.filter(
    (i) => i.intern_id === internId || i.intern?.id === internId
  );

  if (tracks.length === 0) return null;
  if (tracks.length === 1) return tracks[0];

  // 1. Prioritize active / ongoing track
  const activeTrack = tracks.find((i) => isTrackOngoing(i.status));
  if (activeTrack) return activeTrack;

  // 2. Fallback to newest track by ID or start date
  return [...tracks].sort((a, b) => (b.id || 0) - (a.id || 0))[0];
}

/**
 * Returns the last completed internship for a given intern ID (for alumni views).
 */
export function getLastCompletedInternship(internId, internships = []) {
  if (!internId || !Array.isArray(internships)) return null;

  const tracks = internships.filter(
    (i) => (i.intern_id === internId || i.intern?.id === internId) && i.status === "completed"
  );

  if (tracks.length === 0) return getPrimaryInternship(internId, internships);
  return [...tracks].sort((a, b) => (b.id || 0) - (a.id || 0))[0];
}

/**
 * Deduplicates a list of internship records by unique intern candidate (intern.id).
 * For each intern, selects only their current/latest internship track.
 * Past completed tracks remain archived for records.
 */
export function getUniqueInternCurrentTracks(internships = []) {
  if (!Array.isArray(internships)) return [];

  const internMap = new Map();

  // Sort so active/ongoing tracks come first, then newest by ID
  const sorted = [...internships].sort((a, b) => {
    const aActive = isTrackOngoing(a.status) ? 1 : 0;
    const bActive = isTrackOngoing(b.status) ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;
    return (b.id || 0) - (a.id || 0);
  });

  for (const track of sorted) {
    const internId = track.intern_id || track.intern?.id;
    if (internId && !internMap.has(internId)) {
      internMap.set(internId, track);
    }
  }

  return Array.from(internMap.values());
}
