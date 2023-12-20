import {
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

import { clsx } from "clsx";

import { useOverlay } from "./useOverlay";
import { FloatingOverlay } from "@floating-ui/react";
import { OverlayBase } from "./OverlayBase";

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
              className={clsx(withBaseName(), className)}
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
              <OverlayBase
                arrowProps={arrowProps}
                content={content}
                handleCloseButton={handleCloseButton}
                {...rest}
              />
            </FloatingComponent>
          </FloatingOverlay>
        )}
      </>
    );
  }
);
