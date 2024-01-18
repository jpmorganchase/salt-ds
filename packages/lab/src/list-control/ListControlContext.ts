import { createContext } from "@salt-ds/core";
import { SyntheticEvent, useContext } from "react";

export interface OptionValue<Item> {
  id: string;
  disabled: boolean;
  value: Item;
  text: string;
}

export interface ListControlContextValue<Item> {
  openState: boolean;
  setOpen: (event: SyntheticEvent, newOpen: boolean) => void;
  register: (
    optionValue: OptionValue<Item>,
    element: HTMLElement
  ) => () => void;
  selectedState: unknown[];
  select: (event: SyntheticEvent, option: OptionValue<Item>) => void;
  activeState?: OptionValue<Item>;
  setActive: (option: OptionValue<Item>) => void;
  multiselect: boolean;
  focusVisibleState: boolean;
}

export const ListControlContext = createContext<
  ListControlContextValue<unknown>
>("ListControlContext", {
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
});

export function useListControlContext<Item>() {
  return useContext(ListControlContext) as ListControlContextValue<Item>;
}
