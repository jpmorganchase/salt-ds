import { isValidElement, ReactNode } from "react";

export function getRefFromChildren(child: ReactNode) {
  if (!child || !isValidElement(child)) {
    return null;
  }

  // @ts-expect-error - ref is not defined on ReactNode
  return child.props.propertyIsEnumerable("ref") ? child.props.ref : child.ref;
}
