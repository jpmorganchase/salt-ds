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
import { useWindow } from "@salt-ds/window";
import {
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
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
   * If `true`, the overlay contains the active element
   */
  focused: boolean;
  /**
   * The result of the floating UI calculations.
   */
  floatingUIResult: ReturnType<typeof useFloatingUI>;
  /**
   * Ref to attach to the initially focused element, when the overlay is opened.
   */
  initialFocusRef?: React.MutableRefObject<HTMLElement | null>;
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
   * If `true`, the overlay is disabled.
   */
  disabled?: boolean;
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
  disabled,
  open: openProp,
  openOnClick,
  defaultOpen,
  onOpenChange,
  children,
  interactions,
  readOnly,
}) => {
  const targetWindow = useWindow();
  const targetDocument = targetWindow?.document;
  const [open, setOpenState, isOpenControlled] = useControlled({
    controlled: openProp,
    default: Boolean(defaultOpen),
    name: "DatePicker",
    state: "openDatePickerOverlay",
  });
  const triggeringElementRef = useRef<HTMLElement | null>(null);
  const initialFocusRef = useRef<HTMLElement | null>(null);
  const selectionTimeoutRef = useRef<
    { id: number; window: Window } | undefined
  >();
  const blurTimeoutRef = useRef<{ id: number; window: Window } | undefined>();
  const [focused, setFocused] = useState(false);
  const onDismissCallback = useRef<(event?: Event) => void>();
  const handleOpenChange = useCallback(
    (newOpen: boolean, _event?: Event, reason?: DatePickerOpenChangeReason) => {
      if (newOpen) {
        if (readOnly) {
          return;
        }
        if (selectionTimeoutRef.current) {
          selectionTimeoutRef.current.window.clearTimeout(
            selectionTimeoutRef.current.id,
          );
          selectionTimeoutRef.current = undefined;
        }
        triggeringElementRef.current =
          (targetDocument?.activeElement as HTMLElement | null) ?? null;
        setFocused(true);
      } else if (!isOpenControlled && reason !== "focus-out") {
        const trigger = triggeringElementRef.current as HTMLElement;
        if (trigger) {
          trigger.focus();
          const triggerWindow = trigger.ownerDocument.defaultView;
          const InputConstructor = triggerWindow?.HTMLInputElement;
          if (
            triggerWindow &&
            InputConstructor &&
            trigger instanceof InputConstructor
          ) {
            selectionTimeoutRef.current = {
              window: triggerWindow,
              id: triggerWindow.setTimeout(() => {
                selectionTimeoutRef.current = undefined;
                trigger.setSelectionRange(0, trigger.value.length);
              }, 1),
            };
          }
        }
        triggeringElementRef.current = null;
      }
      setOpenState(newOpen);
      onOpenChange?.(newOpen, reason);

      if (
        reason === "focus-out" ||
        reason === "escape-key" ||
        (reason === "outside-press" && onDismissCallback.current)
      ) {
        onDismissCallback?.current?.();
      }
    },
    [isOpenControlled, onOpenChange, readOnly, targetDocument],
  );

  const openState = open && !readOnly;
  const floatingUIResult = useFloatingUI({
    open: openState,
    onOpenChange: handleOpenChange,
    placement: "bottom-start",
    middleware: [flip({ fallbackStrategy: "initialPlacement" })],
  });

  const floatingRef = floatingUIResult.refs.floating;
  const handleContainerBlur = useCallback(() => {
    if (blurTimeoutRef.current) {
      blurTimeoutRef.current.window.clearTimeout(blurTimeoutRef.current.id);
      blurTimeoutRef.current = undefined;
    }
    const floatingElement = floatingRef.current;
    const floatingWindow =
      floatingElement?.ownerDocument.defaultView ?? targetWindow;
    if (!floatingWindow) return;

    blurTimeoutRef.current = {
      window: floatingWindow,
      id: floatingWindow.setTimeout(() => {
        blurTimeoutRef.current = undefined;
        setFocused(
          !!floatingRef.current?.contains(
            floatingWindow.document.activeElement,
          ),
        );
      }, 0),
    };
  }, [floatingRef, targetWindow]);

  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) {
        selectionTimeoutRef.current.window.clearTimeout(
          selectionTimeoutRef.current.id,
        );
      }
      if (blurTimeoutRef.current) {
        blurTimeoutRef.current.window.clearTimeout(blurTimeoutRef.current.id);
      }
    };
  }, []);

  const defaultInteractions = [
    useDismiss(floatingUIResult.context, {}),
    useKeyboard(floatingUIResult.context, {
      enabled: !readOnly,
      onArrowDown: (event) => {
        handleOpenChange(true, event.nativeEvent, "reference-press");
      },
    }),
    useClick(floatingUIResult.context, {
      enabled: !disabled && !!openOnClick && !readOnly,
      toggle: false,
      keyboardHandlers: false,
    }),
    useFocusOut(floatingUIResult.context, {
      enabled: !readOnly,
    }),
  ];

  const {
    getFloatingProps: getFloatingPropsCallback,
    getReferenceProps: getReferencePropsCallback,
  } = useInteractions(
    interactions ? interactions(floatingUIResult.context) : defaultInteractions,
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
          returnFocus: false,
          context: floatingUIResult.context,
          initialFocus: initialFocusRef,
        },
      };
    },
    [getFloatingPropsCallback, floatingUIResult],
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
      focused,
      floatingUIResult,
      initialFocusRef,
    }),
    [focused, openState, floatingUIResult],
  );

  const helpers: DatePickerOverlayHelpers = useMemo(
    () => ({
      getFloatingProps,
      getReferenceProps: getReferencePropsCallback,
      setOpen: handleOpenChange,
      setOnDismiss,
    }),
    [
      getFloatingProps,
      getReferencePropsCallback,
      handleOpenChange,
      setOnDismiss,
    ],
  );
  const contextValue = useMemo(() => ({ state, helpers }), [state, helpers]);

  return (
    <DatePickerOverlayContext.Provider value={contextValue}>
      <div onBlur={handleContainerBlur}>{children}</div>
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
