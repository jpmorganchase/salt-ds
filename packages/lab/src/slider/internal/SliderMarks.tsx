import { Label, makePrefixer } from "@salt-ds/core";
import type { ComponentPropsWithoutRef } from "react";
import { getMarkStyles } from "./utils";

const withBaseName = makePrefixer("saltSliderMarks");

export interface SliderMarksProps extends ComponentPropsWithoutRef<"div"> {
  min: number;
  max: number;
  step: number;
}

export function SliderMarks({
  min,
  max,
  step,
  ...rest
}: SliderMarksProps): JSX.Element {
  const marks = getMarkStyles(min, max, step);
  return (
    <div className={withBaseName()} {...rest}>
      {marks.map((mark) => {
        return (
          <Label
            className={withBaseName("mark")}
            key={mark.value}
            style={{ left: mark.position }}
          >
            {mark.label}
          </Label>
        );
      })}
    </div>
  );
}
