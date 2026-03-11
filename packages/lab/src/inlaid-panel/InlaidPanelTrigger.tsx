import { Button, useForkRef } from "@salt-ds/core";
import { type ComponentPropsWithoutRef, forwardRef, useRef } from "react";
import { useInlaidPanel } from "./InlaidPanelContext";

export type InlaidPanelTriggerProps = ComponentPropsWithoutRef<"button">;

export const InlaidPanelTrigger = forwardRef<
  HTMLButtonElement,
  InlaidPanelTriggerProps
>(function InlaidPanelTrigger({ children, onClick, ...props }, forwardedRef) {
  const { open, onOpenChange, panelId, setLastTrigger } = useInlaidPanel();
  const ref = useRef<HTMLButtonElement>(null);
  const handleRef = useForkRef(ref, forwardedRef);

  return (
    <Button
      ref={handleRef}
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) {
          return;
        }
        setLastTrigger(ref.current);
        onOpenChange(!open);
      }}
      {...props}
    >
      {children}
    </Button>
  );
});
