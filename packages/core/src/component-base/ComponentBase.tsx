import { clsx } from "clsx";
import type React from "react";
import { forwardRef } from "react";
import {
  type PolymorphicRef,
  type ResponsiveProp,
  resolveResponsiveValue,
  useBreakpoint,
} from "../index";

// Define a mapping from size and spacing to class names
const sizeClassMap = {
  small: "salt-size-small",
  medium: "salt-size-medium",
  large: "salt-size-large",
};
type Size = keyof typeof sizeClassMap;

const spacingClassMap = {
  small: "salt-spacing-small",
  medium: "salt-spacing-medium",
  large: "salt-spacing-large",
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
