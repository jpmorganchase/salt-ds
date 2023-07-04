import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import toastContentCss from "./ToastContent.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

const withBaseName = makePrefixer("saltToastContent");

export const ToastContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(function BannerContent(props, ref) {
  const { className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toast-content",
    css: toastContentCss,
    window: targetWindow,
  });

  return (
    <div className={clsx(withBaseName(), className)} {...rest} ref={ref} />
  );
});
