import { CSSProperties } from "react";
import { SliderValue } from "../types";
import { SliderMark } from "./SliderRailMarks";
import { isLabeledMark } from "./utils";

function widthToPercentage(w: number, range: number) {
  return `${Math.round((1000 * w) / range) * 0.1}%`;
}

function createGridTemplateColumns(
  min: number,
  max: number,
  values: number[]
): string {
  const range = max - min;
  const colWidths: number[] = [];
  let prev = min;
  for (let v of values) {
    colWidths.push(v - prev);
    prev = v;
  }
  colWidths.push(max - prev);
  let auto = false;
  const colTemplates = colWidths.map((w) => {
    if (w === 0) {
      return "0";
    }
    if (!auto) {
      auto = true;
      return "auto";
    }
    return widthToPercentage(w, range);
  });
  return colTemplates.join(" ");
}

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

export function createSliderRailMarksStyle(
  min: number,
  max: number,
  marks: SliderMark[]
): CSSProperties {
  return {
    gridTemplateColumns: createGridTemplateColumns(
      min,
      max,
      marks.map((mark) => (isLabeledMark(mark) ? mark.value : mark))
    ),
  };
}

export function createSliderMarkLabelsStyle(
  min: number,
  max: number,
  marks: SliderMark[]
): CSSProperties {
  const range = max - min;
  const colWidths: number[] = [];
  let prev = min;
  for (let m of marks) {
    const w = isLabeledMark(m) ? m.value : m;
    colWidths.push(w - prev);
    colWidths.push(0);
    prev = w;
  }
  colWidths.push(max - prev);
  let auto = false;
  const colTemplates = colWidths.map((w) => {
    if (w === 0) {
      return "0";
    }
    if (!auto) {
      auto = true;
      return "auto";
    }
    return widthToPercentage(w, range);
  });

  return {
    gridTemplateColumns: colTemplates.join(" "),
  };
}

export function createSliderMarkLabelStyles(
  marks: SliderMark[]
): CSSProperties[] {
  const styles: CSSProperties[] = [];
  marks.forEach((mark, i) => {
    styles.push({
      gridColumnStart: 2 * i + 2,
    });
  });
  if (marks.length > 0) {
    styles[0].justifySelf = "left";
  }
  if (marks.length > 1) {
    styles[marks.length - 1].justifySelf = "right";
  }
  return styles;
}
