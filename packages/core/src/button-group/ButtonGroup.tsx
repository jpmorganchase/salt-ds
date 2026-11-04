import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import buttonGroupCss from "./ButtonGroup.css";

export interface ButtonGroupProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltButtonGroup");

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup({ className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-button-group",
      css: buttonGroupCss,
      window: targetWindow,
    });

    return (
      <div
        role="group"
        className={clsx(withBaseName(), className)}
        {...rest}
        ref={ref}
      />
    );
  },
);
