import { makePrefixer } from "@salt-ds/core";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import sliderCss from "../Slider.css";

const withBaseName = makePrefixer("saltSliderRail");

export function SliderRail() {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-slider",
    css: sliderCss,
    window: targetWindow,
  });
  return <div className={withBaseName()} />;
}
