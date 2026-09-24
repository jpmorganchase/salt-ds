// Reviewed exceptions to the default painted-bounds fit. Values refer to the
// final 16-unit viewBox at primary stroke 1.5, not to recipe padding.
// Record the optical reason; do not infer a target from bounding-box shape alone.
export const opticalFits = {
  "key-control.svg": {
    targetSpan: 9.125, center: [8, 4.1],
    reason: "Restore the compact raised Control-key caret beside the other keyboard symbols; it must not fill the navigation-chevron frame.",
  },
  "close.svg": {
    targetSpan: 12.5, center: [8, 8],
    reason: "Restore the original dismissal scale while keeping primary line weight and subtle inner joins.",
  },
  "first.svg": {
    targetSpan: 10.8125, center: [8, 8],
    reason: "Restore the compact pagination footprint and keep the boundary bar close to the 12px pixel grid.",
  },
  "last.svg": {
    targetSpan: 10.8125, center: [8, 8],
    reason: "Mirror First at the same compact pagination scale and preserve its bar-to-chevron spacing.",
  },
  ...Object.fromEntries(["up", "down", "left", "right"].map((direction) => [
    "triangle-" + direction + ".svg",
    { targetSpan: 40 / 3, center: [8, 8],
      reason: "Keep directional triangles at their original compact 2:1 proportions and shared scale, independently of status and playback triangles." },
  ])),
  "triangle-right-down.svg": {
    targetSpan: 28 / 3, center: [8, 8],
    reason: "Restore the compact diagonal corner indicator instead of enlarging it to the status-icon frame.",
  },
  "sparkle_solid.svg": {
    targetSpan: 15.5, center: [8, 8], frameSource: "sparkle.svg",
    reason: "Fill the shared surface without moving its painted silhouette or retained marks.",
  },
  "sparkle-refresh_solid.svg": {
    targetSpan: 15.5, center: [8, 8], frameSource: "sparkle-refresh.svg",
    reason: "Fill the shared surface without moving its painted silhouette or retained marks.",
  },
  "favorite_solid.svg": {
    targetSpan: 15.5, center: [8, 8], frameSource: "favorite.svg",
    reason: "Fill the shared surface without moving its painted silhouette or retained marks.",
  },
  "like_solid.svg": {
    targetSpan: 15.5, center: [8, 8], frameSource: "like.svg",
    reason: "Keep the heart lobes, cleft and pointed tip on the outline frame when filling its surface.",
  },
  "print.svg": {
    targetSpan: 13.5, center: [8, 8],
    reason: "Preserve the authored 12px pixel grid for the housing and paper edges; a larger automatic fit blurs these landmarks.",
  },
  "print_solid.svg": {
    targetSpan: 13.5, center: [8, 8], frameSource: "print.svg",
    reason: "Retain the same pixel-aligned paper and housing landmarks as the outline.",
  },
  "arrow-left.svg": {
    targetSpan: 15.5, center: [8, 8.666667],
    reason: "Place the primary shaft on a pixel center at 12px without changing its weight or the arrow gesture.",
  },
  "arrow-right.svg": {
    targetSpan: 15.5, center: [8, 8.666667],
    reason: "Place the primary shaft on a pixel center at 12px without changing its weight or the arrow gesture.",
  },
  "arrow-up.svg": {
    targetSpan: 15.5, center: [8.666667, 8],
    reason: "Place the primary shaft on a pixel center at 12px without changing its weight or the arrow gesture.",
  },
  "arrow-down.svg": {
    targetSpan: 15.5, center: [8.666667, 8],
    reason: "Place the primary shaft on a pixel center at 12px without changing its weight or the arrow gesture.",
  },
  "move-horizontal.svg": {
    targetSpan: 15.5, center: [8, 8.666667],
    reason: "Match the navigation arrows: align the primary shaft at 12px while retaining both arrowheads.",
  },
  "move-vertical.svg": {
    targetSpan: 15.5, center: [8.666667, 8],
    reason: "Match the navigation arrows: align the primary shaft at 12px while retaining both arrowheads.",
  },
  "chevron-left.svg": {
    targetSpan: 13.5, center: [8, 8],
    reason: "Keep the navigation chevron compact beside button text while retaining primary stroke weight, 45-degree arms and its inner weld.",
  },
  "chevron-right.svg": {
    targetSpan: 13.5, center: [8, 8],
    reason: "Keep the navigation chevron compact beside button text while retaining primary stroke weight, 45-degree arms and its inner weld.",
  },
  "chevron-up.svg": {
    targetSpan: 13.5, center: [8, 8],
    reason: "Keep the navigation chevron compact beside button text while retaining primary stroke weight, 45-degree arms and its inner weld.",
  },
  "chevron-down.svg": {
    targetSpan: 13.5, center: [8, 8],
    reason: "Keep the navigation chevron compact beside button text while retaining primary stroke weight, 45-degree arms and its inner weld.",
  },
  "double-chevron-left.svg": {
    targetSpan: 13.5, center: [8, 8],
    reason: "Keep the navigation chevron compact beside button text while retaining primary stroke weight, 45-degree arms and its inner weld.",
  },
  "double-chevron-right.svg": {
    targetSpan: 13.5, center: [8, 8],
    reason: "Keep the navigation chevron compact beside button text while retaining primary stroke weight, 45-degree arms and its inner weld.",
  },
  "double-chevron-up.svg": {
    targetSpan: 13.5, center: [8, 8],
    reason: "Keep the navigation chevron compact beside button text while retaining primary stroke weight, 45-degree arms and its inner weld.",
  },
  "double-chevron-down.svg": {
    targetSpan: 13.5, center: [8, 8],
    reason: "Keep the navigation chevron compact beside button text while retaining primary stroke weight, 45-degree arms and its inner weld.",
  },
  "edit_solid.svg": {
    targetSpan: 15.5, center: [8, 8], frameSource: "edit.svg",
    reason: "Retain the complete pencil silhouette, nib and cap anchors when filling the shared outline.",
  },
  "dashboard_solid.svg": {
    targetSpan: 15.5, center: [8, 8], frameSource: "dashboard.svg",
    reason: "Keep the dial rim, radial tick anchors and needle hub fixed across variants.",
  },
  "crops.svg": {
    targetSpan: 15.5,
    center: [8, 8],
    frameSource: "crops_solid.svg",
    reason:
      "Preserve the preferred light solid leaves and common stem; the inset outline uses that frame, with its reviewed painted bounds measured at width 1.5.",
  },
  "man_solid.svg": {
    targetSpan: 15.5,
    center: [8, 8],
    frameSource: "man.svg",
    reason:
      "Retain the head and body anchors while opening the leg gap through one complete painted silhouette.",
  },
  "man-woman_solid.svg": {
    targetSpan: 15.5,
    center: [8, 8],
    frameSource: "man-woman.svg",
    reason:
      "Retain the head and body anchors while opening the leg gap through one complete painted silhouette.",
  },
  "woman_solid.svg": {
    targetSpan: 15.5,
    center: [8, 8],
    frameSource: "woman.svg",
    reason:
      "Retain the head and body anchors while opening the leg gap through one complete painted silhouette.",
  },

  "cloud_solid.svg": {
    targetSpan: 15.5,
    center: [8, 8],
    frameSource: "cloud.svg",
    reason:
      "Preserve the complete cloud rim and the action's exact anchors while subtracting its clearance from one filled silhouette.",
  },
  "cloud-upload_solid.svg": {
    targetSpan: 15.5,
    center: [8, 8],
    frameSource: "cloud-upload.svg",
    reason:
      "Preserve the complete cloud rim and the action's exact anchors while subtracting its clearance from one filled silhouette.",
  },
  "cloud-download_solid.svg": {
    targetSpan: 15.5,
    center: [8, 8],
    frameSource: "cloud-download.svg",
    reason:
      "Preserve the complete cloud rim and the action's exact anchors while subtracting its clearance from one filled silhouette.",
  },
  "cloud-sync_solid.svg": {
    targetSpan: 15.5,
    center: [8, 8],
    frameSource: "cloud-sync.svg",
    reason:
      "Preserve the complete cloud rim and the action's exact anchors while subtracting its clearance from one filled silhouette.",
  },
  "cloud-disabled_solid.svg": {
    targetSpan: 15.5,
    center: [8, 8],
    frameSource: "cloud-disabled.svg",
    reason:
      "Preserve the complete cloud rim and the action's exact anchors while subtracting its clearance from one filled silhouette.",
  },

  "send_solid.svg": {
    targetSpan: 14.846082,
    center: [7.96749, 7.999998],
    frameSource: "send.svg",
    reason:
      "Use the outline painted contour at the midpoint theme weight while preserving the established open tapered seam.",
  },
  "hidden_solid.svg": {
    targetSpan: 15.5,
    center: [8, 8],
    frameSource: "hidden.svg",
    reason:
      "Preserve the complete eye rim while keeping the slash, pupil and reviewed clearance on the outline frame.",
  },
  "add.svg": {
    targetSpan: 12.5,
    center: [8.666667, 8.666667],
    reason:
      "Align the primary operator strokes at 12px while retaining the compact arithmetic family span and weight.",
  },
  "remove.svg": {
    targetSpan: 12.5,
    center: [8, 8.666667],
    reason:
      "Align the primary operator strokes at 12px while retaining the compact arithmetic family span and weight.",
  },
  "multiply.svg": {
    targetSpan: 12.5,
    center: [8, 8],
    reason:
      "Balance the arithmetic operator beside compact comparison symbols while preserving its primary stroke and gesture.",
  },
  "divide.svg": {
    targetSpan: 12.5,
    center: [8, 8.666667],
    reason:
      "Align the primary operator strokes at 12px while retaining the compact arithmetic family span and weight.",
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
    targetSpan: 10.5,
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
