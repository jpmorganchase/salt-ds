import { Button } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import type { MouseEvent } from "react";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { useInlaidPanel } from "./InlaidPanelContext";

export type InlaidPanelCloseProps = ComponentPropsWithoutRef<"button">;

export const InlaidPanelClose = forwardRef<
  HTMLButtonElement,
  InlaidPanelCloseProps
>(function InlaidPanelClose(props, ref) {
  const { onOpenChange } = useInlaidPanel();

  const { children, onClick } = props;

  const handleOnClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    onOpenChange(false);
  };

  return (
    <Button
      ref={ref}
      aria-label="Close Drawer"
      appearance="transparent"
      onClick={handleOnClick}
      {...props}
    >
      {children || <CloseIcon aria-hidden />}
    </Button>
    // </div>
  );
});
