import { roundValue } from "./utils";

function lerp (min: number, max: number, value: number) {
  return ((value - min)/(max-min) * 100)
}

// This doesn't seem to be the most accurate - worse when min !== 0
export function createTrackGridTemplateColumns(min: number, max: number, value: number, step: number) {
  const normaliseValueBetweenRange = lerp(min, max, value)
  let normaliseValuedBetweenRangeRounded = roundValue(normaliseValueBetweenRange, step)
  normaliseValuedBetweenRangeRounded = normaliseValuedBetweenRangeRounded >= 100 ? 100 : normaliseValuedBetweenRangeRounded
  return{ gridTemplateColumns: `${normaliseValuedBetweenRangeRounded}% auto auto` }

}




