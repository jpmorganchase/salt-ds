import { forwardRef, HTMLAttributes } from "react";
import { FlexLayout } from "../FlexLayout";
import { FlexLayoutPropsWithoutRef } from "../types";

export interface FlowLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  align?: FlexLayoutPropsWithoutRef["align"];
  /**
   * Controls the space between items.
   */
  gap?: FlexLayoutPropsWithoutRef["gap"];
  /**
   * Defines the alignment along the main axis.
   */
  justify?: FlexLayoutPropsWithoutRef["justify"];
  /**
   * Adds a separator between elements.
   */
  separators?: FlexLayoutPropsWithoutRef["separators"];
}
export const FlowLayout = forwardRef<HTMLDivElement, FlowLayoutProps>(
  function FlowLayout({ ...rest }, ref) {
    return <FlexLayout direction="row" ref={ref} wrap={true} {...rest} />;
  }
);
