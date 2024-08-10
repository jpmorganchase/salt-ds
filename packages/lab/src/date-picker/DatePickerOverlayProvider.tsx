import { flip, useDismiss, useInteractions } from "@floating-ui/react";
import { createContext, useControlled, useFloatingUI } from "@salt-ds/core";
import { type ReactNode, useCallback, useContext, useMemo } from "react";

interface DatePickerOverlayState {
  open: boolean;
  floatingUIResult: ReturnType<typeof useFloatingUI>;
}

interface DatePickerOverlayHelpers {
  getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];
  getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
  setOpen: (newOpen: boolean) => void;
}

interface DatePickerOverlayContextType {
  state: DatePickerOverlayState;
  helpers: DatePickerOverlayHelpers;
}

const DatePickerOverlayContext = createContext<
  DatePickerOverlayContextType | undefined
>("DatePickerOverlayContext", undefined);

interface DatePickerOverlayProviderProps {
  open?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}
export const DatePickerOverlayProvider: React.FC<
  DatePickerOverlayProviderProps
> = ({ open: openProp, defaultOpen, children }) => {
  const [open, setOpen] = useControlled({
    controlled: openProp,
    default: Boolean(defaultOpen),
    name: "DatePicker",
    state: "openDatePickerOverlay",
  });

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
  const getFloatingPropsCallback = useMemo(() => _getFloatingPropsCallback, []);
  const getReferenceProps = useMemo(() => _getReferenceProps, []);

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
