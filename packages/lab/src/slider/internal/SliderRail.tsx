import { makePrefixer } from "@salt-ds/core";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import sliderCss from "../Slider.css";

export interface SliderRailProps {}

const withBaseName = makePrefixer("saltSliderRail");

export function SliderRail(props: SliderRailProps) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-slider",
    css: sliderCss,
    window: targetWindow,
  });
  return <div className={withBaseName()} />;
}
