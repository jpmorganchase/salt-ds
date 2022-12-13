import { Icon, IconProps } from "@jpmorganchase/uitk-icons";
import cn from "classnames";
import {
  ComponentProps,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  ReactElement,
  JSXElementConstructor,
  useCallback,
  cloneElement,
} from "react";
import { Placement } from "@floating-ui/react-dom-interactions";
import { Portal, PortalProps } from "../portal";
// import { StatusIcon, ValidationStatus } from "../status-icon";
import { makePrefixer } from "../utils";
import { useWindow } from "../window";
import { StatusIndicator, ValidationStatus } from "../status-indicator";
import { useTooltip } from "./useTooltip";

import "./Tooltip.css";

// Keep in order of preference. First items are used as default

const withBaseName = makePrefixer("uitkTooltip");

// FIXME: Fix types
interface TooltipRenderProp {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any; // typeof Icon;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getIconProps?: any; // StateAndPropGetterFunction<IconProps>;
}

export interface TooltipProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    Pick<PortalProps, "disablePortal" | "container"> {
  children?: ReactElement<any, string | JSXElementConstructor<any>>;
  placement?: Placement;
  arrowProps?: ComponentProps<"div">;
  disabled?: boolean;
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
  status?: ValidationStatus;
  text?: string;
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id?: string;
  open?: boolean;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const { arrowProps, getTriggerProps, getTooltipProps } = useTooltip(props);

    const {
      children,
      className: classNameProp,
      container,
      disablePortal,
      hideArrow,
      hideIcon,
      status = "info",
      text,
      render,
      ...rest
    } = props;

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

    const tooltipProps = getTooltipProps(props);
    const { open } = tooltipProps;

    return (
      <>
        {open && (
          <Portal disablePortal={disablePortal} container={container}>
            <Window
              className={cn(
                withBaseName(),
                withBaseName(status),
                classNameProp
              )}
              {...tooltipProps}
            >
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
                  <span className={withBaseName("body")}>{text}</span>
                </>
              )}
              {!hideArrow && (
                <div className={withBaseName("arrow")} {...arrowProps} />
              )}
            </Window>
          </Portal>
        )}

        {children && cloneElement(children, { ...getTriggerProps(), ...rest })}
      </>
    );
  }
);
