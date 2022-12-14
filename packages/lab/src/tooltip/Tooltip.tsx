import { IconProps } from "@salt-ds/icons";
import cn from "classnames";
import {
  ComponentProps,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  useCallback,
} from "react";
import { Portal, PortalProps } from "../portal";
import { makePrefixer, StatusIndicator } from "@salt-ds/core";
import { useWindow } from "../window";

import "./Tooltip.css";

// Keep in order of preference. First items are used as default

export type TooltipStatus = "error" | "info" | "success" | "warning";

const withBaseName = makePrefixer("saltTooltip");

// FIXME: Fix types
export interface TooltipRenderProp {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any; // typeof Icon;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getIconProps: any; // StateAndPropGetterFunction<IconProps>;
}

export interface TooltipProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    Pick<PortalProps, "disablePortal" | "container"> {
  arrowProps?: ComponentProps<"div">;
  /**
   * Removes the tooltip arrow.
   */
  hideArrow?: boolean;
  /**
   * Whether to hide a state icon within the tooltip
   */
  hideIcon?: boolean;
  /**
   * A callback function to render the tooltip content
   * @param {function} getIcon getter for the icon based on the state
   * @param {function} getIconProps getter for the icon properties
   */
  render?: (props: TooltipRenderProp) => ReactNode;
  /**
   * A string to determine the current status of the tooltip
   */
  status?: TooltipStatus;
  title?: string;
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id?: string;
  open?: boolean;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(
    {
      arrowProps,
      children,
      className: classNameProp,
      container,
      disablePortal,
      hideArrow,
      hideIcon,
      open,
      render,
      status = "info",
      title,
      ...rest
    },
    ref
  ) {
    const getIcon = useCallback(
      (iconProps: IconProps) => {
        if (hideIcon) {
          return null;
        }
        return status !== "info" ? (
          <StatusIndicator
            status={status}
            {...iconProps}
            className={withBaseName("icon")}
          />
        ) : null;
      },
      [status, hideIcon]
    );

    const Window = useWindow();

    if (!open) {
      return null;
    }

    return (
      <Portal disablePortal={disablePortal} container={container}>
        <Window
          className={cn(withBaseName(), withBaseName(status))}
          ref={ref}
          {...rest}
        >
          <div className={withBaseName("content")}>
            {render ? (
              render({
                Icon: (passedProps: IconProps) => getIcon(passedProps),
                getIconProps: () => ({
                  status,
                  className: withBaseName("icon"),
                }),
              })
            ) : (
              <>
                {getIcon({})}
                <span className={withBaseName("body")}>{title}</span>
              </>
            )}
          </div>
          {!hideArrow && (
            <div className={withBaseName("arrow")} {...arrowProps} />
          )}
        </Window>
      </Portal>
    );
  }
);
