import { createContext } from "@salt-ds/core";
import { SyntheticEvent, useContext } from "react";

type Item = any;

export interface OptionValue {
  id: string;
  disabled: boolean;
  value: Item;
  text: string;
}

export interface ListControlContextValue {
  openState: boolean;
  setOpen: (event: SyntheticEvent, newOpen: boolean) => void;
  register: (optionValue: OptionValue, element: HTMLElement) => () => void;
  selectedState: Item[];
  select: (event: SyntheticEvent, option: OptionValue) => void;
  activeState?: OptionValue;
  setActive: (option: OptionValue) => void;
  multiselect: boolean;
  focusVisibleState: boolean;
}

export const ListControlContext = createContext<ListControlContextValue>(
  "ListControlContext",
  {
    openState: false,
    setOpen() {
      return undefined;
    },
    register() {
      return () => undefined;
    },
    selectedState: [],
    select() {
      return undefined;
    },
    activeState: undefined,
    setActive() {
      return undefined;
    },
    multiselect: false,
    focusVisibleState: false,
  }
);

export function useListControlContext() {
  return useContext(ListControlContext);
}
