import { forwardRef, HTMLAttributes } from "react";
import { FlexLayout, FlexLayoutProps } from "../FlexLayout";

export interface FlowLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line, default is "stretch".
   */
  align?: FlexLayoutProps["align"];
  /**
   * Controls the space between items, default is 3.
   */
  gap?: FlexLayoutProps["gap"];
  /**
   * Defines the alignment along the main axis, default is "start"
   */
  justify?: FlexLayoutProps["justify"];
}
export const FlowLayout = forwardRef<HTMLDivElement, FlowLayoutProps>(
  function FlowLayout({ ...rest }, ref) {
    return <FlexLayout direction="row" ref={ref} wrap {...rest} />;
  }
);
