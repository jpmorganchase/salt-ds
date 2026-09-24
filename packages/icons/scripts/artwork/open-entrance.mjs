import { S } from "./primitives.mjs";
import { softenedFrame, innerContour } from "./contour-profiles.mjs";

// Rectangular entrances remain open at ground level. Keep one continuous
// wall-to-jamb contour so butt caps cannot leave steps at the threshold.
export function openEntrance(left, top, right, bottom) {
  if (!(right > left && bottom > top)) throw Error("Invalid entrance bounds");
  const corners = [
    [left, top],
    [right, top],
  ];
  return {
    notch: `H${right}V${top}H${left}V${bottom}`,
    reverseNotch: `H${left}V${top}H${right}V${bottom}`,
    frame: (shell) =>
      softenedFrame(shell, { keep: corners }) +
      innerContour(shell, { radius: 1.2, at: corners }),
    ground: (from, to) =>
      S(`M${from} ${bottom}H${left}M${right} ${bottom}H${to}`),
  };
}
