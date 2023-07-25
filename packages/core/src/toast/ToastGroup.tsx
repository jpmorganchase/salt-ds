import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import toastGroupCss from "./ToastGroup.css";

const withBaseName = makePrefixer("saltToastGroup");

export interface ToastGroupProps extends ComponentPropsWithoutRef<"div"> {
  placement?: "top-right" | "bottom-right";
}

export const ToastGroup = forwardRef<HTMLDivElement, ToastGroupProps>(
  function ToastGroup(props, ref) {
    const { children, className, placement = "bottom-right" } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-toast",
      css: toastGroupCss,
      window: targetWindow,
    });

    return (
      <div className={clsx(withBaseName(), withBaseName(placement), className)}>
        <div className={withBaseName("container")}>{children}</div>
      </div>
    );
  }
);
