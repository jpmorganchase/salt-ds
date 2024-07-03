import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { type ReactNode, useMemo } from "react";
import { createHandleStyles, createSliderRailMarksStyle } from "./styles";
import { isLabeledMark, isMarkAtMax } from "./utils";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import sliderCss from "../Slider.css";

const withBaseName = makePrefixer("saltSliderRailMarks");

export interface LabeledMark {
  value: number;
  label: ReactNode;
}

export type SliderMark = number | LabeledMark;

export interface SliderRailMarksProps {
  min: number;
  max: number;
  marks: SliderMark[];
}

export function SliderRailMarks(props: SliderRailMarksProps) {
  const { min, max, marks } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-slider",
    css: sliderCss,
    window: targetWindow,
  });

  const style = useMemo(
    () => createSliderRailMarksStyle(min, max, marks),
    [min, max, marks],
  );
  const marksLength = marks.length;
  const markStyles = useMemo(
    () => createHandleStyles(marksLength),
    [marksLength],
  );

  return (
    <div className={withBaseName()} style={style}>
      {marks.map((mark, i) => {
        return (
          <div
            key={isLabeledMark(mark) ? mark.value : mark}
            className={clsx(withBaseName("mark"), {
              [withBaseName("max")]: isMarkAtMax(max, mark),
            })}
            style={markStyles[i]}
          />
        );
      })}
    </div>
  );
}
