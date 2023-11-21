import {
  Button,
  makePrefixer,
  mergeProps,
  SaltProvider,
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
  FloatingPortal,
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

    const [showComponent, setShowComponent] = useState(false);

    const {
      arrowProps,
      open,
      onOpenChange,
      context,
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

    useEffect(() => {
      if (open && !showComponent) {
        setShowComponent(true);
      }
    }, [open, showComponent]);

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

        <FloatingPortal>
          {/* The provider is needed to support the use case where an app has nested modes. The element that is portalled needs to have the same style as the current scope */}
          <SaltProvider>
            {open && showComponent && (
              <FloatingFocusManager context={context} initialFocus={-1}>
                <div
                  ref={floatingRef}
                  className={clsx(withBaseName(), className)}
                  style={getOverlayPosition()}
                  {...getOverlayProps()}
                  {...rest}
                >
                  <div className={withBaseName("container")}>
                    <div className={withBaseName("content")}>{content}</div>
                    <div className={withBaseName("closeButton")}>
                      <Button onClick={handleCloseButton} variant="secondary">
                        <CloseIcon
                          accessible-text="close overlay"
                          className={withBaseName("closeIcon")}
                        />
                      </Button>
                    </div>
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
                </div>
              </FloatingFocusManager>
            )}
          </SaltProvider>
        </FloatingPortal>
      </>
    );
  }
);
