import { Children, isValidElement, type ReactNode } from "react";
import { CardContent } from "./CardContent";
import { CardFooter } from "./CardFooter";
import { CardHeader } from "./CardHeader";

const cardSectionTypes = [CardHeader, CardContent, CardFooter];

export function hasCardSection(children: ReactNode): boolean {
  return Children.toArray(children).some(
    (child) =>
      isValidElement(child) &&
      cardSectionTypes.some((sectionType) => child.type === sectionType),
  );
}
