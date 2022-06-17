import { TooltipProps } from "@jpmorganchase/uitk-core";
import { FC, HTMLAttributes, ReactNode, Ref } from "react";
import { OverflowButtonProps, OverflowPanelProps } from "../responsive";

export type OrientationShape = "vertical" | "horizontal";

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  OverflowButtonProps?: Partial<OverflowButtonProps>;
  OverflowPanelProps?: Partial<OverflowPanelProps>;
  /**
   * Used by custom elements to render a custom tooltip
   */
  TooltipComponent?: FC<Partial<TooltipProps>>;
  /**
   * The content of the component.
   */
  children?: ReactNode;
  /**
   * Disable all toolbar items
   */
  disabled?: boolean;
  /**
   * TODO
   * Callback for when the number of visible items changes
   */
  onHiddenItemsChange?: Function;
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
   * Use this to access overflow button element
   */
  overflowButtonRef?: Ref<HTMLDivElement>;
  /**
   * If `true`, toolbar will adapt to the size of its container. It adds and removes toolbar buttons
   * from the overflow menu automatically as the size of the container changes.
   *
   * The default is `true`. Set it to `false` to revert back to non-responsive version.
   */
  responsive?: boolean;

  wrapChildrenWithFormFields?: boolean;
}
