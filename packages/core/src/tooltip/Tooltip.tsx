import { clsx } from "clsx";
import {
  cloneElement,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  isValidElement,
  Fragment,
} from "react";
import { FloatingArrow } from "@floating-ui/react";
import { Portal, PortalProps } from "../portal";
import { StatusIndicator, ValidationStatus } from "../status-indicator";
import { UseFloatingUIProps, makePrefixer, useForkRef } from "../utils";
import { useTooltip, UseTooltipProps } from "./useTooltip";
import "./Tooltip.css";

const withBaseName = makePrefixer("saltTooltip");

export interface TooltipProps
  extends HTMLAttributes<HTMLDivElement>,
    PortalProps,
    Pick<UseFloatingUIProps, "open" | "onOpenChange" | "placement"> {
  /**
   * The children will be the Tooltip's trigger.
   */
  children: ReactNode;
  /**
   * Whether to hide the Tooltip arrow. Defaults to `false`.
   */
  hideArrow?: boolean;
  /**
   * Whether to hide the status icon within the Tooltip. Defaults to `false`.
   */
  hideIcon?: boolean;
  /**
   * Content displayed inside the Tooltip. Can be a string or a React component.
   */
  content: ReactNode;
  /**
   * A string to determine the status of the Tooltip. Defaults to `info`.
   */
  status?: ValidationStatus;
  /**
   * Delay in milliseconds before the Tooltip is shown.
   */
  enterDelay?: number;
  /**
   * Delay in milliseconds before the Tooltip is hidden.
   */
  leaveDelay?: number;
  /**
   * Option to not display the Tooltip. Can be used in conditional situations like text truncation.
   */
  disabled?: boolean;
  /**
   * Option to remove the hover listener.
   */
  disableHoverListener?: boolean;
  /**
   * Option to remove the focus listener.
   */
  disableFocusListener?: boolean;
  disablePortal?: boolean;
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
      disablePortal,
      container,
      preserveTabOrder,
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

    return (
      <>
        {isValidElement(children) &&
          cloneElement(children, {
            ...getTriggerProps(),
            ref: triggerRef,
          })}

        {open && !disabled && (
          <Portal
            disablePortal={disablePortal}
            container={container}
            preserveTabOrder={preserveTabOrder}
          >
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
                <FloatingArrow
                  {...arrowProps}
                  className={withBaseName("arrow")}
                  strokeWidth={2}
                  fill="var(--salt-container-primary-background)"
                  stroke="var(--tooltip-status-borderColor)"
                  height={5}
                  width={10}
                />
              )}
            </div>
          </Portal>
        )}
      </>
    );
  }
);
