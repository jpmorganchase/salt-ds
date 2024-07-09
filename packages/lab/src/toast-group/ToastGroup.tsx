import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import toastGroupCss from "./ToastGroup.css";

const withBaseName = makePrefixer("saltToastGroup");

export interface ToastGroupProps extends ComponentPropsWithoutRef<"div"> {
  placement?: "top-right" | "bottom-right";
}

export const ToastGroup = forwardRef<HTMLDivElement, ToastGroupProps>(
  function ToastGroup(props, ref) {
    const { children, className, placement = "bottom-right", ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-toast",
      css: toastGroupCss,
      window: targetWindow,
    });

    return (
      <div
        className={clsx(withBaseName(), withBaseName(placement), className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
