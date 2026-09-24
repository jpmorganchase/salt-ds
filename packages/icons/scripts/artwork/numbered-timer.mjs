import { circularArrow } from "./circular-arrow.mjs";
import { group, textLabel } from "./primitives.mjs";

// Retain the timer's established construction-space label anchor. The shared
// arrow moves with it, so export fitting keeps the final circle at [8, 8].
export const numberedTimer = (seconds, direction) =>
  group(
    circularArrow(direction === "forward" ? "clockwise" : "counterclockwise"),
    "translate(0 .75)",
  ) +
  textLabel(seconds, 12, 12.75, 6.3, {
    align: "center",
    verticalAlign: "center",
  });
