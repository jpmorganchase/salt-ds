import {
  forwardRef,
  HTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { clsx } from "clsx";
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
} from "@floating-ui/react";
import { makePrefixer, useForkRef, useId } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useDialogNext } from "./useDialogNext";

import dialogNextCss from "./DialogNext.css";
import { DialogNextContext } from "./DialogNextContext";
import { DialogNextBody } from "./DialogNextBody";

export interface DialogNextProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Display or hide the component.
   */
  open?: boolean;
  /**
   * Callback function triggered when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Status indicator
   * */
  status?: "info" | "success" | "warning" | "error";
}

const withBaseName = makePrefixer("saltDialogNext");

export const DialogNext = forwardRef<HTMLDivElement, DialogNextProps>(
  function DialogNext(props, ref) {
    const {
      children,
      className,
      open = true,
      onOpenChange,
      status,
      ...rest
    } = props;
    const dialogId = useId() || "dialog-next";
    const headingId = `${dialogId}-heading`;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog-next",
      css: dialogNextCss,
      window: targetWindow,
    });

    const [showComponent, setShowComponent] = useState(false);
    const headingRef = useRef<HTMLHeadingElement>(null);

    const { floating, context, getFloatingProps } = useDialogNext({
      open,
      onOpenChange,
    });

    const floatingRef = useForkRef<HTMLDivElement>(floating, ref);

    useEffect(() => {
      if (open && !showComponent) {
        setShowComponent(true);
      }
    }, [open, showComponent]);

    const contextValue = useMemo(
      () => ({ headingRef, headingId }),
      [headingId]
    );

    return (
      <FloatingPortal>
        {showComponent && (
          <FloatingOverlay className={withBaseName("overlay")} lockScroll>
            <FloatingFocusManager context={context} initialFocus={headingRef}>
              <DialogNextContext.Provider value={contextValue}>
                <div
                  className={clsx(
                    withBaseName(),
                    {
                      [withBaseName("enterAnimation")]: open,
                      [withBaseName("exitAnimation")]: !open,
                      [withBaseName("withStatus")]: status,
                      [withBaseName(status as string)]: status,
                    },
                    className
                  )}
                  onAnimationEnd={() => {
                    if (!open && showComponent) {
                      setShowComponent(false);
                    }
                  }}
                  ref={floatingRef}
                  aria-labelledby={headingId}
                  aria-modal="true"
                  {...getFloatingProps()}
                  {...rest}
                >
                  <DialogNextBody status={status}>{children}</DialogNextBody>
                </div>
              </DialogNextContext.Provider>
            </FloatingFocusManager>
          </FloatingOverlay>
        )}
      </FloatingPortal>
    );
  }
);
