import { ReactNode } from "react";
import { BpType, ResponsiveProp } from "./types";

import { UseResponsiveValue } from "./useResponsiveValue";

type ResponsiveChildrenProps<BP extends BpType> = Omit<
  ResponsiveProp<ReactNode, BP>,
  "default"
> & {
  children: ReactNode;
};

export const createResponsiveChildren = <BP extends BpType>(
  useResponsiveValue: UseResponsiveValue
) => {
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
