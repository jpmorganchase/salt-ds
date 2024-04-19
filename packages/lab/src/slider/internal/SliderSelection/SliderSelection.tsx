import { makePrefixer } from "@salt-ds/core";
import { ComponentPropsWithoutRef } from "react";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import sliderSelectionCss from "./SliderSelection.css";

const withBaseName = makePrefixer("saltSliderSelection");

export interface SliderSelectionProps extends ComponentPropsWithoutRef<"div"> {}

export function SliderSelection({ ...props }: SliderSelectionProps) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    css: sliderSelectionCss,
    window: targetWindow,
  });

  return <div className={withBaseName()} {...props} />;
}
