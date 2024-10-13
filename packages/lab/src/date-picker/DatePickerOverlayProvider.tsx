import {
  flip,
  OpenChangeReason,
  useDismiss,
  useInteractions
} from "@floating-ui/react";
import { createContext, useControlled, useFloatingUI } from "@salt-ds/core";
import {
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

/**
 * Interface representing the state for a DatePicker overlay.
 */
interface DatePickerOverlayState {
  /**
   * If `true`, the overlay is open.
   */
  open: boolean;
  /**
   * The result of the floating UI calculations.
   */
  floatingUIResult: ReturnType<typeof useFloatingUI>;
}

/**
 * Interface representing the helper functions for a DatePicker overlay.
 */
interface DatePickerOverlayHelpers {
  /**
   * Function to get the props for the floating element.
   */
  getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];
  /**
   * Function to get the props for the reference element.
   */
  getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
  /**
   * Sets the open state of the overlay.
   * @param newOpen - The new value for the open state.
   */
  setOpen: (newOpen: boolean) => void;
  /**~
   * Register a callback for when onDismiss is called
   * @param onDismissCallback
   */
  setOnDismiss: (onDismissCallback:() => void) => void;
}

/**
 * Interface representing the context type for a DatePicker overlay.
 */
interface DatePickerOverlayContextType {
  /**
   * The state of the DatePicker overlay.
   */
  state: DatePickerOverlayState;
  /**
   * The helper functions for the DatePicker overlay.
   */
  helpers: DatePickerOverlayHelpers;
}

/**
 * Context for the DatePicker overlay.
 */
const DatePickerOverlayContext = createContext<
  DatePickerOverlayContextType | undefined
>("DatePickerOverlayContext", undefined);

/**
 * Props for the DatePickerOverlayProvider component.
 */
interface DatePickerOverlayProviderProps {
  /**
   * If `true`, the overlay is open.
   */
  open?: boolean;
  /**
   * Handler for when open state changes
   * @param newOpen - true when opened
   */
  onOpen?: (newOpen:boolean) => void
  /**
   * The default open state of the overlay.
   */
  defaultOpen?: boolean;
  /**
   * The content to be rendered inside the overlay provider.
   */
  children: ReactNode;
}

export const DatePickerOverlayProvider: React.FC<
  DatePickerOverlayProviderProps
> = ({ open: openProp, defaultOpen, onOpen, children }) => {
  const [open, setOpenState] = useControlled({
    controlled: openProp,
    default: Boolean(defaultOpen),
    name: "DatePicker",
    state: "openDatePickerOverlay",
  });
  const triggeringElement = useRef<HTMLElement | null>(null);
  const onDismissCallback = useRef<() => void>();

  useEffect(() => {
    if (!open) {
      const trigger = triggeringElement.current as HTMLElement;
      if (trigger) {
        trigger.focus();
      }
      if (trigger instanceof HTMLInputElement) {
        setTimeout(() => {
          trigger.setSelectionRange(0, trigger.value.length);
        }, 0);
      }
      triggeringElement.current = null;
    }
  }, [open]);

  const setOpen = useCallback((newOpen: boolean, _event?: Event | undefined, reason?: OpenChangeReason | undefined) => {
    if (newOpen) {
      triggeringElement.current = document.activeElement as HTMLElement;
    }
    setOpenState(newOpen);
    onOpen?.(newOpen);
    if (
      reason === "escape-key" ||
      (reason === "outside-press" && onDismissCallback.current)
    ) {
      onDismissCallback?.current?.();
    }
  }, [onOpen]);

  const floatingUIResult = useFloatingUI({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    middleware: [flip({ fallbackStrategy: "initialPlacement" })],
  });

  const {
    getFloatingProps: _getFloatingPropsCallback,
    getReferenceProps: _getReferenceProps,
  } = useInteractions([useDismiss(floatingUIResult.context)]);
  const getFloatingPropsCallback = useMemo(
    () => _getFloatingPropsCallback,
    [_getFloatingPropsCallback],
  );
  const getReferenceProps = useMemo(
    () => _getReferenceProps,
    [_getReferenceProps],
  );

  const getFloatingProps = useCallback(
    (userProps: React.HTMLProps<HTMLElement> | undefined) => {
      const { x, y, strategy, elements } = floatingUIResult;
      return {
        top: y ?? 0,
        left: x ?? 0,
        position: strategy,
        width: elements.floating?.offsetWidth,
        height: elements.floating?.offsetHeight,
        ...getFloatingPropsCallback(userProps),
      };
    },
    [getFloatingPropsCallback, floatingUIResult],
  );
  const setOnDismiss = useCallback((dismissCallback:() => void) => {
    onDismissCallback.current = dismissCallback;
  }, []);

  const state: DatePickerOverlayState = useMemo(
    () => ({
      open,
      floatingUIResult,
    }),
    [open, floatingUIResult],
  );

  const helpers: DatePickerOverlayHelpers = useMemo(
    () => ({
      getFloatingProps,
      getReferenceProps,
      setOpen,
      setOnDismiss
    }),
    [getFloatingProps, getReferenceProps, setOpen],
  );
  const contextValue = useMemo(() => ({ state, helpers }), [state, helpers]);

  return (
    <DatePickerOverlayContext.Provider value={contextValue}>
      {children}
    </DatePickerOverlayContext.Provider>
  );
};

export const useDatePickerOverlay = (): DatePickerOverlayContextType => {
  const context = useContext(DatePickerOverlayContext);
  if (!context) {
    throw new Error(
      "useDatePickerOverlay must be used within a DatePickerOverlayProvider",
    );
  }
  return context;
};
