import { clsx } from "clsx";
import { ForwardedRef, forwardRef } from "react";
import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";


const withBaseName = makePrefixer("saltToastClose");

export const ToastClose = forwardRef(function ToastClose(
  { className, ...restProps }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
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
