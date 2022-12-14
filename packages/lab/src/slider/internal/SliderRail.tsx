import { makePrefixer } from "@salt-ds/core";
import "../Slider.css";

export interface SliderRailProps {}

const withBaseName = makePrefixer("saltSliderRail");

export function SliderRail(props: SliderRailProps) {
  return <div className={withBaseName()} />;
}
