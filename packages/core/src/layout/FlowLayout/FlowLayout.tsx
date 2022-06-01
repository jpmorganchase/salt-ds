import { forwardRef, HTMLAttributes } from "react";
import { FlexLayout } from "@jpmorganchase/uitk-core";
import { FlexLayoutProps } from "../types";

export interface FlowLayoutProps extends HTMLAttributes<HTMLDivElement> {
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
}
export const FlowLayout = forwardRef<HTMLDivElement, FlowLayoutProps>(
  function FlowLayout({ ...rest }, ref) {
    return <FlexLayout direction="row" ref={ref} wrap={true} {...rest} />;
  }
);
