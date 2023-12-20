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
  SyntheticEvent,
} from "react";
import { CloseIcon } from "@salt-ds/icons";
import { clsx } from "clsx";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import overlayCSS from "./Overlay.css";
import { useOverlay } from "./useOverlay";
import { FloatingArrow, FloatingOverlay } from "@floating-ui/react";

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
  /*
   * Use in controlled version to close Overlay.
   */
  onClose?: (event: SyntheticEvent) => void;
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
      onClose,
      "aria-labelledby": overlayLabelledBy,
      "aria-describedby": overlayDescribedBy,
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
      // @ts-ignore error TS2339
      isValidElement(children) ? children.ref : null,
      reference
    );

    const floatingRef = useForkRef<HTMLDivElement>(floating, ref);

    const handleCloseButton = (event: SyntheticEvent) => {
      onOpenChange(false);
      onClose?.(event);
    };

    return (
      <>
        {isValidElement(children) &&
          cloneElement(children, {
            ...mergeProps(getTriggerProps(), children.props),
            ref: triggerRef,
          })}

        {open && (
          <FloatingOverlay>
            <FloatingComponent
              ref={floatingRef}
              open={open}
              className={withBaseName()}
              aria-modal="true"
              aria-labelledBy={overlayLabelledBy}
              aria-describedBy={overlayDescribedBy}
              {...getOverlayProps()}
              {...floatingStyles()}
              // @ts-ignore missing 'children' property
              focusManagerProps={{
                context: context,
              }}
            >
              <div
                className={clsx(withBaseName("container"), className)}
                {...rest}
              >
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
                {...arrowProps}
                strokeWidth={1}
                fill="var(--overlay-background)"
                stroke="var(--overlay-borderColor)"
                style={{
                  height: "calc(var(--salt-size-adornment) + 6px)", // +6px to account for Floating UI's FloatingArrow positioning calculation
                  width: "calc(var(--salt-size-adornment) + 8px)", // +8px to account for Floating UI's FloatingArrow positioning calculation
                }}
              />
            </FloatingComponent>
          </FloatingOverlay>
        )}
      </>
    );
  }
);
