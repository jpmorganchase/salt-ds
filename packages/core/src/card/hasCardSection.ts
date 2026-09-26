import { Children, isValidElement, type ReactNode } from "react";
import { CardContent } from "./CardContent";
import { CardFooter } from "./CardFooter";
import { CardHeader } from "./CardHeader";

const cardSectionTypes = [CardHeader, CardContent, CardFooter];

function isCardSection(child: ReactNode): boolean {
  if (!isValidElement(child)) {
    return false;
  }

  // Salt's render prop replaces a component's root without adding a wrapper.
  const render = (child.props as { render?: ReactNode }).render;
  const renderedChild = isValidElement(render) ? render : child;

  return cardSectionTypes.some(
    (sectionType) => renderedChild.type === sectionType,
  );
}

export function hasCardSection(children: ReactNode): boolean {
  return Children.toArray(children).some(isCardSection);
}
