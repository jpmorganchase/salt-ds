import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { useInlaidPanel } from "./InlaidPanelContext";

export type InlaidPanelCloseProps = ComponentPropsWithoutRef<"button">;

export const InlaidPanelClose = forwardRef<
  HTMLButtonElement,
  InlaidPanelCloseProps
>(function InlaidPanelClose({ children, ...props }, ref) {
  const { onOpenChange } = useInlaidPanel();
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpenChange(false)}
      {...props}
    >
      {children}
    </button>
  );
});
