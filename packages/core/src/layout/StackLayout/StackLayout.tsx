import { forwardRef, HTMLAttributes } from "react";
import { FlexLayout } from "../FlexLayout";
import { FlexLayoutPropsWithoutRef } from "../types";

export interface StackLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  align?: FlexLayoutPropsWithoutRef["align"];
  /**
   * Controls the space between items.
   */
  gap?: FlexLayoutPropsWithoutRef["gap"];
  /**
   * Adds a separator between elements.
   */
  separators?: FlexLayoutPropsWithoutRef["separators"];
}

export const StackLayout = forwardRef<HTMLDivElement, StackLayoutProps>(
  function StackLayout({ children, ...rest }, ref) {
    return (
      <FlexLayout direction="column" wrap={false} ref={ref} {...rest}>
        {children}
      </FlexLayout>
    );
  }
);
