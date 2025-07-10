import { type RefObject, type SyntheticEvent, useContext } from "react";
import { createContext } from "../utils";
import { defaultValueToString } from "./ListControlState";

export interface OptionValue<Item> {
  id: string;
  disabled: boolean;
  value: Item;
}

export type OpenChangeReason = "input" | "manual";

export interface ListControlContextValue<Item> {
  openState: boolean;
  setOpen: (newOpen: boolean, openChangeReason?: OpenChangeReason) => void;
  register: (
    optionValue: OptionValue<Item>,
    element: HTMLElement,
  ) => () => void;
  selectedState: unknown[];
  select: (event: SyntheticEvent, option: OptionValue<Item>) => void;
  activeState?: OptionValue<Item>;
  setActive: (option: OptionValue<Item>) => void;
  multiselect: boolean;
  focusVisibleState: boolean;
  valueToString: (item: Item) => string;
  disabled?: boolean;
  listRef?: RefObject<HTMLDivElement>;
}

// biome-ignore lint/suspicious/noExplicitAny: Need to use any here as a wider type but it gets narrowed when using the useListControl hook.
export const ListControlContext = createContext<ListControlContextValue<any>>(
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
    valueToString: defaultValueToString,
    disabled: false,
    listRef: undefined,
  },
);

export function useListControlContext<Item>() {
  return useContext(ListControlContext) as ListControlContextValue<Item>;
}
