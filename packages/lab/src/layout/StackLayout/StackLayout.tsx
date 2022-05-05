import { forwardRef } from "react";
import { FlexAlignment, FlexLayout } from "../FlexLayout";
import { ResponsiveProp } from "../../utils";
import { LayoutSeparator } from "../types";

export interface StackLayoutProps {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  align?: FlexAlignment | "stretch" | "baseline";
  /**
   * Controls the space between items.
   */
  gap?: ResponsiveProp<number>;
  /**
   * Adds a separator between elements.
   */
  separators?: LayoutSeparator | true;
}

export const StackLayout = forwardRef<HTMLDivElement, StackLayoutProps>(
  function StackLayout({ children, ...rest }, ref) {
    return (
      <FlexLayout direction="column" wrap="false" ref={ref} {...rest}>
        {children}
      </FlexLayout>
    );
  }
);
