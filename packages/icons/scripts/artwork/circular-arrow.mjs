import { alignedCurvedArrow } from "./curved-arrow.mjs";

// Shared 24-unit construction. The fitted circle has radius 7 about [8, 8],
// with 35/12-unit head arms. Open return arrows retain the full loop's frame.
export function circularArrow(direction = "clockwise", extent = "loop") {
  if (!["clockwise", "counterclockwise"].includes(direction))
    throw new Error("Unknown circular-arrow direction: " + direction);
  if (!["loop", "return", "half"].includes(extent))
    throw new Error("Unknown circular-arrow extent: " + extent);
  const sign = direction === "clockwise" ? 1 : -1;
  const radius = 9;
  const arm = 3.75;
  const tipY = 6.75;
  const tipX = 12 + sign * Math.sqrt(radius ** 2 - (tipY - 12) ** 2);
  const end =
    extent === "return"
      ? [12, 21]
      : extent === "half"
        ? [12 - sign * radius, 12]
        : [12 + sign * radius, 12];
  return alignedCurvedArrow(
    "M" +
      tipX +
      " " +
      tipY +
      "A" +
      radius +
      " " +
      radius +
      " 0 " +
      (extent === "half" ? 0 : 1) +
      " " +
      (sign === 1 ? 0 : 1) +
      " " +
      end.join(" "),
    [
      [0, -arm],
      [-sign * arm, 0],
    ],
  );
}
