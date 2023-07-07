import { clsx } from "clsx";
import { ForwardedRef, forwardRef } from "react";
import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import toastCloseCss from "./ToastClose.css";

const withBaseName = makePrefixer("saltToastClose");

export const ToastClose = forwardRef(function ToastClose(
  { className, ...restProps }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toast-close",
    css: toastCloseCss,
    window: targetWindow,
  });

  return (
    <Button
      variant="secondary"
      className={clsx(withBaseName(), className)}
      {...restProps}
      ref={ref}
    >
      <CloseIcon />
    </Button>
  );
});
