import { SliderChangeHandler, SliderValue } from "../internal/SliderContext";
import { roundToStep, roundToTwoDp } from "./utils";

export function useSliderKeyDown(
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  setValue: (value: SliderValue) => void,
  onChange?: (value: SliderValue) => void
) {
  return (event: React.KeyboardEvent) => {
    let valueItem: number = value;
    switch (event.key) {
      case "Home":
        valueItem = min;
        break;
      case "End":
        valueItem = max;
        break;
      case "ArrowUp":
      case "ArrowRight":
        valueItem += step;
        break;
      case "ArrowDown":
      case "ArrowLeft":
        valueItem -= step;
        break;
      default:
        return;
    }
    event.preventDefault();
    valueItem = roundToStep(valueItem, step);
    valueItem = roundToTwoDp(valueItem);
    setValue(valueItem);
    onChange?.(valueItem);
  };
}
