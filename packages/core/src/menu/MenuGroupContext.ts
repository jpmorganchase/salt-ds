import { type SyntheticEvent, useContext } from "react";
import { createContext } from "../utils";
import type { MenuGroupProps } from "./MenuGroup";

export interface MenuGroupContextValue {
  isSelected: (value: string) => boolean;
  select: (event: SyntheticEvent, value: string) => void;
  selectionVariant?: MenuGroupProps["selectionVariant"];
}

export const defaultMenuGroupContextValue: MenuGroupContextValue = {
  isSelected: () => false,
  select: () => undefined,
};

export const MenuGroupContext = createContext<MenuGroupContextValue>(
  "MenuGroupContext",
  defaultMenuGroupContextValue,
);

export function useMenuGroup() {
  return useContext(MenuGroupContext);
}
