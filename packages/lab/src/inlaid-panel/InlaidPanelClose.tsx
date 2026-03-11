import { Button } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { useInlaidPanel } from "./InlaidPanelContext";

export type InlaidPanelCloseProps = ComponentPropsWithoutRef<"button">;

// const withBaseName = makePrefixer("saltInlaidPanelClose");

export const InlaidPanelClose = forwardRef<
  HTMLButtonElement,
  InlaidPanelCloseProps
>(function InlaidPanelClose({ children, ...props }, ref) {
  const { onOpenChange } = useInlaidPanel();
  return (
    // <div className={withBaseName("container")}>
    <Button
      ref={ref}
      aria-label="Close Drawer"
      appearance="transparent"
      // className={clsx(withBaseName(), className)}
      onClick={() => onOpenChange(false)}
      {...props}
    >
      {children || <CloseIcon aria-hidden />}
    </Button>
    // </div>
  );
});
