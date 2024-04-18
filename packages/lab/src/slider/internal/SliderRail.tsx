import { makePrefixer } from "@salt-ds/core";
import { ComponentPropsWithoutRef } from "react";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import SliderRailCss from "./SliderRail.css";

export interface SliderRailProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltSliderRail");

export function SliderRail() {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-slider-track",
    css: SliderRailCss,
    window: targetWindow,
  });
  return <div className={withBaseName()} />;
}
