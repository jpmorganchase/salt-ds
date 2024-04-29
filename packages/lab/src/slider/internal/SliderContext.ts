import { useContext, createContext } from "react";
import { SliderChangeHandler, SliderValue } from "../types";
export interface SliderContextValue {
  min: number | undefined;
  max: number | undefined;
  step: number | undefined;
  value: SliderValue | undefined;
  setValue: SliderChangeHandler;
  onChange: SliderChangeHandler;
}

export const SliderContext = createContext<SliderContextValue>({
  min: 0,
  max: 0,
  step: 0,
  value: 0,
  setValue: () => null,
  onChange: () => null,
});

export function useSliderContext() {
  return useContext(SliderContext);
}
