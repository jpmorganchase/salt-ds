import { Icon, IconProps } from "@salt-ds/icons";
import { StatusIndicator, ValidationStatus, makePrefixer } from "@salt-ds/core";
import cn from "classnames";
import {
  ComponentProps,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  ReactElement,
  JSXElementConstructor,
  cloneElement,
} from "react";
import { Portal, PortalProps } from "../portal";
import {} from "../utils";
import { useWindow } from "../window";
import "./Tooltip.css";

// Keep in order of preference. First items are used as default

const withBaseName = makePrefixer("saltTooltip");
const defaultIconProps = { size: 1, className: withBaseName("icon") };

// FIXME: Fix types
interface TooltipRenderProp {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any; // typeof Icon;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getIconProps?: any; // StateAndPropGetterFunction<IconProps>;
}

export interface TooltipProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "text">,
    Pick<PortalProps, "disablePortal" | "container"> {
  children?: ReactElement<any, string | JSXElementConstructor<any>>;
  // placement?: Placement;
  arrowProps?: ComponentProps<"div">;
  // disabled?: boolean;
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
      text,
      title,
      ...rest
    },
    ref
  ) {
    // const getIcon = useCallback(
    //   (iconProps: IconProps) => {
    //     if (hideIcon) {
    //       return null;
    //     }
    //     return status !== "info" ? (
    //       <StatusIndicator
    //         status={status}
    //         {...iconProps}
    //         className={withBaseName("icon")}
    //       />
    //     ) : null;
    //   },
    //   [status, hideIcon]
    // );

    const Window = useWindow();

    // const tooltipProps = getTooltipProps(props);
    // console.log('tooltipProps', tooltipProps);
    // console.log('getTriggerProps', getTriggerProps(props));

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
              ref={ref}
              {...rest}
            >
              <div className={withBaseName("content")}>
                {render ? (
                  render({
                    Icon: (passedProps: IconProps) => (
                      <Icon {...passedProps} {...defaultIconProps} />
                    ),
                    getIconProps: () => defaultIconProps,
                  })
                ) : (
                  <>
                    {!hideIcon && (
                      <StatusIndicator status={status} {...defaultIconProps} />
                    )}
                    <span className={withBaseName("body")}>{text}</span>
                  </>
                )}
              </div>
              {!hideArrow && (
                <div className={withBaseName("arrow")} {...arrowProps} />
              )}
            </Window>
          </Portal>
        )}

        {children && cloneElement(children)}
      </>
    );
  }
);
