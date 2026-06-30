import {
  Children,
  Fragment,
  isValidElement,
  type Key,
  type ReactElement,
  type ReactNode,
} from "react";
import type { BreadcrumbNextProps } from "../BreadcrumbNext";

export interface NormalizedBreadcrumb {
  element: ReactElement<BreadcrumbNextProps>;
  index: number;
  key: Key;
  props: BreadcrumbNextProps;
}

function isFragmentElement(
  child: ReactNode,
): child is ReactElement<{ children?: ReactNode }> {
  return (
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
  );
}

export function flattenBreadcrumbItems(children: ReactNode): ReactNode[] {
  const flattenedChildren: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isFragmentElement(child)) {
      flattenedChildren.push(...flattenBreadcrumbItems(child.props.children));
    } else if (
      child !== null &&
      child !== undefined &&
      typeof child !== "boolean"
    ) {
      flattenedChildren.push(child);
    }
  });

  return flattenedChildren;
}
