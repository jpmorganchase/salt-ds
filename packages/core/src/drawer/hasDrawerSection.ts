import { Children, isValidElement, type ReactNode } from "react";
import { DrawerContent } from "./DrawerContent";
import { DrawerFooter } from "./DrawerFooter";
import { DrawerHeader } from "./DrawerHeader";

const drawerSectionTypes = [DrawerHeader, DrawerContent, DrawerFooter];

export function hasDrawerSection(children: ReactNode): boolean {
  return Children.toArray(children).some(
    (child) =>
      isValidElement(child) &&
      drawerSectionTypes.some((sectionType) => child.type === sectionType),
  );
}
