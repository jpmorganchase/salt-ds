import { clsx } from "clsx";
import { ComponentPropsWithoutRef, ForwardedRef, forwardRef } from "react";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import toastContentCss from "./ToastContent.css";

const withBaseName = makePrefixer("saltToastContent");

export const ToastContent = forwardRef(function ToastContent(
  { children, className, ...restProps }: ComponentPropsWithoutRef<"div">,
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
