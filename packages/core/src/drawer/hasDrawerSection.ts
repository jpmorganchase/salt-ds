import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { DrawerActions } from "./DrawerActions";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

const drawerSectionTypes = [DrawerHeader, DrawerContent, DrawerActions];

export function hasDrawerSection(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (!isValidElement(child)) return false;

    if (child.type === Fragment) {
      return hasDrawerSection(
        (child.props as { children?: ReactNode }).children,
      );
    }

    return drawerSectionTypes.some((sectionType) => child.type === sectionType);
  });
}
