import { SliderChangeHandler, SliderValue } from "../types";
import { roundToStep, roundToTwoDp } from "./utils";

export function useKeyDownThumb(
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  setValue: SliderChangeHandler,
  onChange: SliderChangeHandler | undefined,
  index: number
) {
  return (event: React.KeyboardEvent) => {
    let valueItem: number = Array.isArray(value)
      ? index
        ? value[0]
        : value[1]
      : value;
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
    valueItem = roundToStep(valueItem, step);
    valueItem = roundToTwoDp(valueItem);
    if (Array.isArray(value)) {
      index ? setValue([valueItem, value[1]]) : setValue([value[0], valueItem]);
      index ? onChange?.([valueItem, value[1]]) : onChange?.([value[0], valueItem]);
    } else {
      setValue(valueItem);
      onChange?.(valueItem);
    }
  };
}
