import { makePrefixer, useControlled, useId } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MutableRefObject,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  SidePanelGroupContext,
  type SidePanelGroupContextValue,
} from "./SidePanelGroupContext";

const withBaseName = makePrefixer("saltSidePanelGroup");

export interface SidePanelGroupProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SidePanelGroup = forwardRef<HTMLDivElement, SidePanelGroupProps>(
  function SidePanelGroup(props, ref) {
    const {
      children,
      className,
      open: openProp,
      defaultOpen,
      onOpenChange,
      ...rest
    } = props;

    const [open, setOpenState] = useControlled({
      default: Boolean(defaultOpen),
      controlled: openProp,
      name: "SidePanelGroup",
      state: "open",
    });
    // Generate panel ID eagerly (not effect-delayed) for immediate aria-controls availability
    const panelId = useId();
    const [activeTriggerId, setActiveTriggerId] = useState<string | undefined>(
      undefined,
    );
    const [triggerRef, setTriggerRef] = useState<
      MutableRefObject<HTMLElement | null> | undefined
    >(undefined);

    const setOpen = useCallback(
      (newOpen: boolean) => {
        setOpenState(newOpen);
        if (!newOpen) {
          setActiveTriggerId(undefined);
        }
        onOpenChange?.(newOpen);
      },
      [onOpenChange],
    );

    /**
     * Atomically activate a trigger: ensure it becomes the active trigger,
     * keep panel open (don't close/reopen), and set its ref for focus return.
     */
    const activateTrigger = useCallback(
      (
        triggerId: string,
        triggerElement: MutableRefObject<HTMLElement | null>,
      ) => {
        setActiveTriggerId(triggerId);
        setTriggerRef(triggerElement);
        // Only open if currently closed
        if (!open) {
          setOpenState(true);
          onOpenChange?.(true);
        }
      },
      [open, onOpenChange],
    );

    const contextValue = useMemo<SidePanelGroupContextValue>(
      () => ({
        open,
        setOpen,
        panelId,
        activeTriggerId,
        setActiveTriggerId,
        triggerRef,
        setTriggerRef,
        activateTrigger,
      }),
      [open, setOpen, panelId, activeTriggerId, triggerRef, activateTrigger],
    );

    return (
      <SidePanelGroupContext.Provider value={contextValue}>
        <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
          {children}
        </div>
      </SidePanelGroupContext.Provider>
    );
  },
);
