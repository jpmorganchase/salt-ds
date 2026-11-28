import { Button, type ButtonProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { forwardRef } from "react";

import toolbarButtonCss from "./ToolbarButton.css";

/**
 * @deprecated since 1.0.0-alpha.110. Use `Toolbar` from `@salt-ds/core` instead.
 */
export type ToolbarButtonProps = ButtonProps & {
  overflowLabel?: string;
  label?: string;
};

/**
 * @deprecated since 1.0.0-alpha.110. Use `Toolbar` from `@salt-ds/core` instead.
 */
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
