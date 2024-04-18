import { roundValue } from "./utils";

function lerp (min: number, max: number, value: number) {
  return ((value - min)/(max-min) * 100)
}

export function createTrackGridTemplateColumns(min: number, max: number, value: number, step: number) {
  const normaliseValueBetweenRange = lerp(min, max, value)
  const normaliseValuedBetweenRangeRounded = roundValue(normaliseValueBetweenRange, step)
  return{ gridTemplateColumns: `${normaliseValuedBetweenRangeRounded}% auto auto` }

}




