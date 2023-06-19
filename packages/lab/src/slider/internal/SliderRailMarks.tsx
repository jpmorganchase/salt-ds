import { ReactNode, useMemo } from "react";
import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { createHandleStyles, createSliderRailMarksStyle } from "./styles";
import { isMarkAtMax } from "./utils";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
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
    [min, max, marks]
  );
  const marksLength = marks.length;
  const markStyles = useMemo(
    () => createHandleStyles(marksLength),
    [marksLength]
  );

  return (
    <div className={withBaseName()} style={style}>
      {marks.map((mark, i) => {
        return (
          <div
            key={`Mark${i}`}
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
