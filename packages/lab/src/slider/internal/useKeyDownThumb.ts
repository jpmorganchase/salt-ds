import { SliderChangeHandler, SliderValue } from "../types";
import { clampValue, roundToStep, roundToTwoDp, setValue } from "./utils";

export function useKeyDownThumb(
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  onChange: SliderChangeHandler,
  index: number
) {
  return (event: React.KeyboardEvent) => {
    let newValue: number = value[index];
    switch (event.key) {
      case "Home":
        newValue = min;
        break;
      case "End":
        newValue = max;
        break;
      case "ArrowUp":
      case "ArrowRight":
        newValue += step;
        break;
      case "ArrowDown":
      case "ArrowLeft":
        newValue -= step;
        break;
      default:
        return;
    }

    newValue = roundToStep(newValue, step);
    newValue = roundToTwoDp(newValue);
    newValue = clampValue(newValue, min, max);
    value.length > 1
      ? (newValue =
          index === 0
            ? Math.min(newValue, value[1] - step)
            : Math.max(newValue, value[0] + step))
      : null;

    setValue(value, newValue, index, onChange);
  };
}
