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
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
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
  children?: ReactNode;
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
  /**
   * Prevent Scrim from rendering
   * */
  disableScrim?: boolean;
  /**
   * Optional id prop
   * Used for accessibility purposes to announce the title and subtitle when using a screen reader
   * */
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
      ...rest
    } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dialog",
      css: dialogCss,
      window: targetWindow,
    });

    const id = useId(idProp);

    const currentbreakpoint = useCurrentBreakpoint();

    const [showComponent, setShowComponent] = useState(false);

    const { context, floating, elements } = useFloatingUI({
      open: showComponent,
      onOpenChange,
    });

    const { getFloatingProps } = useInteractions([
      useClick(context),
      useDismiss(context, { enabled: !disableDismiss }),
    ]);

    const { Component: FloatingComponent } = useFloatingComponent();

    const floatingRef = useForkRef<HTMLDivElement>(floating, ref);

    const timeoutId = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (open && !showComponent) {
        setShowComponent(true);
        document.documentElement.style.overflow = "hidden";
      }

      if (!open && showComponent) {
        timeoutId.current = setTimeout(() => {
          setShowComponent(false);
          document.documentElement.style.removeProperty("overflow");
        }, 300);
      }
    }, [open, showComponent]);

    useEffect(() => {
      return () => {
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }
        document.documentElement.style.removeProperty("overflow");
      };
    }, []);

    const contextValue = useMemo(() => ({ status, id }), [status, id]);

    return (
      <DialogContext.Provider value={contextValue}>
        <ConditionalScrimWrapper condition={showComponent && !disableScrim}>
          <FloatingComponent
            open={showComponent}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id}
            ref={floatingRef}
            width={elements.floating?.offsetWidth}
            height={elements.floating?.offsetHeight}
            focusManagerProps={{
              context: context,
              initialFocus,
            }}
            className={clsx(
              withBaseName(),
              withBaseName(size, currentbreakpoint),
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
