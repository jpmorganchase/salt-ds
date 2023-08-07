import {
  forwardRef,
  HTMLAttributes,
  useEffect,
  useMemo,
  useState,
  ComponentProps,
} from "react";
import { clsx } from "clsx";
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
} from "@floating-ui/react";
import {
  Button,
  makePrefixer,
  useForkRef,
  useId,
  ValidationStatus,
} from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { CloseIcon } from "@salt-ds/icons";

import { useDialogNext } from "./useDialogNext";
import dialogNextCss from "./DialogNext.css";
import { DialogNextContext } from "./DialogNextContext";

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
  status?: ValidationStatus;
  /**
   * Which element to initially focus. Can be either a number (tabbable index as specified by the order) or a ref.
   * Default value is 0 (first tabbable element).
   * */
  initialFocus?: ComponentProps<typeof FloatingFocusManager>["initialFocus"];
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
      initialFocus,
      ...rest
    } = props;
    const dialogId = useId() || "dialog-next";
    const headingId = `${dialogId}-heading`;
    const descriptionId = `${dialogId}-description`;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog-next",
      css: dialogNextCss,
      window: targetWindow,
    });

    const [showComponent, setShowComponent] = useState(false);

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
      () => ({ headingId, descriptionId, status }),
      [headingId, status, descriptionId]
    );

    return (
      <FloatingPortal>
        {showComponent && (
          <FloatingOverlay className={withBaseName("overlay")} lockScroll>
            <FloatingFocusManager
              context={context}
              modal
              initialFocus={initialFocus}
            >
              <DialogNextContext.Provider value={contextValue}>
                <div
                  id={dialogId}
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
                  aria-describedby={descriptionId}
                  aria-modal="true"
                  {...getFloatingProps()}
                  {...rest}
                >
                  {children}
                  <Button
                    aria-controls={dialogId}
                    aria-label="Close dialog"
                    className={withBaseName("closeButton")}
                    variant="secondary"
                    onClick={() => {
                      onOpenChange?.(false);
                    }}
                  >
                    <CloseIcon aria-hidden />
                  </Button>
                </div>
              </DialogNextContext.Provider>
            </FloatingFocusManager>
          </FloatingOverlay>
        )}
      </FloatingPortal>
    );
  }
);
