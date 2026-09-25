import {
  type SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { createContext } from "../utils";
import type { MenuGroupProps } from "./MenuGroup";

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
  extends Pick<MenuGroupProps, "onSelectionChange" | "selected"> {
  selectionVariant: MenuGroupSelectionVariant;
}

const noSelection: string[] = [];

export function useMenuGroupSelection({
  onSelectionChange,
  selected: selectedProp,
  selectionVariant,
}: UseMenuGroupSelectionProps) {
  const missingSelected =
    selectionVariant !== "none" && selectedProp === undefined;

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (missingSelected) {
        console.warn(
          "Salt: MenuGroup requires `selected` when `selectionVariant` is set. Uncontrolled selection isn't supported, so no menu items will appear selected.",
        );
      }
    }
  }, [missingSelected]);

  const selected = useMemo(() => {
    if (selectedProp === undefined) {
      return noSelection;
    }
    return selectionVariant === "single"
      ? selectedProp.slice(0, 1)
      : selectedProp;
  }, [selectedProp, selectionVariant]);

  const isSelected = useCallback(
    (value: string) => selected.includes(value),
    [selected],
  );

  const select = useCallback(
    (event: SyntheticEvent, value: string) => {
      if (selectionVariant === "single") {
        if (!selected.includes(value)) {
          onSelectionChange?.(event, [value]);
        }
      } else if (selectionVariant === "multiple") {
        const newSelected = selected.includes(value)
          ? selected.filter((item) => item !== value)
          : selected.concat(value);
        onSelectionChange?.(event, newSelected);
      }
    },
    [onSelectionChange, selected, selectionVariant],
  );

  return { isSelected, select };
}
