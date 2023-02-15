import {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  forwardRef,
} from "react";

import { ResponsiveProps, BpType } from "./types";

import { UseResponsiveProps } from "./useResponsiveProps";

/**
 * makeResponsive is a higher-order component which will enable all the props of a provided Component to take responsive values.
 * E.g. `const ResponsiveComponent = makeResponsive(Component)`
 */
export const createMakeResponsive = <BP extends BpType>(
  useResponsiveProps: UseResponsiveProps
) => {
  const makeResponsive = <T extends ElementType>(Component: T) => {
    const Wrapped = forwardRef(
      (
        responsiveProps: ResponsiveProps<ComponentPropsWithoutRef<T>, BP>,
        ref: ComponentPropsWithRef<T>["ref"]
      ) => {
        const props = useResponsiveProps(responsiveProps);

        const combined = {
          ...props,
          ref,
        } as ComponentPropsWithRef<T>;

        return <Component {...combined} />;
      }
    );

    return Wrapped;
  };

  return makeResponsive;
};
