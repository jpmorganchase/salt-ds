import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import dialogNextActionsCss from "./DialogNextActions.css";

const withBaseName = makePrefixer("saltDialogNextActions");

export const DialogNextActions = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function DialogNextActions(props, ref) {
  const { children, className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dialog-next-actions",
    css: dialogNextActionsCss,
    window: targetWindow,
  });

  return (
    <div className={clsx(withBaseName(), className)} {...rest} ref={ref}>
      {children}
    </div>
  );
});
