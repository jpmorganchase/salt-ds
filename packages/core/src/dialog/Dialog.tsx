import {
  type FloatingFocusManager,
  useClick,
  useDismiss,
  useInteractions,
} from "@floating-ui/react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentProps,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Scrim } from "../scrim";
import type { ValidationStatus } from "../status-indicator";
import {
  makePrefixer,
  useCurrentBreakpoint,
  useFloatingComponent,
  useFloatingUI,
  useForkRef,
  useId,
} from "../utils";
import dialogCss from "./Dialog.css";
import { DialogContext } from "./DialogContext";

interface ConditionalScrimWrapperProps {
  /**
   * The content to wrap.
   */
  children?: ReactNode;
  /**
   * If `true`, `children` are wrapped in a fixed `Scrim`.
   */
  condition: boolean;
}

export const ConditionalScrimWrapper = ({
  condition,
  children,
}: ConditionalScrimWrapperProps) => {
  return condition ? <Scrim fixed>{children}</Scrim> : <>{children} </>;
};

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * If `true`, the Dialog is shown. Use with `onOpenChange` to control it.
   */
  open?: boolean;
  /**
   * Callback fired when the open state changes, for example when the user
   * presses the Escape key or clicks outside the Dialog.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * The status of the Dialog.
   */
  status?: ValidationStatus;
  /**
   * The element that receives focus when the Dialog opens: the index of a
   * tabbable element inside the Dialog, in tab order, or a ref to an element.
   * @default 0
   */
  initialFocus?: ComponentProps<typeof FloatingFocusManager>["initialFocus"];
  /**
   * Size of the Dialog.
   */
  size?: "small" | "medium" | "large";
  /**
   * If `true`, the Dialog doesn't close when the user clicks outside it.
   */
  disableDismiss?: boolean;
  /**
   * If `true`, the `Scrim` isn't rendered.
   */
  disableScrim?: boolean;
  /**
   * Optional id prop.
   * Used for accessibility purposes to announce the title and subtitle when using a screen reader.
   * @deprecated since 1.58.0. IDs are now auto-generated internally for proper ARIA labeling.
   */
  idProp?: string;
}

const withBaseName = makePrefixer("saltDialog");

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  function Dialog(props, ref) {
    const {
      children,
      className,
      open = false,
      onOpenChange,
      status,
      disableDismiss,
      size = "medium",
      disableScrim,
      idProp,
      initialFocus,
      id,
      "aria-labelledby": ariaLabelledBy,
      ...rest
    } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog",
      css: dialogCss,
      window: targetWindow,
    });

    const dialogId = useId(id);
    const currentBreakpoint = useCurrentBreakpoint();

    const [showComponent, setShowComponent] = useState(false);
    const [headerId, setHeaderId] = useState(idProp);

    const { context, floating, elements } = useFloatingUI({
      open: showComponent,
      onOpenChange,
    });

    const { getFloatingProps } = useInteractions([
      useClick(context),
      useDismiss(context, { outsidePress: !disableDismiss }),
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
    }, [open, showComponent]);

    const contextValue = useMemo(
      () => ({ status, id: headerId, setId: setHeaderId, dialogId }),
      [status, headerId, dialogId],
    );

    return (
      <DialogContext.Provider value={contextValue}>
        <ConditionalScrimWrapper condition={showComponent && !disableScrim}>
          <FloatingComponent
            id={dialogId}
            open={showComponent}
            role="dialog"
            aria-modal="true"
            aria-labelledby={clsx(ariaLabelledBy, headerId) || undefined}
            ref={floatingRef}
            width={elements.floating?.offsetWidth}
            height={elements.floating?.offsetHeight}
            lockScroll
            focusManagerProps={{
              context: context,
              initialFocus,
              outsideElementsInert: true,
            }}
            className={clsx(
              withBaseName(),
              withBaseName(size, currentBreakpoint),
              {
                [withBaseName("enterAnimation")]: open,
                [withBaseName("exitAnimation")]: !open,
                [withBaseName(status as string)]: status,
              },
              className,
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
        </ConditionalScrimWrapper>
      </DialogContext.Provider>
    );
  },
);
