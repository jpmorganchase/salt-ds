import { ReactNode } from "react";
import { BpType, ResponsiveProp } from "./types";

import { UseResponsiveValue } from "./useResponsiveValue";

type ResponsiveChildrenProps<BP extends BpType> = Omit<
  ResponsiveProp<ReactNode, BP>,
  "default"
> & {
  children: ReactNode;
};
/**
 * ResponsiveChildren is a component which allows you to change the rendered component based on the viewport E.g.:
 * <ResponsiveChildren
 *    md={<h1>Medium Viewport Child</h1>}
 * >
 *    <h1>Default Child</h1>
 * </ResponsiveChildren>`
 */
export const createResponsiveChildren = <BP extends BpType>(
  useResponsiveValue: UseResponsiveValue
) => {
  //
  const ResponsiveChildren = ({
    children: childrenProp,
    ...rest
  }: ResponsiveChildrenProps<BP>) => {
    const children = useResponsiveValue({
      ...rest,
      default: childrenProp,
    });

    return <>{children}</>;
  };

  return ResponsiveChildren;
};
