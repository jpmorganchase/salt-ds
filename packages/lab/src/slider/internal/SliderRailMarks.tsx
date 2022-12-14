import { ReactNode, useMemo } from "react";
import { makePrefixer } from "@salt-ds/core";
import cn from "classnames";
import { createHandleStyles, createSliderRailMarksStyle } from "./styles";
import { isMarkAtMax } from "./utils";
import "../Slider.css";

const withBaseName = makePrefixer("uitkSliderRailMarks");

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
            className={cn(withBaseName("mark"), {
              [withBaseName("max")]: isMarkAtMax(max, mark),
            })}
            style={markStyles[i]}
          />
        );
      })}
    </div>
  );
}
