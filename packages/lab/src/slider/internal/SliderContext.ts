import { useContext, createContext } from "react";
import { SliderChangeHandler, SliderValue } from "../types";
export interface SliderContextValue {
  min: number;
  max: number;
  step: number;
  value: SliderValue;
  onChange: SliderChangeHandler;
  ariaLabel: string | undefined;
}

export const SliderContext = createContext<SliderContextValue>({
  min: 0,
  max: 10,
  step: 1,
  value: [0],
  onChange: () => null,
  ariaLabel: "slider",
});

export function useSliderContext() {
  return useContext(SliderContext);
}
