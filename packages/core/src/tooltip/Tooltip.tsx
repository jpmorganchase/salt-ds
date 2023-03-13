import { clsx } from "clsx";
import {
  cloneElement,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  isValidElement,
  Fragment,
} from "react";
import { StatusIndicator, ValidationStatus } from "../status-indicator";
import { UseFloatingUIProps, makePrefixer, useForkRef } from "../utils";
import { useTooltip, UseTooltipProps } from "./useTooltip";
import "./Tooltip.css";
import { FloatingPortal } from "@floating-ui/react";

const withBaseName = makePrefixer("saltTooltip");

export interface TooltipProps
  extends HTMLAttributes<HTMLDivElement>,
    Pick<
      UseFloatingUIProps,
      "open" | "onOpenChange" | "placement" | "strategy"
    > {
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
   * A string to determine the current status of the tooltip. Defaults to 'info'.
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
  /**
   * Renders the tooltip using a portal at the root of the html body element
   */
  portal?: boolean;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      children,
      className,
      disabled,
      hideArrow = false,
      hideIcon = false,
      open: openProp,
      content,
      status = "info",
      placement = "right",
      enterDelay = 300,
      leaveDelay = 0,
      portal = false,
      ...rest
    } = props;

    const hookProps: UseTooltipProps = {
      open: openProp,
      placement,
      enterDelay,
      leaveDelay,
      ...rest,
    };

    const {
      arrowProps,
      open,
      floating,
      reference,
      getTriggerProps,
      getTooltipProps,
    } = useTooltip(hookProps);

    const triggerRef = useForkRef(
      // @ts-ignore
      isValidElement(children) ? children.ref : null,
      reference
    );

    const WrappingComponent = portal ? FloatingPortal : Fragment;

    return (
      <>
        {open && !disabled && (
          <WrappingComponent>
            <div
              className={clsx(withBaseName(), withBaseName(status), className)}
              ref={floating}
              {...getTooltipProps()}
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
          </WrappingComponent>
        )}

        {isValidElement(children) &&
          cloneElement(children, {
            ...getTriggerProps(),
            ref: triggerRef,
          })}
      </>
    );
  }
);
