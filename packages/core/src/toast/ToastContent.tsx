import { clsx } from "clsx";
import {
  ComponentPropsWithoutRef,
  ForwardedRef,
  forwardRef,
  ReactNode,
} from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer } from "../utils";

import toastContentCss from "./ToastContent.css";

const withBaseName = makePrefixer("saltToastContent");

export interface ToastContentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of Toast Content
   */
  children?: ReactNode;
}

export const ToastContent = forwardRef(function ToastContent(
  { children, className, ...restProps }: ToastContentProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toast-content",
    css: toastContentCss,
    window: targetWindow,
  });

  return (
    <div className={clsx(withBaseName(), className)} {...restProps} ref={ref}>
      {children}
    </div>
  );
});
