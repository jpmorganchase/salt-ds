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
  makePrefixer,
  SaltProvider,
  useForkRef,
  useId,
  ValidationStatus,
} from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { useDialog } from "./useDialog";
import dialogCss from "./Dialog.css";
import { DialogContext } from "./DialogContext";

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
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

const withBaseName = makePrefixer("saltDialog");

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  props,
  ref
) {
  const {
    children,
    className,
    open = true,
    onOpenChange,
    status,
    initialFocus,
    ...rest
  } = props;
  const dialogId = useId() || "dialog";
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dialog",
    css: dialogCss,
    window: targetWindow,
  });

  const [showComponent, setShowComponent] = useState(false);

  const { floating, context, getFloatingProps } = useDialog({
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
    () => ({ dialogId, status }),
    [dialogId, status]
  );

  return (
    <FloatingPortal>
      <SaltProvider>
      {showComponent && (
        <FloatingOverlay className={withBaseName("overlay")} lockScroll>
          <FloatingFocusManager
            context={context}
            modal
            initialFocus={initialFocus}
          >
            <DialogContext.Provider value={contextValue}>
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
                aria-labelledby={`${dialogId}-heading`}
                aria-describedby={`${dialogId}-description`}
                aria-modal="true"
                {...getFloatingProps()}
                {...rest}
              >
                {children}
              </div>
            </DialogContext.Provider>
          </FloatingFocusManager>
        </FloatingOverlay>
      )}
      </SaltProvider>
    </FloatingPortal>
  );
});
