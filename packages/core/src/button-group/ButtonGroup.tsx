import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import buttonGroupCss from "./ButtonGroup.css";

export interface ButtonGroupProps extends ComponentPropsWithoutRef<"div"> {}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(props, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-button-group",
      css: buttonGroupCss,
      window: targetWindow,
    });

    return <div role="group" {...props} ref={ref} />;
  },
);
