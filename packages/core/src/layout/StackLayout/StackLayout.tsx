import { ElementType, forwardRef } from "react";
import { FlexLayout, FlexLayoutProps } from "../FlexLayout";

export interface StackLayoutProps extends FlexLayoutProps<ElementType> {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line, default is "stretch".
   */
  align?: FlexLayoutProps<ElementType>["align"];
  /**
   * Controls the space between items, default is 3.
   */
  gap?: FlexLayoutProps<ElementType>["gap"];
  /**
   * Adds a separator between elements, default is false.
   */
  separators?: FlexLayoutProps<ElementType>["separators"];
}

export const StackLayout = forwardRef<HTMLDivElement, StackLayoutProps>(
  function StackLayout(props, ref) {
    return <FlexLayout direction="column" ref={ref} {...props} />;
  }
);
