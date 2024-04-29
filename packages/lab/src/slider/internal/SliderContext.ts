import { useContext, createContext } from "react";

export type SliderValue = number;
export type SliderChangeHandler = (value: SliderValue) => void;


export interface SliderContextValue {
  min: number | undefined,
  max: number | undefined,
  step: number | undefined,
  value: SliderValue | undefined,
  setValue: () => void,
  onChange: () => void

 
  getFloatingProps: (
    userProps?: React.HTMLProps<HTMLElement> | undefined
  ) => Record<string, unknown>;
  getReferenceProps: (
    userProps?: React.HTMLProps<Element> | undefined
  ) => Record<string, unknown>;
}

export const SliderContext = createContext<SliderContextValue>(
  {
    min: undefined,
    max: undefined,
    step: undefined,
    value: 0,
    setValue: () => null,
    onChange: () => null
  }
);

export function useSliderContext() {
  return useContext(SliderContext);
}
