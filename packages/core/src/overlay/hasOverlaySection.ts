import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { OverlayFooter } from "./OverlayFooter";
import { OverlayHeader } from "./OverlayHeader";
import { OverlayPanelContent } from "./OverlayPanelContent";

const overlaySectionTypes = [OverlayHeader, OverlayPanelContent, OverlayFooter];

export function hasOverlaySection(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (!isValidElement(child)) return false;

    if (child.type === Fragment) {
      return hasOverlaySection(
        (child.props as { children?: ReactNode }).children,
      );
    }

    return overlaySectionTypes.some(
      (sectionType) => child.type === sectionType,
    );
  });
}
