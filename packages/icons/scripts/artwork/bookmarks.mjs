import { withSharedMark } from "./mark-composition.mjs";
import { softenedFrame as SF } from "./contour-profiles.mjs";
import { F } from "./primitives.mjs";

// Keep the ribbon's established proportions, two tails and inward V together
// as the family grows. B eases the top interior; the characteristic V stays sharp.
const ribbon = "M6 2.25H18V21.75L12 17.25 6 21.75Z";
const outline = SF(ribbon);
// Retain the same outside rim at every configured width. The removal counter
// sits fully inside the ribbon, away from this shared boundary stroke.
const solid = F(ribbon) + outline;

// Removal is an action on a saved bookmark, not a disabled state or disk save.
// A flat minus preserves both tails and avoids a slash through the silhouette.
// Compose this 5 x 1.5-unit mark after fitting so positive and inverse forms
// retain identical placement and remain legible when the outline width changes.
const removeMark = "M5.5 6H10.5V7.5H5.5Z";

export default {
  bookmark: [outline, solid],
  "remove-bookmark": [
    withSharedMark(outline, removeMark),
    withSharedMark(solid, removeMark, true),
  ],
};
