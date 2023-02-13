import { clsx } from "clsx";
import {
  cloneElement,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  Ref,
  isValidElement,
} from "react";
import {
  makePrefixer,
  useForkRef,
  StatusIndicator,
  ValidationStatus,
} from "@salt-ds/core";
import { UseFloatingUIProps } from "../popper";
import { Portal, PortalProps } from "../portal";
import { useTooltip, UseTooltipProps } from "./useTooltip";
import "./Tooltip.css";

const withBaseName = makePrefixer("saltTooltip");

export interface TooltipProps
  extends HTMLAttributes<HTMLDivElement>,
    PortalProps,
    Pick<UseFloatingUIProps, "open" | "onOpenChange" | "placement"> {
  /**
   * The children will be the tooltip's trigger.
   */
  children: ReactNode;
  /**
   * Whether to hide the tooltip arrow. Defaults to `false`.
   */
  hideArrow?: boolean;
  /**
   * Whether to hide the state icon within the tooltip. Defaults to `false`.
   */
  hideIcon?: boolean;
  /**
   * Content displayed inside the tooltip. Can be a string or a React component.
   */
  content: ReactNode;
  /**
   * A string to determine the current status of the tooltip
   */
  status?: ValidationStatus;
  /**
   * Delay in milliseconds before the tooltip is shown
   */
  enterDelay?: number;
  /**
   * Delay in milliseconds before the tooltip is hidden
   */
  leaveDelay?: number;
  /**
   * Option to not display the tooltip. Can be used in conditional situations like text truncation.
   */
  disabled?: boolean;
  /**
   * Option to remove the hover listener
   */
  disableHoverListener?: boolean;
  /**
   * Option to remove the focus listener
   */
  disableFocusListener?: boolean;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      children,
      className,
      container,
      disabled,
      disablePortal,
      hideArrow = false,
      hideIcon = false,
      open: openProp,
      content,
      status = "info",
      placement = "right",
      enterDelay = 300,
      leaveDelay = 0,
      ...rest
    } = props;

    const hookProps: UseTooltipProps = {
      open: openProp,
      placement,
      enterDelay,
      leaveDelay,
      ...rest,
    };

    const { arrowProps, open, triggerRef, getTriggerProps, getTooltipProps } =
      useTooltip(hookProps);

    const { ref: tooltipRef, ...restTooltipProps } = getTooltipProps();

    const triggerRefMerged = useForkRef(
      // @ts-ignore
      isValidElement(children) ? children.ref : null,
      triggerRef
    );

    return (
      <>
        {open && !disabled && (
          <Portal disablePortal={disablePortal} container={container} ref={ref}>
            <div
              className={clsx(withBaseName(), withBaseName(status), className)}
              ref={tooltipRef}
              {...restTooltipProps}
            >
              <div className={withBaseName("container")}>
                {!hideIcon && (
                  <StatusIndicator
                    status={status}
                    size={1}
                    className={withBaseName("icon")}
                  />
                )}
                <span className={withBaseName("content")}>{content}</span>
              </div>
              {!hideArrow && (
                <div className={withBaseName("arrow")} {...arrowProps} />
              )}
            </div>
          </Portal>
        )}

        {isValidElement(children) &&
          cloneElement(children, {
            ref: triggerRefMerged,
            ...getTriggerProps(),
          })}
      </>
    );
  }
);
