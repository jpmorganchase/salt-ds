import { CSSProperties } from "react";
import { SliderValue } from "../types";
import { SliderMark } from "./SliderRailMarks";
import { isLabeledMark } from "./utils";

function widthToPercentage(w: number, max: number) {
  return `${Math.round((1000 * w) / max) * 0.1}%`;
}

function lerp (min: number, max: number, value: number) {
  return ((value - min)/(max-min) * 100)
}

//Might need to round this so it's not folating point numbers 
//The thumb doesn't always go directly to the slider, 
//Try rounding this using the step value given by the user
export function createTrackGridTemplateColumns(min: number, max: number, value: number) {
  const normaliseValueBetweenRange = lerp(min, max, value)
  return{ gridTemplateColumns: `${normaliseValueBetweenRange}% auto auto` }

}

function createGridTemplateColumns(
  min: number,
  max: number,
  values: number[]
): string {
  const range = max - min;
  const colWidths: number[] = [];
  console.log({min})
  let prev = min;
  for (const v of values) {
    console.log({v})
    // Why equate prev and min ?
    colWidths.push(v - prev);
    prev = v;
  }
  console.log({colWidths})
  colWidths.push(max - prev);
  console.log({colWidths})
  let auto = false;
  const colTemplates = colWidths.map((w) => {
    console.log(w)
    if (w === 0) {
      return "0";
    }
    if (!auto) {
      console.log({w})
      auto = true;
      return "auto";
    }
    return widthToPercentage(w, range);
  });
  console.log({prev})
  console.log({values})
  console.log({colTemplates})
  return colTemplates.join(" ");
}

// export function createTrackStyle(
//   min: number,
//   max: number,
//   value: SliderValue
// ): CSSProperties {

//   // const values = Array.isArray(value) ? value : [value];
//   const normalizedValue = lerp(value, min, max)
//   console.log({normalizedValue})
//   const percentageValue = widthToPercentage(normalizedValue, max)
//   console.log(percentageValue)
//   return percentageValue

  
// }

export function createTrackStyle(
  min: number,
  max: number,
  value: SliderValue
): CSSProperties {
  const values = Array.isArray(value) ? value : [value];



  return {
    gridTemplateColumns: createGridTemplateColumns(min, max, values),
  };
}


export function createHandleStyles(count: number) {
  return [...Array(count).keys()].map((i) => ({
    gridColumnStart: `${i + 2}`,
  }));
}

// export function createSliderRailMarksStyle(
//   min: number,
//   max: number,
//   marks: SliderMark[]
// ): CSSProperties {
//   return {
//     gridTemplateColumns: createGridTemplateColumns(
//       min,
//       max,
//       marks.map((mark) => (isLabeledMark(mark) ? mark.value : mark))
//     ),
//   };
// }

// export function createSliderMarkLabelsStyle(
//   min: number,
//   max: number,
//   marks: SliderMark[]
// ): CSSProperties {
//   const range = max - min;
//   const colWidths: number[] = [];
//   let prev = min;
//   for (let m of marks) {
//     const w = isLabeledMark(m) ? m.value : m;
//     colWidths.push(w - prev);
//     colWidths.push(0);
//     prev = w;
//   }
//   colWidths.push(max - prev);
//   let auto = false;
//   const colTemplates = colWidths.map((w) => {
//     if (w === 0) {
//       return "0";
//     }
//     if (!auto) {
//       auto = true;
//       return "auto";
//     }
//     return widthToPercentage(w, range);
//   });

//   return {
//     gridTemplateColumns: colTemplates.join(" "),
//   };
// }

// export function createSliderMarkLabelStyles(
//   marks: SliderMark[]
// ): CSSProperties[] {
//   const styles: CSSProperties[] = [];
//   marks.forEach((mark, i) => {
//     styles.push({
//       gridColumnStart: 2 * i + 2,
//     });
//   });
//   if (marks.length > 0) {
//     styles[0].justifySelf = "left";
//   }
//   if (marks.length > 1) {
//     styles[marks.length - 1].justifySelf = "right";
//   }
//   return styles;
// }
