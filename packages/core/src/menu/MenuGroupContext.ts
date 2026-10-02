import { type SyntheticEvent, useContext } from "react";
import { createContext } from "../utils";
import type { MenuGroupProps } from "./MenuGroup";

type MenuGroupSelectionVariant = NonNullable<
  MenuGroupProps["selectionVariant"]
>;

export interface MenuGroupContextValue {
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
