import {
  createContext,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
  useContext,
} from "react";
import type { OptionValue } from "./ListControlContext";
import type { ListControlOptionStore } from "./ListControlOptionStore";

export interface ListControlOptionContextValue<Item> {
  disabled?: boolean;
  listRef?: RefObject<HTMLDivElement>;
  multiselect: boolean;
  optionStateStore: ListControlOptionStore<Item>;
  register: (
    optionValue: OptionValue<Item>,
    element: HTMLElement,
  ) => () => void;
  select: (event: SyntheticEvent, option: OptionValue<Item>) => void;
  setActive: (option: OptionValue<Item>) => void;
  valueToString: (item: Item) => string;
}

const ListControlOptionContext = createContext<
  ListControlOptionContextValue<unknown> | undefined
>(undefined);

export function ListControlOptionContextProvider<Item>({
  children,
  value,
}: {
  children: ReactNode;
  value: ListControlOptionContextValue<Item>;
}) {
  return (
    <ListControlOptionContext.Provider
      value={value as unknown as ListControlOptionContextValue<unknown>}
    >
      {children}
    </ListControlOptionContext.Provider>
  );
}

export function useListControlOptionContext<Item>() {
  const context = useContext(ListControlOptionContext);
  if (context === undefined) {
    throw new Error(
      "useListControlOptionContext must be used within a ListControlProvider",
    );
  }
  return context as unknown as ListControlOptionContextValue<Item>;
}
