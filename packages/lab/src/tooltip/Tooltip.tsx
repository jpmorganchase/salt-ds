import { StatusIndicator, ValidationStatus, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  forwardRef,
  HTMLAttributes,
  ReactNode,
  ReactElement,
  JSXElementConstructor,
  cloneElement,
  RefObject,
} from "react";
import { Portal, PortalProps } from "../portal";
import { UseFloatingUIProps } from "../popper";
import { Window } from "../window";
import { useTooltip, UseTooltipProps } from "./useTooltip";
import "./Tooltip.css";

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
      ...rest
    } = props;

    const hookProps: UseTooltipProps = {
      open: openProp,
      ...rest,
    };

    const { arrowProps, open, getTriggerProps, getTooltipProps } =
      useTooltip(hookProps);

    const { ref: tooltipRef, ...restTooltipProps } = getTooltipProps();

    return (
      <>
        {open && !disabled && (
          <Portal
            disablePortal={disablePortal}
            container={container}
            ref={ref}
            id={id}
          >
            <Window
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
            </Window>
          </Portal>
        )}

        {children && cloneElement(children, { ...getTriggerProps() })}
      </>
    );
  }
);
