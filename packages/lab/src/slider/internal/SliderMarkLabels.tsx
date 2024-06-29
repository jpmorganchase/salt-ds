import { makePrefixer } from "@salt-ds/core";
import { useMemo } from "react";
import type { SliderMark } from "./SliderRailMarks";
import {
  createSliderMarkLabelStyles,
  createSliderMarkLabelsStyle,
} from "./styles";
import { isLabeledMark } from "./utils";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import sliderCss from "../Slider.css";

const withBaseName = makePrefixer("saltSliderMarkLabels");

export interface SliderMarkLabelsProps {
  min: number;
  max: number;
  marks: SliderMark[];
}

export function SliderMarkLabels(props: SliderMarkLabelsProps) {
  const { min, max, marks } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-slider",
    css: sliderCss,
    window: targetWindow,
  });

  const style = useMemo(
    () => createSliderMarkLabelsStyle(min, max, marks),
    [min, max, marks],
  );
  const labelStyles = useMemo(
    () => createSliderMarkLabelStyles(marks),
    [marks],
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
