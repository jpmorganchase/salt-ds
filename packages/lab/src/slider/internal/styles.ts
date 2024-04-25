import { roundToTwoDp } from "./utils";

function getPosition(min: number, max: number, value: number) {
  const position = ((value - min) / (max - min)) * 100;
  return Math.min(Math.max(position, 0), 100);
}

export function getTrackGridTemplateColumns(
  min: number,
  max: number,
  value: number
) {
  const normaliseValueBetweenRange = getPosition(min, max, value);
  return {
    gridTemplateColumns: `${normaliseValueBetweenRange}% auto auto`,
  };
}

export function getMarkStyles(min: number, max: number, step: number) {
  const marks = [];
  for (let i = min; i <= max; i = i + step) {
    const MarkPosition = getPosition(min, max, i);
    const MarkLabel = roundToTwoDp(i);
    marks.push({ index: MarkLabel, position: `${MarkPosition}%` });
  }

  return marks;
}
