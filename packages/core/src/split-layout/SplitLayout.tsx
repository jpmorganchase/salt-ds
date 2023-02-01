import { ElementType, forwardRef, ReactElement, ReactNode } from "react";
import { FlexLayout, FlexLayoutProps } from "../flex-layout";
import { PolymorphicComponentPropWithRef, PolymorphicRef } from "../utils";
import { Breakpoints } from "../breakpoints";
import { useIsViewportLargerThanBreakpoint } from "@salt-ds/lab";

export type SplitLayoutProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
      /**
       * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
       */
      align?: FlexLayoutProps<ElementType>["align"];
      /**
       * Establishes the main-axis, defining the direction children are placed. Default is "row".
       */
      direction?: FlexLayoutProps<ElementType>["direction"];
      /**
       * End component to be rendered.
       */
      endItem?: ReactNode;
      /**
       * Controls the space between left and right items.
       */
      gap?: FlexLayoutProps<ElementType>["gap"];
      /**
       * Start component to be rendered.
       */
      startItem?: ReactNode;
      /**
       * Breakpoint at which the horizontal split wraps.
       */
      wrapAtBreakpoint?: keyof Breakpoints;
    }
  >;
type SplitLayoutComponent = <T extends ElementType = "div">(
  props: SplitLayoutProps<T>
) => ReactElement | null;

export const SplitLayout: SplitLayoutComponent = forwardRef(
  <T extends ElementType = "div">(
    {
      direction,
      endItem,
      startItem,
      wrapAtBreakpoint = "sm",
      ...rest
    }: SplitLayoutProps<T>,
    ref?: PolymorphicRef<T>
  ) => {
    const justify = endItem && !startItem ? "end" : "space-between";
    const wrapSplit = useIsViewportLargerThanBreakpoint(wrapAtBreakpoint);

    return (
      <FlexLayout
        ref={ref}
        justify={justify}
        direction={wrapSplit ? "column" : direction}
        {...rest}
      >
        {startItem}
        {endItem}
      </FlexLayout>
    );
  }
);
