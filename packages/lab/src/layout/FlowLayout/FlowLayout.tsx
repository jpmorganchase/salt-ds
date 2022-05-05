import { forwardRef } from "react";
import { FlexAlignment, FlexContentAlignment, FlexLayout } from "../FlexLayout";
import { ResponsiveProp } from "../../utils";
import { LayoutSeparator } from "../types";

export interface FlowLayoutProps {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  align?: FlexAlignment | "stretch" | "baseline";
  /**
   * Controls the space between items.
   */
  gap?: ResponsiveProp<number>;
  /**
   * Defines the alignment along the main axis.
   */
  justify?: FlexContentAlignment;
  /**
   * Adds a separator between elements.
   */
  separators?: LayoutSeparator | true;
  /**
   * Allow the items to wrap as needed.
   */
  wrap?: ResponsiveProp<boolean>;
}

export const FlowLayout = forwardRef<HTMLDivElement, FlowLayoutProps>(
  function FlowLayout({ children, wrap = true, ...rest }, ref) {
    return (
      <FlexLayout direction="row" ref={ref} {...rest}>
        {children}
      </FlexLayout>
    );
  }
);
