import { clsx } from "clsx";
import {
  cloneElement,
  forwardRef,
  HTMLAttributes,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  Ref,
  RefObject,
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
  extends Omit<HTMLAttributes<HTMLDivElement>, "text">,
    PortalProps,
    Pick<UseFloatingUIProps, "open" | "onOpenChange" | "placement"> {
  children?: ReactElement<any, string | JSXElementConstructor<any>>;
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
  content: string | ReactNode;
  /**
   * A string to determine the current status of the tooltip
   */
  status?: ValidationStatus;
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id?: string;
  /**
   * Delay in miliseconds before the tooltip is shown
   */
  enterDelay?: number;
  /**
   * Delay in miliseconds before the tooltip is hidden
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
  // arrowProps?: HTMLAttributes<HTMLDivElement>;
  triggerRef?: Ref<HTMLElement>;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      id,
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
      triggerRef,
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

    const { arrowProps, open, getTriggerProps, getTooltipProps } =
      useTooltip(hookProps);

    const { ref: tooltipRef, ...restTooltipProps } = getTooltipProps();

    const { ref: triggerRefHook, ...restTriggerProps } = getTriggerProps();

    const triggerRefMerged = useForkRef(
      triggerRef,
      triggerRefHook as Ref<HTMLElement>
    );

    return (
      <>
        {open && !disabled && (
          <Portal
            disablePortal={disablePortal}
            container={container}
            ref={ref}
            id={id}
          >
            <div
              className={clsx(withBaseName(), withBaseName(status), className)}
              ref={tooltipRef as RefObject<HTMLDivElement>}
              {...restTooltipProps}
            >
              <div className={withBaseName("inner")}>
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

        {children &&
          cloneElement(children, {
            ref: triggerRefMerged,
            ...restTriggerProps,
          })}
      </>
    );
  }
);
