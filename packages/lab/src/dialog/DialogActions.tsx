import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import dialogActionsCss from "./DialogActions.css";

const withBaseName = makePrefixer("saltDialogActions");

export const DialogActions = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function DialogActions(props, ref) {
  const { children, className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dialog-actions",
    css: dialogActionsCss,
    window: targetWindow,
  });

  return (
    <div className={clsx(withBaseName(), className)} {...rest} ref={ref}>
      {children}
    </div>
  );
});
