import { ElementType, forwardRef } from "react";
import { Button, ButtonProps, polymorphicRef } from "@jpmorganchase/uitk-core";
import "./ToolbarButton.css";

export type ToolbarButtonProps<T extends ElementType = "button"> =
  ButtonProps<T> & {
    label?: string;
  };

export const ToolbarButton = forwardRef(function ToolbarButton<
  T extends ElementType = "button"
>({ label, ...props }: ToolbarButtonProps<T>, forwardedRef: polymorphicRef<T>) {
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
