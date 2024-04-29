import { roundToTwoDp, getPercentage } from "./utils";

export function getMarkStyles(min: number, max: number, step: number) {
  const marks = [];
  for (let i = min; i <= max; i = i + step) {
    const MarkPosition = getPercentage(min, max, i);
    const MarkLabel = roundToTwoDp(i);
    marks.push({ index: MarkLabel, position: `${MarkPosition}%` });
  }

  return marks;
}
