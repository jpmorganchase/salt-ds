import { forwardRef } from "react";
import { FlexLayout } from "../FlexLayout";
import { FlexLayoutProps } from "../types";

export interface FlowLayoutProps {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  align?: FlexLayoutProps["align"];
  /**
   * Controls the space between items.
   */
  gap?: FlexLayoutProps["gap"];
  /**
   * Defines the alignment along the main axis.
   */
  justify?: FlexLayoutProps["justify"];
  /**
   * Adds a separator between elements.
   */
  separators?: FlexLayoutProps["separators"];
  /**
   * Allow the items to wrap as needed, default is true.
   */
  wrap?: FlexLayoutProps["wrap"];
}

export const FlowLayout = forwardRef<HTMLDivElement, FlowLayoutProps>(
  function FlowLayout({ children, wrap = true, ...rest }, ref) {
    return (
      <FlexLayout direction="row" ref={ref} wrap={wrap} {...rest}>
        {children}
      </FlexLayout>
    );
  }
);
