import cn from "classnames";
import {
  cloneElement,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  Ref,
  RefObject,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  ReactElement,
  ComponentType,
  MouseEvent as ReactMouseEvent,
  FocusEvent as ReactFocusEvent,
} from "react";
import { makePrefixer, useAriaAnnouncer, IconProps } from "@brandname/core";
import { arrow, limitShift, shift } from "@floating-ui/react-dom";

import { Popper, PopperProps } from "../popper";
import { useControlled, useForkRef, useId } from "../utils";
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
  getTitleProps: any; // StateAndPropGetterFunction<TooltipTitleProps>;
}

export interface TooltipProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Only single child element is supported.
   */
  children?: ReactElement & {
    ref?: RefObject<HTMLElement>;
  };
  anchorElement?: HTMLElement;
  /**
   * Removes the tooltip arrow.
   */
  hideArrow?: boolean;
  /**
   * Whether to hide a state icon within the tooltip
   */
  hideIcon?: boolean;
  /**
   * Tooltip placement ['right', 'right-start', 'right-end', 'top', 'top-start', 'top-end', 'left', 'left-start', 'left-end', 'bottom', 'bottom-start', 'bottom-end']
   */
  placement?: PopperProps["placement"];
  /**
   * A callback function to render the tooltip content
   * @param {function} getIcon getter for the icon based on the state
   * @param {function} getIconProps getter for the icon properties
   * @param {function} getTitleProps getter for the title properties
   */
  render?: (props: TooltipRenderProp) => ReactNode;
  /**
   * A string to determine the current state of the tooltip
   */
  state?: TooltipState;
  title?: string;
  /**
   * Do not respond to focus events.
   */
  disableFocusListener?: boolean;
  /**
   * Do not respond to hover events.
   */
  disableHoverListener?: boolean;
  /**
   * The number of milliseconds to wait before showing the tooltip.
   * This prop won't impact the enter touch delay (`enterTouchDelay`).
   */
  enterDelay?: number;
  /**
   * The number of milliseconds to wait before showing the tooltip when one was already recently opened.
   */
  enterNextDelay?: number;
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id?: string;
  /**
   * Makes a tooltip interactive, i.e. will not close when the user
   * hovers over the tooltip before the `leaveDelay` is expired.
   */
  interactive?: boolean;
  /**
   * The number of milliseconds to wait before hiding the tooltip.
   * This prop won't impact the leave touch delay (`leaveTouchDelay`).
   */
  leaveDelay?: number;
  /**
   * Callback fired when the component requests to be closed.
   *
   * @param {object} event The event source of the callback.
   */
  onClose?: (event: SyntheticEvent | Event) => void;
  /**
   * Callback fired when the component requests to be open.
   *
   * @param {object} event The event source of the callback.
   */
  onOpen?: (event: SyntheticEvent | Event) => void;
  /**
   * If `true`, the tooltip is shown.
   */
  open?: boolean;
  /**
   * The component used for the popper.
   */
  PopperComponent?: ComponentType<PopperProps>;
  /**
   * Props applied to the Popper element.
   */
  PopperProps?: Partial<PopperProps>;
}

