import { Button, useForkRef, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { type ComponentPropsWithoutRef, forwardRef, useRef } from "react";
import { useInlaidPanel } from "./InlaidPanelContext";

export type InlaidPanelTriggerProps = ComponentPropsWithoutRef<"button">;

export const InlaidPanelTrigger = forwardRef<
  HTMLButtonElement,
  InlaidPanelTriggerProps
>(function InlaidPanelTrigger({ children, ...props }, forwardedRef) {
  const { open, onOpenChange, panelId, triggerRef } = useInlaidPanel();
  const ref = useRef<HTMLButtonElement>(null);
  const handleRef = useForkRef(ref, forwardedRef);

  useIsomorphicLayoutEffect(() => {
    triggerRef.current = ref.current;
    return () => {
      triggerRef.current = null;
    };
  }, [triggerRef]);

  return (
    <Button
      ref={handleRef}
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      onClick={() => onOpenChange(!open)}
      {...props}
    >
      {children}
    </Button>
  );
});
