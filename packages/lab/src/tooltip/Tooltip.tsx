import cn from "classnames";
import {
  cloneElement,
  FocusEvent,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  Ref,
  SyntheticEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  ReactElement,
} from "react";
import { makePrefixer, useAriaAnnouncer, IconProps } from "@brandname/core";
import { arrow, flip, limitShift, offset, shift } from "@floating-ui/react-dom";

import { useFloatingUI, UseFloatingUIProps } from "../popper";
import { useControlled, useForkRef, useId } from "../utils";
import { getIconForState } from "./getIconForState";

import "./Tooltip.css";
import { Portal, PortalProps } from "../portal";
import { useWindow } from "../window";

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
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    Pick<PortalProps, "disablePortal" | "container"> {
  /**
   * Only single child element is supported.
   */
  children: ReactElement & {
    ref?: Ref<unknown>;
  };
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
  placement?: UseFloatingUIProps["placement"];
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
  onOpen?: (event: SyntheticEvent) => void;
  /**
   * If `true`, the tooltip is shown.
   */
  open?: boolean;
}

let visibleTimer: number;
let uncontrolledOpen: boolean;

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(
    {
      children,
      className: classNameProp,
      container,
      disableFocusListener,
      disableHoverListener,
      disablePortal,
      hideArrow,
      // API Changed from `hasIcon` = true
      hideIcon,
      open: openProp,
      onClose,
      onOpen,
      placement: placementProp = "right",
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
    const arrowRef = useRef<HTMLDivElement | null>(null);
    const {
      floating,
      reference,
      x,
      y,
      strategy,
      update,
      middlewareData,
      placement,
    } = useFloatingUI({
      placement: placementProp,
      middleware: [
        offset(8),
        flip(),
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
    });
    const childRef = useForkRef(children.ref, reference);
    const handleRef = useForkRef<HTMLDivElement>(floating, ref);
    const enterTimer = useRef(-1);
    const leaveTimer = useRef(-1);
    const tooltipId = useId(idProp);
    const { announce } = useAriaAnnouncer();
    const tooltipContentRef = useRef<HTMLDivElement>(null);

    const [openState, setOpenState] = useControlled({
      controlled: openProp,
      default: false,
      name: "Tooltip",
      state: "open",
    });

    let open = openState;

    const handleOpen = (event: SyntheticEvent) => {
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

    const handleEnter = (event: SyntheticEvent) => {
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

    const handleLeave = (event: SyntheticEvent) => {
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
      ref: Ref<unknown>;
    } = {
      ...(children.props as HTMLAttributes<HTMLElement>),
      ref: childRef,
    };

    const {
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...restChildrenProps
    } = childrenProps;

    const handleMouseEnter = (e: MouseEvent<HTMLElement>) => {
      if (!disableHoverListener) {
        handleEnter(e);

        setTimeout(() => {
          const tooltipContent = tooltipContentRef.current?.innerText;

          if (tooltipContent) {
            announce(tooltipContent);
          }
        }, enterDelay);
      }
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: MouseEvent<HTMLElement>) => {
      if (!disableHoverListener) {
        handleLeave(e);
      }
      onMouseLeave?.(e);
    };

    const handleFocus = (e: FocusEvent<HTMLElement>) => {
      if (!disableFocusListener) {
        handleEnter(e);
      }
      onFocus?.(e);
    };

    const handleBlur = (e: FocusEvent<HTMLElement>) => {
      if (!disableFocusListener) {
        handleLeave(e);
      }
      onBlur?.(e);
    };

    const handleArrowRef = useCallback(
      (element: HTMLDivElement) => {
        arrowRef.current = element;
        update();
      },
      [update]
    );

    const Window = useWindow();
    return (
      <>
        {cloneElement(children, {
          ...restChildrenProps,
          "aria-owns": open ? tooltipId : undefined,
          "aria-describedby": open ? tooltipId : undefined,
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          onFocus: handleFocus,
          onBlur: handleBlur,
        })}
        {open && (
          <Portal disablePortal={disablePortal} container={container}>
            <Window
              className={cn(withBaseName(), withBaseName(state))}
              data-placement={placement}
              id={tooltipId}
              role="tooltip"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={handleFocus}
              onBlur={handleBlur}
              ref={handleRef}
              {...rest}
              style={{
                top: y ?? "",
                left: x ?? "",
                position: strategy,
                ...(rest.style || {}),
              }}
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
                  ref={handleArrowRef}
                  className={withBaseName("arrow")}
                  data-popper-arrow="true"
                  style={{
                    left: middlewareData.arrow?.x ?? "",
                    top: middlewareData.arrow?.y ?? "",
                  }}
                />
              )}
            </Window>
          </Portal>
        )}
      </>
    );
  }
);
