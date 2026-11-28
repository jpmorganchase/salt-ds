import { Button, type ButtonProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef } from "react";

import toolbarButtonCss from "./ToolbarButton.css";

export type ToolbarButtonProps = ButtonProps & {
  label?: string;
};

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton({ className, label, ...props }, forwardedRef) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-toolbar-button",
      css: toolbarButtonCss,
      window: targetWindow,
    });

    return (
      <Button
        variant="secondary"
        {...props}
        className={clsx("saltToolbarButton", className)}
        data-overflow-label={label}
        ref={forwardedRef}
      />
    );
  },
);
