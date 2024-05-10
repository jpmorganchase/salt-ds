import { SliderChangeHandler, SliderValue } from "../types";
import { clampValue, roundToStep, roundToTwoDp, setRangeValue } from "./utils";

export function useKeyDownThumb(
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  setValue: SliderChangeHandler,
  onChange: SliderChangeHandler,
  index: number
) {
  return (event: React.KeyboardEvent) => {
    let valueItem: number = Array.isArray(value)
      ? index
        ? value[1]
        : value[0]
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
    valueItem = clampValue(valueItem, min, max);

    Array.isArray(value)
      ? setRangeValue(value, valueItem, setValue, onChange, index, step)
      : (setValue(valueItem), onChange?.(valueItem));
  };
}
