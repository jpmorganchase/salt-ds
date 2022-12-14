import { makePrefixer } from "@salt-ds/core";
import "../Slider.css";

const withBaseName = makePrefixer("uitkSliderSelection");

export interface SliderSelectionProps {
  valueLength: number;
}

export function SliderSelection({ valueLength }: SliderSelectionProps) {
  return (
    <div className={valueLength < 2 ? withBaseName() : withBaseName("range")} />
  );
}
