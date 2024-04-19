import { Label, makePrefixer } from "@salt-ds/core";
import { ComponentPropsWithoutRef } from "react";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import sliderMarksCss from "./SliderMarks.css";

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
  const targetWindow = useWindow();
  useComponentCssInjection({
    css: sliderMarksCss,
    window: targetWindow,
  });

  const marks = [];
  for (let i = min; i <= max; i = i + step) {
    marks.push(i);
  }

  return (
    <div className={withBaseName()} {...rest}>
      {marks.map((mark) => {
        return <Label key={mark}>{mark}</Label>;
      })}
    </div>
  );
}
