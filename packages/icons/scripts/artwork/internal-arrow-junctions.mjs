import { angledJunction } from "./structural-junctions.mjs";

// Direction points from the arrow tip back along its shaft. Fillet only the
// two concave shaft/head sectors, retaining the pointed head and flat ends.
// Radius is in the caller's coordinate system and is chosen for its available
// head-arm length; inspect the exposed curve after fitting and themed paint.
export function arrowRoot(x, y, direction, radius = 1.6, width) {
  const length = Math.hypot(...direction);
  if (!length || radius <= 0) throw new Error("Invalid arrow junction");
  const [dx, dy] = direction.map((v) => v / length);
  return [-1, 1]
    .map((side) =>
      angledJunction(
        x,
        y,
        [dx, dy],
        [dx - side * dy, dy + side * dx],
        radius,
        width,
      ),
    )
    .join("");
}
