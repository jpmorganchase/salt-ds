import {
  Button,
  makePrefixer,
  mergeProps,
  StatusIndicator,
  useFloatingComponent,
  UseFloatingUIProps,
  useForkRef,
} from "@salt-ds/core";
import {
  forwardRef,
  ComponentPropsWithoutRef,
  ReactNode,
  Ref,
  isValidElement,
  cloneElement,
  useState,
  useEffect,
  HTMLAttributes,
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
  useTransitionStyles,
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

    const { Component: FloatingComponent } = useFloatingComponent();

    const {
      arrowProps,
      open,
      onOpenChange,
      floating,
      reference,
      getTriggerProps,
      getOverlayProps,
      getOverlayPosition,
    } = useOverlay({
      open: openProp,
      placement,
      onOpenChange: onOpenChangeProp,
    });

    const triggerRef = useForkRef(
      // @ts-ignore
      isValidElement(children) ? children.ref : null,
      reference
    );

    const floatingRef = useForkRef<HTMLDivElement>(floating, ref);

    const handleCloseButton = () => {
      console.log("close ovl");
      onOpenChange(false);
    };

    return (
      <>
        {isValidElement(children) &&
          cloneElement(children, {
            ...mergeProps(getTriggerProps(), children.props),
            ref: triggerRef,
          })}

        <FloatingComponent
          className={clsx(withBaseName(), className)}
          open={open}
          ref={floatingRef}
          {...getOverlayProps()}
          {...getOverlayPosition()}
          {...rest}
        >
          <div className={withBaseName("container")}>
            <div className={withBaseName("content")}>{content}</div>
            <Button
              onClick={handleCloseButton}
              className={withBaseName("close")}
              variant="secondary"
              // tabIndex={1}
            >
              <CloseIcon
                accessible-text="close overlay"
                className={withBaseName("closeIcon")}
              />
            </Button>
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
      </>
    );
  }
);
