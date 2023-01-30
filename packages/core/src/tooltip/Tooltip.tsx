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
import { UseFloatingUIProps } from "../popper";
import { useTooltip, UseTooltipProps } from "./useTooltip";
import "./Tooltip.css";
import { makePrefixer, useForkRef } from "../utils";
import { Portal, PortalProps } from "../portal";
import { StatusIndicator, ValidationStatus } from "../status-indicator";

// Keep in order of preference. First items are used as default

const withBaseName = makePrefixer("saltTooltip");
const defaultIconProps = { size: 1, className: withBaseName("icon") };

export interface TooltipProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "text">,
    PortalProps,
    UseFloatingUIProps {
  children?: ReactElement<any, string | JSXElementConstructor<any>>;
  /**
   * Removes the tooltip arrow.
   */
  hideArrow?: boolean;
  /**
   * Whether to hide a state icon within the tooltip
   */
  hideIcon?: boolean;
  content?: string | ReactNode;
  /**
   * A string to determine the current status of the tooltip
   */
  status?: ValidationStatus;
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id?: string;
  enterDelay?: number;
  leaveDelay?: number;
  disabled?: boolean;
  disableHoverListener?: boolean;
  disableFocusListener?: boolean;
  arrowProps?: HTMLAttributes<HTMLDivElement>;
  triggerRef?: Ref<HTMLElement>;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      id,
      children,
      className: classNameProp,
      container,
      disabled,
      disablePortal = true,
      hideArrow,
      hideIcon,
      open: openProp,
      content,
      status = "info",
      triggerRef,
      ...rest
    } = props;

    const hookProps: UseTooltipProps = {
      open: openProp,
      ...rest,
    };

    const { arrowProps, open, getTriggerProps, getTooltipProps } =
      useTooltip(hookProps);

    const { ref: tooltipRef, ...restTooltipProps } = getTooltipProps();

    const { ref: triggerRefHook, ...restTrigger } = getTriggerProps();

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
              className={clsx(
                withBaseName(),
                withBaseName(status),
                classNameProp
              )}
              ref={tooltipRef as RefObject<HTMLDivElement>}
              {...restTooltipProps}
            >
              <div className={withBaseName("content")}>
                {!hideIcon && (
                  <StatusIndicator status={status} {...defaultIconProps} />
                )}
                <span className={withBaseName("body")}>{content}</span>
              </div>
              {!hideArrow && (
                <div className={withBaseName("arrow")} {...arrowProps} />
              )}
            </div>
          </Portal>
        )}

        {children &&
          cloneElement(children, { ref: triggerRefMerged, ...restTrigger })}
      </>
    );
  }
);
