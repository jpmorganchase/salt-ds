import { forwardRef, Ref } from "react";
import { Button, ButtonProps } from "@jpmorganchase/uitk-core";
import "./ToolbarButton.css";

export type ToolbarButtonProps = ButtonProps & {
  label?: string;
};

export const ToolbarButton = forwardRef(function ToolbarButton(
  { label, ...props }: ToolbarButtonProps,
  forwardedRef: Ref<HTMLButtonElement>
) {
  return (
    <Button
      variant="secondary"
      {...props}
      className="uitkToolbarButton"
      data-overflow-label={label}
      ref={forwardedRef}
    />
  );
});
