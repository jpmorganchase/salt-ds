// Reviewed exceptions to the default painted-bounds fit. Values refer to the
// final 16-unit viewBox at primary stroke 1.5, not to recipe padding.
// Record the optical reason; do not infer a target from bounding-box shape alone.
export const opticalFits = {
  "send_solid.svg": {
    targetSpan: 14.846082,
    center: [7.96749, 7.999998],
    frameSource: "send.svg",
    reason:
      "Use the outline painted contour at the midpoint theme weight while preserving the established open tapered seam.",
  },
  "hidden_solid.svg": {
    targetSpan: 13.984375,
    center: [7.8828125, 8],
    frameSource: "hidden.svg",
    reason:
      "Keep the slash and pupil fragments fixed while filling the eye and preserving its reviewed clearance.",
  },
  "add.svg": {
    targetSpan: 12.5,
    center: [8, 8],
    reason:
      "Balance the arithmetic operator beside compact comparison symbols while preserving its primary stroke and gesture.",
  },
  "remove.svg": {
    targetSpan: 12.5,
    center: [8, 8],
    reason:
      "Balance the arithmetic operator beside compact comparison symbols while preserving its primary stroke and gesture.",
  },
  "multiply.svg": {
    targetSpan: 12.5,
    center: [8, 8],
    reason:
      "Balance the arithmetic operator beside compact comparison symbols while preserving its primary stroke and gesture.",
  },
  "divide.svg": {
    targetSpan: 12.5,
    center: [8, 8],
    reason:
      "Balance the arithmetic operator beside compact comparison symbols while preserving its primary stroke and gesture.",
  },
  "equal.svg": {
    targetSpan: 12.5,
    center: [8, 8],
    reason:
      "Balance the arithmetic operator beside compact comparison symbols while preserving its primary stroke and gesture.",
  },
  "does-not-equal.svg": {
    targetSpan: 12.5,
    center: [8, 8],
    reason:
      "Balance the arithmetic operator beside compact comparison symbols while preserving its primary stroke and gesture.",
  },
  "filter.svg": {
    targetSpan: 14.1875,
    center: [7.34375, 7.984375],
    frameSource: "filter-clear.svg",
    reason:
      "Keep the funnel fixed when the clear mark appears, reserving its space in the base state.",
  },
  "filter_solid.svg": {
    targetSpan: 14.1875,
    center: [7.34375, 7.984375],
    frameSource: "filter-clear.svg",
    reason:
      "Fill the same funnel contour without enlarging its geometry or changing the clear-state scale.",
  },
  "filter-clear_solid.svg": {
    targetSpan: 15.5,
    center: [8, 8],
    frameSource: "filter-clear.svg",
    reason: "Keep the funnel and clear cross fixed when the funnel is filled.",
  },
  "music.svg": {
    targetSpan: 13.625,
    center: [8.015625, 7.09375],
    frameSource: "music-disabled.svg",
    reason:
      "Keep the same note and beam scale when the disabled slash is added.",
  },
  "music_solid.svg": {
    targetSpan: 13.625,
    center: [8.015625, 7.09375],
    frameSource: "music-disabled.svg",
    reason: "Keep the filled note on the same frame as both disabled variants.",
  },
  "stop.svg": {
    targetSpan: 14.5,
    center: [8, 8],
    reason:
      "Keep the Stop pair on one square boundary, balanced beside Play and Pause.",
  },
  "stop_solid.svg": {
    targetSpan: 14.5,
    center: [8, 8],
    reason:
      "Keep the Stop pair on one square boundary, balanced beside Play and Pause.",
  },
  "minimize.svg": {
    targetSpan: 11,
    center: [8, 12.5],
    reason:
      "Preserve the compact lower edge of a window beside Maximize and Restore.",
  },
  "greater-than.svg": {
    targetSpan: 10.1,
    center: [8, 8],
    reason:
      "Use a compact comparison gesture at the same scale as its equality-bar companion.",
  },
  "less-than.svg": {
    targetSpan: 10.1,
    center: [8, 8],
    reason: "Mirror GreaterThan at its compact mathematical scale.",
  },
  "greater-than-equal-to.svg": {
    targetSpan: 13.5,
    center: [8, 8],
    reason:
      "Reserve space for the equality bar while keeping the comparison gesture at the standalone scale.",
  },
  "less-than-equal-to.svg": {
    targetSpan: 13.5,
    center: [8, 8],
    reason:
      "Mirror GreaterThanEqualTo, preserving its comparison gesture and bar spacing.",
  },
  "close_small.svg": {
    targetSpan: 12.5,
    center: [8, 8],
    reason:
      "Preserve the compact dismissal size beside Close without reducing its primary stroke.",
  },
  "checkmark.svg": {
    targetSpan: 9 + Math.SQRT2,
    center: [8, 7.75 + Math.SQRT2 / 4],
    reason:
      "Keep the standalone tick identical to its enclosed and inverse companions.",
  },
  "cloud-success_solid.svg": {
    targetSpan: 15.5,
    center: [8, 7.984375],
    frameSource: "cloud-success.svg",
    reason:
      "Keep the compact tick identical to the outline while using one filled cloud contour with a uniform cutout.",
  },
  "music-disabled_solid.svg": {
    targetSpan: 15.46875,
    center: [8, 8.015625],
    frameSource: "music-disabled.svg",
    reason:
      "Keep the disabled slash aligned with the outline while joining the filled beam and note to their retained stems.",
  },
  "notification-read_solid.svg": {
    targetSpan: 15.5,
    center: [8, 8],
    frameSource: "notification-read.svg",
    reason:
      "Preserve the compact tick and bell landmarks while cutting its clearance from one filled silhouette.",
  },
  "exponentiation.svg": {
    targetSpan: 8,
    center: [8, 4.25],
    reason:
      "Keep the power operator compact and raised in the upper half, distinct from a centered navigation chevron.",
  },
  "favorite_solid.svg": {
    targetSpan: 15,
    center: [8, 8],
    reason: "Reduce the filled star's apparent size beside its outline.",
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
  "volume-down.svg": {
    targetSpan: 12.281818,
    center: [6.390909, 8],
    reason:
      "Keep the speaker and inner wave at VolumeUp's size and anchor when the outer wave is absent.",
  },
  "volume-off.svg": {
    targetSpan: 15.06747,
    center: [7.783735, 8],
    reason:
      "Keep the speaker at VolumeUp's size and anchor while allowing the mute cross its own width.",
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
    if (optical.frameSource !== undefined) {
      if (
        typeof optical.frameSource !== "string" ||
        !optical.frameSource.trim() ||
        optical.frameSource === name
      )
        throw new Error(`Invalid optical frame source: ${name}`);
      if (registeredGroups && !registeredGroups.has(optical.frameSource))
        throw new Error(
          `Unknown optical frame source: ${name} -> ${optical.frameSource}`,
        );
      // One direct source keeps fitting independent of registry order and
      // prevents both chains and cycles between reviewed exceptions.
      if (opticalFits[optical.frameSource]?.frameSource !== undefined)
        throw new Error(
          `Chained optical frame source: ${name} -> ${optical.frameSource}`,
        );
    }
  }
}
