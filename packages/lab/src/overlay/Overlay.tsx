import {
  Button,
  makePrefixer,
  mergeProps,
  useFloatingComponent,
  UseFloatingUIProps,
  useForkRef,
} from "@salt-ds/core";
import {
  forwardRef,
  ReactNode,
  isValidElement,
  cloneElement,
  HTMLAttributes,
  useState,
  useEffect,
} from "react";
import { CloseIcon } from "@salt-ds/icons";
import { clsx } from "clsx";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import overlayCSS from "./Overlay.css";
import { useOverlay } from "./useOverlay";
import {
  FloatingArrow,
  FloatingArrowProps,
  FloatingFocusManager,
} from "@floating-ui/react";

export interface OverlayProps
  extends Pick<UseFloatingUIProps, "open" | "onOpenChange" | "placement">,
    Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  /**
   * The children will be the Overlay's trigger.
   */
  children: ReactNode;
  /**
   * Content displayed inside the Overlay. Can be a string or a React component.
   */
  content: ReactNode;
  /*
   * Set the placement of the Overlay component relative to the anchor element. Defaults to `top`.
   */
  placement?: "bottom" | "top" | "left" | "right";
}

const withBaseName = makePrefixer("saltOverlay");

export const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  function Overlay(props, ref) {
    const {
      children,
      className,
      open: openProp,
      onOpenChange: onOpenChangeProp,
      content,
      placement = "top",
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-overlay",
      css: overlayCSS,
      window: targetWindow,
    });

    const {
      arrowProps,
      open,
      onOpenChange,
      context,
      floating,
      reference,
      refs,
      getTriggerProps,
      getOverlayProps,
      floatingStyles,
    } = useOverlay({
      open: openProp,
      placement,
      onOpenChange: onOpenChangeProp,
    });

    const { Component: FloatingComponent } = useFloatingComponent();

    const triggerRef = useForkRef(
      // @ts-ignore
      isValidElement(children) ? children.ref : null,
      reference
    );

    const floatingRef = useForkRef<HTMLDivElement>(floating, ref);

    const handleCloseButton = () => {
      onOpenChange(false);
    };

    return (
      <>
        {isValidElement(children) &&
          cloneElement(children, {
            ...mergeProps(getTriggerProps(), children.props),
            ref: triggerRef,
          })}

        {open && (
          <FloatingFocusManager
            context={context}
            // initialFocus={
            //   refs.reference as React.MutableRefObject<HTMLElement | null>
            // }
            order={["reference", "content"]}
            // modal={true}
            // returnFocus
          >
            <FloatingComponent
              ref={floatingRef}
              open={open}
              className={clsx(withBaseName(), className)}
              {...getOverlayProps()}
              {...floatingStyles()}
            >
              <div className={withBaseName("container")} {...rest}>
                <Button
                  onClick={handleCloseButton}
                  variant="secondary"
                  className={withBaseName("closeButton")}
                  aria-label="Close Overlay"
                >
                  <CloseIcon aria-hidden />
                </Button>
                <div className={withBaseName("content")}>{content}</div>
              </div>
              <FloatingArrow
                {...(arrowProps as FloatingArrowProps)}
                className={withBaseName("arrow")}
                strokeWidth={1}
                fill="var(--overlay-background)"
                stroke="var(--overlay-borderColor)"
                height={8}
                width={14}
              />
            </FloatingComponent>
          </FloatingFocusManager>
        )}
      </>
    );
  }
);
