import {
  type SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { createContext } from "../utils";
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

export function useMenuGroupSelection({
  defaultSelected,
  name,
  onSelectionChange,
  selected: selectedProp,
  selectionVariant,
}: UseMenuGroupSelectionProps) {
  const store = useMenuSelectionStore();
  const controlled = selectedProp !== undefined;
  const { current: initiallyControlled } = useRef(controlled);
  const missingName =
    selectionVariant !== "none" && !controlled && name === undefined;

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (missingName) {
        console.warn(
          "Salt: MenuGroup requires a `name` to keep an uncontrolled selection while the menu is closed. Pass `name` with `defaultSelected`, or control the selection with `selected` and `onSelectionChange`.",
        );
      }
    }
  }, [missingName]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (initiallyControlled !== controlled) {
        console.error(
          [
            `Salt: A component is changing the ${
              initiallyControlled ? "" : "un"
            }controlled selected state of MenuGroup to be ${
              initiallyControlled ? "un" : ""
            }controlled.`,
            "Elements should not switch from uncontrolled to controlled (or vice versa).",
            "Decide between using a controlled or uncontrolled MenuGroup element for the lifetime of the component.",
            "The nature of the state is determined during the first render, it's considered controlled if `selected` is not `undefined`.",
          ].join("\n"),
        );
      }
    }
  }, [initiallyControlled, controlled]);

  const storedSelected =
    name === undefined ? undefined : store?.getSelected(name);
  const currentSelected = selectedProp ?? storedSelected ?? defaultSelected;

  const selected = useMemo(() => {
    if (currentSelected === undefined) {
      return noSelection;
    }
    return selectionVariant === "single"
      ? currentSelected.slice(0, 1)
      : currentSelected;
  }, [currentSelected, selectionVariant]);

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

      if (!controlled && name !== undefined) {
        store?.setSelected(name, newSelected);
      }
      onSelectionChange?.(event, newSelected);
    },
    [controlled, name, onSelectionChange, selected, selectionVariant, store],
  );

  return { isSelected, select };
}
