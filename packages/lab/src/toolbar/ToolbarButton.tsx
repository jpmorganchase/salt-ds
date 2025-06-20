import { Button, type ButtonProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { forwardRef } from "react";

import toolbarButtonCss from "./ToolbarButton.css";

export type ToolbarButtonProps = ButtonProps & {
  overflowLabel?: string;
  label?: string;
};

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton({ label, ...props }, forwardedRef) {
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
        className="saltToolbarButton"
        data-overflow-label={label}
        ref={forwardedRef}
      />
    );
  },
);
