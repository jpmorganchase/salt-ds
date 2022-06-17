import { IconProps } from "@jpmorganchase/uitk-icons";
import cn from "classnames";
import {
  ComponentProps,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  useCallback,
} from "react";
import { Portal, PortalProps } from "../portal";
import { makePrefixer } from "../utils/makePrefixer";
import { useWindow } from "../window";
import { getIconForState } from "./getIconForState";

import "./Tooltip.css";

// Keep in order of preference. First items are used as default

export type TooltipState = "error" | "info" | "success" | "warning";

const withBaseName = makePrefixer("uitkTooltip");
const defaultIconProps = { size: 12, className: withBaseName("icon") };

// TODO: Fix types
export interface TooltipRenderProp {
  Icon: any; // typeof Icon;
  getIconProps: any; // StateAndPropGetterFunction<IconProps>;
}

export interface TooltipProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children">,
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
   * A string to determine the current state of the tooltip
   */
  state?: TooltipState;
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
      state = "info",
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
        const StateIcon = getIconForState(state);
        return StateIcon ? (
          <StateIcon {...iconProps} {...defaultIconProps} />
        ) : null;
      },
      [state, hideIcon]
    );

    const Window = useWindow();

    if (!open) {
      return null;
    }

    return (
      <Portal disablePortal={disablePortal} container={container}>
        <Window
          className={cn(withBaseName(), withBaseName(state))}
          ref={ref}
          {...rest}
        >
          <div className={withBaseName("content")}>
            {render ? (
              render({
                Icon: (passedProps: IconProps) => getIcon(passedProps),
                getIconProps: () => defaultIconProps,
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
