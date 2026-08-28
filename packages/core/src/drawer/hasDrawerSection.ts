import { Children, isValidElement, type ReactNode } from "react";
import { DrawerActions } from "./DrawerActions";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

const drawerSectionTypes = [DrawerHeader, DrawerContent, DrawerActions];

export function hasDrawerSection(children: ReactNode): boolean {
  return Children.toArray(children).some(
    (child) =>
      isValidElement(child) &&
      drawerSectionTypes.some((sectionType) => child.type === sectionType),
  );
}
