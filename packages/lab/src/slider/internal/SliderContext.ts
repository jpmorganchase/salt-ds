import { useContext, createContext } from "react";
import { SliderChangeHandler, SliderValue } from "../types";
export interface SliderContextValue {
  min: number;
  max: number;
  step: number;
  value: SliderValue;
  setValue: SliderChangeHandler;
  onChange: SliderChangeHandler | undefined;
  ariaLabel: string | undefined
}

export const SliderContext = createContext<SliderContextValue>({
  min: 0,
  max: 0,
  step: 0,
  value: 0,
  setValue: () => null,
  onChange: () => null,
  ariaLabel: 'slider'
});

export function useSliderContext() {
  return useContext(SliderContext);
}
