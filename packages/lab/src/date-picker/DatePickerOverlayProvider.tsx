import {
  type ElementProps,
  type FloatingContext,
  type OpenChangeReason as FloatingUIOpenChangeReason,
  flip,
  useClick,
  useDismiss,
  useInteractions,
} from "@floating-ui/react";
import { createContext, useControlled, useFloatingUI } from "@salt-ds/core";
import {
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFocusOut } from "./useFocusOut";
import { useKeyboard } from "./useKeyboard";

/** Reason for overlay state change, can be a custom reason */
export type DatePickerOpenChangeReason =
  | FloatingUIOpenChangeReason
  | "apply"
  | "cancel"
  | string;
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
   * @param event - event that triggered the state change
   * @param reason - reason for the the state change
   */
  setOpen: (
    newOpen: boolean,
    event?: Event,
    reason?: DatePickerOpenChangeReason,
  ) => void;
  /**~
   * Register a callback for when onDismiss is called
   * @param onDismissCallback
   */
  setOnDismiss: (onDismissCallback: (event?: Event) => void) => void;
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
   * When `open` is uncontrolled, set this to `true` to open on click
   */
  openOnClick?: boolean;
  /**
   * Handler for when open state changes
   * @param newOpen - true when opened
   * @param reason - reason for the the state change
   */
  onOpenChange?: (
    newOpen: boolean,
    reason?: DatePickerOpenChangeReason,
  ) => void;
  /**
   * The default open state of the overlay.
   */
  defaultOpen?: boolean;
  /**
   * The content to be rendered inside the overlay provider.
   */
  children: ReactNode;
  /**
   * A factory method to create a set of interaction, if provided overrides the default interactions
   */
  interactions?: (context: FloatingContext) => Array<ElementProps>;
  /**
   * When true, shouldn't open the overlay.
   */
  readOnly?: boolean;
}

export const DatePickerOverlayProvider: React.FC<
  DatePickerOverlayProviderProps
> = ({
  open: openProp,
  openOnClick,
  defaultOpen,
  onOpenChange,
  children,
  interactions,
  readOnly,
}) => {
  const [open, setOpenState, isOpenControlled] = useControlled({
    controlled: openProp,
    default: Boolean(defaultOpen),
    name: "DatePicker",
    state: "openDatePickerOverlay",
  });
  const [disableFocus, setDisableFocus] = useState<boolean>(true);
  const triggeringElementRef = useRef<HTMLElement | null>(null);
  const onDismissCallback = useRef<(event?: Event) => void>();
  const handleOpenChange = useCallback(
    (newOpen: boolean, _event?: Event, reason?: DatePickerOpenChangeReason) => {
      if (newOpen) {
        if (readOnly) {
          return;
        }
        triggeringElementRef.current = document.activeElement as HTMLElement;
        setDisableFocus(reason === "click"); // prevent the overlay taking focus on click
      } else if (!isOpenControlled) {
        const trigger = triggeringElementRef.current as HTMLElement;
        if (trigger) {
          trigger.focus();
        }
        if (trigger instanceof HTMLInputElement) {
          setTimeout(() => {
            trigger.setSelectionRange(0, trigger.value.length);
          }, 1);
        }
        triggeringElementRef.current = null;
      }
      setOpenState(newOpen);
      onOpenChange?.(newOpen, reason);

      if (
        reason === "escape-key" ||
        (reason === "outside-press" && onDismissCallback.current)
      ) {
        onDismissCallback?.current?.();
      }
    },
    [onOpenChange, readOnly],
  );

  const openState = open && !readOnly;
  const floatingUIResult = useFloatingUI({
    open: openState,
    onOpenChange: handleOpenChange,
    placement: "bottom-start",
    middleware: [flip({ fallbackStrategy: "initialPlacement" })],
  });

  const onFocusOut = useCallback(
    (event: FocusEvent) => {
      handleOpenChange(false, event, "focus-out");
    },
    [handleOpenChange],
  );

  const {
    getFloatingProps: getFloatingPropsCallback,
    getReferenceProps: getReferencePropsCallback,
  } = useInteractions(
    interactions
      ? interactions(floatingUIResult.context)
      : [
          useDismiss(floatingUIResult.context, {}),
          useKeyboard(floatingUIResult.context, {
            enabled: !readOnly,
          }),
          useFocusOut(floatingUIResult.context, {
            enabled: !readOnly,
            onFocusOut,
            outsidePress: (event) => {
              const target = event.target as Node;
              return !(
                target instanceof Element &&
                target.closest("[data-floating-ui-focusable]")
              );
            },
          }),
          useClick(floatingUIResult.context, {
            enabled: !!openOnClick && !readOnly,
            toggle: false,
            keyboardHandlers: false,
          }),
        ],
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
        focusManagerProps: {
          disabled: disableFocus,
          returnFocus: false,
          context: floatingUIResult.context,
          initialFocus: 4,
        },
      };
    },
    [getFloatingPropsCallback, floatingUIResult, disableFocus],
  );
  const setOnDismiss = useCallback(
    (dismissCallback: (event?: Event) => void) => {
      onDismissCallback.current = dismissCallback;
    },
    [],
  );

  const state: DatePickerOverlayState = useMemo(
    () => ({
      open: openState,
      floatingUIResult,
    }),
    [open, floatingUIResult],
  );

  const helpers: DatePickerOverlayHelpers = useMemo(
    () => ({
      getFloatingProps,
      getReferenceProps: getReferencePropsCallback,
      setOpen: handleOpenChange,
      setOnDismiss,
    }),
    [getFloatingProps, getReferencePropsCallback, handleOpenChange],
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
