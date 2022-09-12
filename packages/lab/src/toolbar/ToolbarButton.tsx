import { forwardRef } from "react";
import { Button, ButtonProps } from "@jpmorganchase/uitk-core";
import "./ToolbarButton.css";

export type ToolbarButtonProps = ButtonProps & {
  overflowLabel?: string;
  label?: string;
};

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton({ label, ...props }, forwardedRef) {
    return (
      <Button
        variant="secondary"
        {...props}
        className="uitkToolbarButton"
        data-overflow-label={label}
        ref={forwardedRef}
      />
    );
  }
);