let visibleTimer: number;
let uncontrolledOpen: boolean;

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(
    {
      PopperComponent = Popper,
      PopperProps = {},
      children,
      anchorElement,
      className: classNameProp,
      disableFocusListener,
      disableHoverListener,
      hideArrow,
      // API Changed from `hasIcon` = true
      hideIcon,
      open: openProp,
      onClose,
      onOpen,
      placement = "right",
      render,
      state = "info",
      title,
      enterDelay = 100,
      enterNextDelay = 0,
      leaveDelay = 0,
      id: idProp,
      ...rest
    },
    ref
  ) {
    if (!children && !anchorElement) {
      console.error("Tooltip is missing children or anchorElement");
      return <></>;
    }

    const [childNode, setChildNode] = useState<HTMLElement | undefined>();
    const childRef = useForkRef(children?.ref, setChildNode);

    const enterTimer = useRef(-1);
    const leaveTimer = useRef(-1);
    const tooltipId = useId(idProp);
    const { announce } = useAriaAnnouncer();
    const tooltipContentRef = useRef<HTMLDivElement>(null);
    const arrowRef = useRef<HTMLDivElement>(null);

    const [openState, setOpenState] = useControlled({
      controlled: openProp,
      default: false,
      name: "Tooltip",
      state: "open",
    });

    let open = openState;

    const handleOpen = (event: SyntheticEvent | Event) => {
      clearTimeout(visibleTimer);
      uncontrolledOpen = true;

      setOpenState(true);

      onOpen?.(event);
    };

    const handleClose = useCallback(
      (event: SyntheticEvent | Event) => {
        clearTimeout(visibleTimer);
        visibleTimer = window.setTimeout(() => {
          uncontrolledOpen = false;
        }, 800 + leaveDelay);
        setOpenState(false);

        onClose?.(event);
      },
      [leaveDelay, onClose, setOpenState]
    );

    const handleEnter = (event: SyntheticEvent | Event) => {
      clearTimeout(enterTimer.current);
      clearTimeout(leaveTimer.current);
      if (enterDelay || (uncontrolledOpen && enterNextDelay)) {
        enterTimer.current = window.setTimeout(
          () => {
            handleOpen(event);
          },
          uncontrolledOpen ? enterNextDelay : enterDelay
        );
      } else {
        handleOpen(event);
      }
    };

    const handleLeave = (event: SyntheticEvent | Event) => {
      clearTimeout(enterTimer.current);
      clearTimeout(leaveTimer.current);
      leaveTimer.current = window.setTimeout(() => {
        handleClose(event);
      }, leaveDelay);
    };

    useEffect(() => {
      if (!open) {
        return undefined;
      }

      const handleKeyDown = (nativeEvent: KeyboardEvent) => {
        if (nativeEvent.key === "Escape") {
          handleClose(nativeEvent);
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [handleClose, open]);

    if (!title && !render) {
      open = false;
    }

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

    const getTitleProps = useCallback(
      ({
        className: titleClassName,
        ...titleRest
      }: HTMLAttributes<HTMLElement> = {}) => ({
        className: cn(titleClassName),
        ...titleRest,
      }),
      []
    );

    const childrenProps: HTMLAttributes<HTMLElement> & {
      ref?: RefObject<unknown>;
    } = {
      ...(children?.props as HTMLAttributes<HTMLElement>),
      ref: children?.ref,
    };
    const {
      onMouseEnter: onMouseEnterChild,
      onMouseLeave: onMouseLeaveChild,
      onFocus: onFocusChild,
      onBlur: onBlurChild,
      ...restChildrenProps
    } = childrenProps;

    const onMouseEnter =
      onMouseEnterChild ||
      (anchorElement && anchorElement.onmouseenter
        ? () => anchorElement.onmouseenter
        : undefined);

    const onMouseLeave =
      onMouseLeaveChild ||
      (anchorElement && anchorElement.onmouseleave
        ? () => anchorElement.onmouseleave
        : undefined);

    const onFocus =
      onFocusChild ||
      (anchorElement && anchorElement.onfocus
        ? () => anchorElement.onfocus
        : undefined);

    const onBlur =
      onBlurChild ||
      (anchorElement && anchorElement.onblur
        ? () => anchorElement.onblur
        : undefined);

    const handleMouseEnter = (e: MouseEvent | ReactMouseEvent) => {
      if (!disableHoverListener) {
        handleEnter(e);

        setTimeout(() => {
          const tooltipContent = tooltipContentRef.current?.innerText;

          if (tooltipContent) {
            announce(tooltipContent);
          }
        }, enterDelay);
      }

      // onMouseEnter && onMouseEnter(e);
    };

    const handleMouseLeave = (e: MouseEvent | ReactMouseEvent) => {
      if (!disableHoverListener) {
        handleLeave(e);
      }
      // onMouseLeave?.(e);
    };

    const handleFocus = (e: FocusEvent | ReactFocusEvent) => {
      if (!disableFocusListener) {
        handleEnter(e);
      }
      // onFocus?.(e);
    };

    const handleBlur = (e: FocusEvent | ReactFocusEvent) => {
      if (!disableFocusListener) {
        handleLeave(e);
      }
      // onBlur?.(e);
    };

    const handleMiddlewareDataChange: PopperProps["onMiddlewareDataChange"] = (
      middlewareData
    ) => {
      if (middlewareData.arrow && arrowRef.current) {
        const { x, y } = middlewareData.arrow;
        Object.assign(arrowRef.current.style, {
          left: x != null ? `${x}px` : "",
          top: y != null ? `${y}px` : "",
        });
      }
    };

    useEffect(() => {
      if (anchorElement) {
        anchorElement.addEventListener("mouseenter", handleMouseEnter);
        anchorElement.addEventListener("mouseleave", handleMouseLeave);
        anchorElement.addEventListener("focus", handleFocus);
        anchorElement.addEventListener("blur", handleBlur);
      }

      return () => {
        if (anchorElement) {
          anchorElement.removeEventListener("mouseenter", handleMouseEnter);
          anchorElement.removeEventListener("mouseleave", handleMouseLeave);
          anchorElement.removeEventListener("focus", handleFocus);
          anchorElement.removeEventListener("blur", handleBlur);
        }
      };
    }, [anchorElement]);

    return (
      <>
        {!!children &&
          cloneElement(children, {
            ...restChildrenProps,
            "aria-owns": open ? tooltipId : undefined,
            "aria-describedby": open ? tooltipId : undefined,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onFocus: handleFocus,
            onBlur: handleBlur,
            ref: childRef,
          })}
        <PopperComponent
          anchorEl={anchorElement || childNode}
          open={anchorElement || childNode ? open : false}
          placement={placement}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
          middleware={useMemo(
            () => [
              shift({
                limiter: limitShift({
                  offset: () =>
                    Math.max(
                      arrowRef.current?.offsetWidth ?? 0,
                      arrowRef.current?.offsetHeight ?? 0
                    ),
                }),
              }),
              arrow({ element: arrowRef }),
            ],
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [hideArrow]
          )}
          onMiddlewareDataChange={handleMiddlewareDataChange}
          {...PopperProps}
        >
          <div
            className={cn(
              withBaseName(),
              withBaseName(state),
              withBaseName(placement)
            )}
            ref={ref}
            id={tooltipId}
            {...rest}
          >
            <div className={withBaseName("content")} ref={tooltipContentRef}>
              {render ? (
                render({
                  Icon: (passedProps: IconProps) => getIcon(passedProps),
                  getIconProps: () => defaultIconProps,
                  getTitleProps,
                })
              ) : (
                <>
                  {getIcon({})}
                  <span className={withBaseName("body")}>{title}</span>
                </>
              )}
            </div>
            {!hideArrow && (
              <div
                ref={arrowRef}
                className={withBaseName("arrow")}
                data-popper-arrow="true"
              />
            )}
          </div>
        </PopperComponent>
      </>
    );
  }
);
