import { roundValue } from "./utils";

function lerp(min: number, max: number, value: number) {
  return ((value - min) / (max - min)) * 100;
}

// This doesn't seem to be the most accurate - worse when min !== 0
export function getTrackGridTemplateColumns(
  min: number,
  max: number,
  value: number,
  step: number
) {
  const normaliseValueBetweenRange = lerp(min, max, value);
  // console.log(normaliseValueBetweenRange)
  // let normaliseValueBetweenRangeRounded = roundValue(
  //   normaliseValueBetweenRange,
  //   step
  // );
  // normaliseValueBetweenRangeRounded =
  //   normaliseValueBetweenRangeRounded >= 100
  //     ? 100
  //     : normaliseValueBetweenRangeRounded;
  return {
    gridTemplateColumns: `${normaliseValueBetweenRange}% auto auto`,
  };
}

export function getMarkStyles(
  min: number,
  max: number,
  step: number
){

  const marks = []

  for (let i = min; i <= max; i = i + step) {
    const MarkPosition = lerp(min, max, i)
    // const MarkPositionRounded = roundValue(MarkPosition, i)
    // if (!MarkPosition) return  marks.push({ index: i, position: `${MarkPositionRounded}%` });
  
    marks.push({ index: i, position: `${MarkPosition}%` });
  }

  return marks
 
  

}
