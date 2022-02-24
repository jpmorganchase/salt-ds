import { makePrefixer } from "@brandname/core";
import {
  createSliderMarkLabelsStyle,
  createSliderMarkLabelStyles,
} from "./styles";
import { isLabeledMark } from "./utils";
import { SliderMark } from "./SliderRailMarks";
import { useMemo } from "react";
import "../Slider.css";

const withBaseName = makePrefixer("uitkSliderMarkLabels");

export interface SliderMarkLabelsProps {
  min: number;
  max: number;
  marks: SliderMark[];
}

export function SliderMarkLabels(props: SliderMarkLabelsProps) {
  const { min, max, marks } = props;
  const style = useMemo(
    () => createSliderMarkLabelsStyle(min, max, marks),
    [min, max, marks]
  );
  const labelStyles = useMemo(
    () => createSliderMarkLabelStyles(marks),
    [marks]
  );
  return (
    <div className={withBaseName()} style={style}>
      {marks.map((mark, i) => {
        return (
          <div key={i} className={withBaseName("label")} style={labelStyles[i]}>
            {isLabeledMark(mark) ? mark.label : `${mark}`}
          </div>
        );
      })}
    </div>
  );
}
