import { isValidElement, type ReactNode } from "react";

export function getRefFromChildren(child: ReactNode) {
  if (!child || !isValidElement(child)) {
    return null;
  }

  return Object.prototype.propertyIsEnumerable.call(child.props, "ref")
    ? child.props.ref
    : // @ts-expect-error - ref is not defined on ReactNode
      child.ref;
}
