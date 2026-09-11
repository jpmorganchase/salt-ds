// Reviewed exceptions to the default painted-bounds fit. Values refer to the
// final 16-unit viewBox at primary stroke 1.5, not to recipe padding.
// Record the optical reason; do not infer a target from bounding-box shape alone.
export const opticalFits = {
  "favorite_solid.svg": {
    targetSpan: 15,
    center: [8, 8],
    reason: "Reduce the filled star's apparent size beside its outline.",
  },
  "filter_solid.svg": {
    targetSpan: 15,
    center: [8, 8],
    reason: "Balance the filled funnel's broad top against the outline.",
  },
  "play.svg": {
    targetSpan: 15.5,
    center: [8.35, 8],
    reason: "Compensate for the triangle's visual weight toward its flat side.",
  },
  "play_solid.svg": {
    targetSpan: 15,
    center: [8.35, 8],
    reason: "Keep the play pair optically aligned and temper the filled mass.",
  },
};

export function getOpticalFit(groupKey) {
  return opticalFits[groupKey];
}

export function validateOpticalFits(registeredGroups) {
  for (const [name, optical] of Object.entries(opticalFits)) {
    if (registeredGroups && !registeredGroups.has(name))
      throw new Error(`Unknown optical fit: ${name}`);
    if (
      !optical ||
      !Number.isFinite(optical.targetSpan) ||
      optical.targetSpan <= 0 ||
      optical.targetSpan > 15.5 ||
      !Array.isArray(optical.center) ||
      optical.center.length !== 2 ||
      Array.from(optical.center).some(
        (value) => !Number.isFinite(value) || value <= 0 || value >= 16,
      ) ||
      typeof optical.reason !== "string" ||
      !optical.reason.trim()
    )
      throw new Error(`Invalid optical fit: ${name}`);
  }
}
