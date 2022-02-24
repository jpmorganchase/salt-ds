import cx from "classnames";
import {
  forwardRef,
  useMemo,
  ComponentPropsWithoutRef,
  useEffect,
  useCallback,
} from "react";
import {
  useFloating,
  shift,
  flip,
  getScrollParents,
  limitShift,
} from "@floating-ui/react-dom";
import type {
  Placement,
  Middleware,
  MiddlewareData,
  Strategy,
  VirtualElement,
} from "@floating-ui/core";
import { makePrefixer, useIsomorphicLayoutEffect } from "@brandname/core";
import { Portal } from "../portal";
import { useWindow } from "../window";
import { useForkRef } from "../utils";
import "./Popper.css";
import { useResizeObserver, WidthHeight } from "../responsive";

const withBaseName = makePrefixer("uitkPopper");

export interface PopperProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * A HTML element or a virtual element
   */
  anchorEl?: Element | VirtualElement | null;
  /**
   * Controls whether the popper is open.
   */
  open?: boolean;
  /**
   * Controls placement of the popper.
   */
  placement?: Placement;
  /**
   * Element container where the popper creates the portal.
   */
  container?: Element;
  /**
   * Use popper without ReactDOM.createPortal
   */
  disablePortal?: boolean;
  strategy?: Strategy;
  middleware?: Middleware[];
  onMiddlewareDataChange?: (middlewareData: MiddlewareData) => void;
}

const defaultMiddleware: Middleware[] = [];

const PopperTooltip = forwardRef<
  HTMLDivElement,
  Omit<PopperProps, "container" | "middleware"> & {
    middleware: Middleware[];
  }
>(function PopperTooltip(props, ref) {
  const {
    anchorEl,
    children,
    className,
    open,
    placement: placementProp = "bottom-start",
    strategy: strategyProp,
    style: styleProp,
    middleware,
    onMiddlewareDataChange,
    ...restProps
  } = props;

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    refs,
    update,
    middlewareData,
    placement,
  } = useFloating({
    placement: placementProp,
    strategy: strategyProp,
    middleware: useMemo(
      () => [flip(), shift({ limiter: limitShift() }), ...middleware],
      [middleware]
    ),
  });

  const handleResize = useCallback(() => {
    update();
  }, [update]);

  useResizeObserver(refs.reference, WidthHeight, handleResize);
  useResizeObserver(refs.floating, WidthHeight, handleResize);

  useIsomorphicLayoutEffect(() => {
    if (anchorEl) {
      reference(anchorEl);
    }
  }, [reference, anchorEl]);

  const handleRef = useForkRef<HTMLDivElement>(floating, ref);

  useIsomorphicLayoutEffect(() => {
    onMiddlewareDataChange?.(middlewareData);
  }, [middlewareData, onMiddlewareDataChange]);

  // Update on scroll and resize for all relevant nodes
  useEffect(() => {
    if (!refs.reference.current || !refs.floating.current) {
      return;
    }

    const parents = [
      ...getScrollParents(refs.reference.current),
      ...getScrollParents(refs.floating.current),
    ];
    const handleUpdate = () => {
      requestAnimationFrame(() => {
        update();
      });
    };

    handleUpdate();

    parents.forEach((parent) => {
      parent.addEventListener("scroll", handleUpdate);
      parent.addEventListener("resize", handleUpdate);
    });

    return () => {
      parents.forEach((parent) => {
        parent.removeEventListener("scroll", handleUpdate);
        parent.removeEventListener("resize", handleUpdate);
      });
    };
  }, [refs.reference, refs.floating, update]);

  const Window = useWindow();
  return (
    <Window
      className={cx(withBaseName(), className)}
      ref={handleRef}
      data-popper-placement={placement}
      style={{
        ...styleProp,
        position: strategy,
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        top: y ?? "",
        left: x ?? "",
      }}
      {...restProps}
    >
      {children}
    </Window>
  );
});

export const Popper = forwardRef<HTMLDivElement, PopperProps>(function Popper(
  {
    anchorEl,
    children,
    container = document.body,
    disablePortal = false,
    middleware = defaultMiddleware,
    onMiddlewareDataChange,
    open,
    placement = "bottom-start",
    strategy,
    ...other
  },
  ref
) {
  if (!open) {
    return null;
  }

  return (
    <Portal disablePortal={disablePortal} container={container}>
      <PopperTooltip
        anchorEl={anchorEl}
        open={open}
        onMiddlewareDataChange={onMiddlewareDataChange}
        middleware={middleware}
        ref={ref}
        placement={placement}
        strategy={strategy}
        {...other}
      >
        {children}
      </PopperTooltip>
    </Portal>
  );
});
