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
  useClick,
  useDismiss,
  useInteractions,
} from "@floating-ui/react";
import {
  makePrefixer,
  useForkRef,
  ValidationStatus,
  Scrim,
  useFloatingUI,
  useFloatingComponent,
  useCurrentBreakpoint,
  useId,
} from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
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
   * The status of the Dialog
   * */
  status?: ValidationStatus;
  /**
   * Which element to initially focus. Can be either a number (tabbable index as specified by the order) or a ref.
   * Default value is 0 (first tabbable element).
   * */
  initialFocus?: ComponentProps<typeof FloatingFocusManager>["initialFocus"];
  /**
   * Size of the Dialog
   * */
  size?: "small" | "medium" | "large";
  /**
   * Prevent the dialog closing on click away
   * */
  disableDismiss?: boolean;
}

const withBaseName = makePrefixer("saltDialog");

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  props,
  ref
) {
  const {
    children,
    className,
    open = false,
    onOpenChange,
    status,
    disableDismiss,
    size = "medium",
    id: idProp,
    role: roleProp,
    ...rest
  } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dialog",
    css: dialogCss,
    window: targetWindow,
  });

  const currentbreakpoint = useCurrentBreakpoint();

  const [showComponent, setShowComponent] = useState(false);

  const { context, floating } = useFloatingUI({
    open,
    onOpenChange,
  });

  const id = useId(idProp);
  const role = roleProp ?? "dialog";

  const { getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context, { enabled: !disableDismiss }),
  ]);

  const { Component: FloatingComponent } = useFloatingComponent();

  const floatingRef = useForkRef<HTMLDivElement>(floating, ref);

  useEffect(() => {
    if (open && !showComponent) {
      setShowComponent(true);
    }

    if (!open && showComponent) {
      const animate = setTimeout(() => {
        setShowComponent(false);
      }, 300); // var(--salt-duration-perceptible)
      return () => clearTimeout(animate);
    }
  }, [open, showComponent, setShowComponent]);

  const contextValue = useMemo(() => ({ status }), [status]);

  return (
    <DialogContext.Provider value={contextValue}>
      {showComponent && (
        <Scrim>
          <FloatingComponent
            open={open}
            role={role}
            aria-modal="true"
            ref={floatingRef}
            focusManagerProps={{
              context: context,
            }}
            aria-labelledby={`${id}-header`}
            className={clsx(
              withBaseName(),
              withBaseName(size, currentbreakpoint),
              {
                [withBaseName("enterAnimation")]: open,
                [withBaseName("exitAnimation")]: !open,
                [withBaseName(status as string)]: status,
              },
              className
            )}
            onAnimationEnd={() => {
              if (!open && showComponent) {
                setShowComponent(false);
              }
            }}
            {...getFloatingProps()}
            {...rest}
          >
            {children}
          </FloatingComponent>
        </Scrim>
      )}
    </DialogContext.Provider>
  );
});
