import { softenedStroke } from "./contour-profiles.mjs";
import { F } from "./primitives.mjs";
// A closed surface whose outline and solid keep the same painted perimeter.
// Share the final optical frame too; sharing centerlines alone is insufficient.
// Not for inverse marks or surfaces with foreground clearance.
export function retainedSurface(path, { width, miterLimit = 4 } = {}) {
  const rim = softenedStroke(path, width).replaceAll(
    'stroke-linejoin="miter"',
    'stroke-linejoin="miter" stroke-miterlimit="' + miterLimit + '"',
  );
  return [rim, F(path) + rim];
}
