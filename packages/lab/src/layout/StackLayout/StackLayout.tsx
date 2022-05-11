import {forwardRef} from "react";
import {FlexLayout} from "../FlexLayout";
import {FlexLayoutProps} from "../types";


export interface StackLayoutProps {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  align?: FlexLayoutProps['align'];
  /**
   * Controls the space between items.
   */
  gap?: FlexLayoutProps['gap'];
  /**
   * Adds a separator between elements.
   */
  separators?: FlexLayoutProps['separators'];
}

export const StackLayout = forwardRef<HTMLDivElement, StackLayoutProps>(
  function StackLayout({children, ...rest}, ref) {
    return (
      <FlexLayout direction="column" wrap={false} ref={ref} {...rest}>
        {children}
      </FlexLayout>
    );
  }
);
