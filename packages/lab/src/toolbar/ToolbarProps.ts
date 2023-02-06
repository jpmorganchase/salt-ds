import { TooltipProps } from "../tooltip";
import { ComponentType, HTMLAttributes, ReactNode } from "react";

export type OrientationShape = "vertical" | "horizontal";

export interface ToolbarAlignmentProps {
  alignCenter?: true | undefined;
  alignEnd?: true | undefined;
  alignStart?: true | undefined;
}

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Used by custom elements to render a custom tooltip
   */
  TooltipComponent?: ComponentType<Partial<TooltipProps>>;
  /**
   * The content of the component.
   */
  children?: ReactNode;
  /**
   * Disable all toolbar items
   */
  disabled?: boolean;
  /**
   * The orientation of the component
   */
  orientation?: OrientationShape;
  /**
   * Overflow menu icon
   */
  overflowButtonIcon?: JSX.Element;
  /**
   * Text to display next to overflow menu icon
   */
  overflowButtonLabel?: string;

  /**
   * Placement of the Overflow, default is 'end'
   */
  overflowButtonPlacement?: "start" | "end";
  /**
   * If `true`, toolbar will adapt to the size of its container. It adds and removes toolbar buttons
   * from the overflow menu automatically as the size of the container changes.
   *
   * The default is `true`. Set it to `false` to revert back to non-responsive version.
   */
  responsive?: boolean;
}
