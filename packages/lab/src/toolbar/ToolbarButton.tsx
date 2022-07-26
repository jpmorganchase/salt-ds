import { ElementType, forwardRef } from "react";
import { Button, ButtonProps, polymorphicRef } from "@jpmorganchase/uitk-core";
// import { useToolbarContext } from "./ToolbarContext";
import "./ToolbarButton.css";

export type ToolbarButtonProps<T extends ElementType = "button"> =
  ButtonProps<T> & {
    label?: string;
  };

export const ToolbarButton = forwardRef(function ToolbarButton<
  T extends ElementType = "button"
>({ label, ...props }: ToolbarButtonProps<T>, forwardedRef: polymorphicRef<T>) {
  // const { isInOverflowPanel } = useToolbarContext();
  // const inOverflowPanel = isInOverflowPanel(props.id);
  return (
    <Button
      {...props}
      data-overflow-label={label}
      ref={forwardedRef}
      variant="secondary"
    />
  );
});
