import React, { forwardRef } from "react";
import { clsx } from "clsx";
import {
  PolymorphicRef,
  useBreakpoint,
  resolveResponsiveValue,
  ResponsiveProp,
} from "../index";

// Define a mapping from size and spacing to class names
const sizeClassMap = {
  small: "salt-customizable-size-small",
  medium: "salt-customizable-size-medium",
  large: "salt-customizable-size-large",
};
type Size = keyof typeof sizeClassMap;

const spacingClassMap = {
  small: "salt-customizable-spacing-small",
  medium: "salt-customizable-spacing-medium",
  large: "salt-customizable-spacing-large",
};
type Spacing = keyof typeof spacingClassMap;

export interface ComponentBaseProps<E extends React.ElementType = "div"> {
  as?: E;
  size?: ResponsiveProp<Size>;
  spacing?: ResponsiveProp<Spacing>;
  className?: string;
  children?: React.ReactNode;
}

export const ComponentBase = forwardRef(
  <E extends React.ElementType = "div">(
    {
      as,
      size,
      spacing,
      className,
      children,
      ...restProps
    }: ComponentBaseProps<E> &
      Omit<React.ComponentPropsWithoutRef<E>, keyof ComponentBaseProps<E>>,
    ref?: PolymorphicRef<E>,
  ) => {
    const Component: React.ElementType = as || "div";
    const { matchedBreakpoints } = useBreakpoint();
    const resolvedSize = size
      ? resolveResponsiveValue(size, matchedBreakpoints)
      : undefined;
    const resolvedSpacing = spacing
      ? resolveResponsiveValue(spacing, matchedBreakpoints)
      : undefined;
    const sizeClass = resolvedSize ? sizeClassMap[resolvedSize] : undefined;
    const spacingClass = resolvedSpacing
      ? spacingClassMap[resolvedSpacing]
      : undefined;

    return (
      <Component
        ref={ref}
        className={clsx([sizeClass, spacingClass, className])}
        {...restProps}
      >
        {children}
      </Component>
    );
  },
);
