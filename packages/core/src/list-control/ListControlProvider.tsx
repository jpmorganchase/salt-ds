import { type ReactNode, useMemo } from "react";
import {
  ListControlContext,
  type ListControlContextValue,
} from "./ListControlContext";
import {
  ListControlOptionContextProvider,
  type ListControlOptionContextValue,
} from "./ListControlOptionContext";
import type { ListControlOptionStore } from "./ListControlOptionStore";

type ListControlProviderValue<Item> = ListControlContextValue<Item> & {
  optionStateStore: ListControlOptionStore<Item>;
};

export function ListControlProvider<Item>({
  children,
  value,
}: {
  children: ReactNode;
  value: ListControlProviderValue<Item>;
}) {
  const { optionStateStore, ...publicValue } = value;
  const optionValue = useMemo<ListControlOptionContextValue<Item>>(
    () => ({
      disabled: value.disabled,
      listRef: value.listRef,
      multiselect: value.multiselect,
      optionStateStore,
      register: value.register,
      select: value.select,
      setActive: value.setActive,
      valueToString: value.valueToString,
    }),
    [
      optionStateStore,
      value.disabled,
      value.listRef,
      value.multiselect,
      value.register,
      value.select,
      value.setActive,
      value.valueToString,
    ],
  );

  return (
    <ListControlContext.Provider value={publicValue}>
      <ListControlOptionContextProvider value={optionValue}>
        {children}
      </ListControlOptionContextProvider>
    </ListControlContext.Provider>
  );
}
