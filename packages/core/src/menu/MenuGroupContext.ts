import {
  type SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createContext, useControlled } from "../utils";
import type { MenuGroupProps } from "./MenuGroup";
import { useMenuSelectionStore } from "./MenuSelectionStoreContext";

type MenuGroupSelectionVariant = NonNullable<
  MenuGroupProps["selectionVariant"]
>;

export interface MenuGroupContextValue
  extends Pick<MenuGroupProps, "closeOnSelect"> {
  isSelected: (value: string) => boolean;
  select: (event: SyntheticEvent, value: string) => void;
  selectionVariant: MenuGroupSelectionVariant;
}

export const defaultMenuGroupContextValue: MenuGroupContextValue = {
  isSelected: () => false,
  select: () => undefined,
  selectionVariant: "none",
};

export const MenuGroupContext = createContext<MenuGroupContextValue>(
  "MenuGroupContext",
  defaultMenuGroupContextValue,
);

export function useMenuGroup() {
  return useContext(MenuGroupContext);
}

export interface UseMenuGroupSelectionProps
  extends Pick<
    MenuGroupProps,
    "defaultSelected" | "name" | "onSelectionChange" | "selected"
  > {
  selectionVariant: MenuGroupSelectionVariant;
}

const noSelection: string[] = [];

let missingNameWarningShown = false;

export function useMenuGroupSelection({
  defaultSelected,
  name,
  onSelectionChange,
  selected: selectedProp,
  selectionVariant,
}: UseMenuGroupSelectionProps) {
  const store = useMenuSelectionStore();
  const [storedSelected] = useState(() =>
    name === undefined ? undefined : store?.getSelected(name),
  );
  const [selectedState, setSelectedState, isControlled] = useControlled({
    controlled: selectedProp,
    default: storedSelected ?? defaultSelected ?? noSelection,
    name: "MenuGroup",
    state: "selected",
  });
  const missingName =
    selectionVariant !== "none" && !isControlled && name === undefined;

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (missingName && !missingNameWarningShown) {
        missingNameWarningShown = true;
        console.warn(
          "Salt: MenuGroup requires a `name` to keep an uncontrolled selection while the menu is closed. Without one, the selection resets each time the menu closes. Pass `name`, or control the selection with `selected` and `onSelectionChange`.",
        );
      }
    }
  }, [missingName]);

  const selected = useMemo(
    () =>
      selectionVariant === "single" ? selectedState.slice(0, 1) : selectedState,
    [selectedState, selectionVariant],
  );

  const isSelected = useCallback(
    (value: string) => selected.includes(value),
    [selected],
  );

  const select = useCallback(
    (event: SyntheticEvent, value: string) => {
      let newSelected: string[];
      if (selectionVariant === "single") {
        if (selected.includes(value)) {
          return;
        }
        newSelected = [value];
      } else if (selectionVariant === "multiple") {
        newSelected = selected.includes(value)
          ? selected.filter((item) => item !== value)
          : selected.concat(value);
      } else {
        return;
      }

      setSelectedState(newSelected);
      if (!isControlled && name !== undefined) {
        store?.setSelected(name, newSelected);
      }
      onSelectionChange?.(event, newSelected);
    },
    [isControlled, name, onSelectionChange, selected, selectionVariant, store],
  );

  return { isSelected, select };
}
