import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import dialogActionsCss from "./DialogActions.css";

const withBaseName = makePrefixer("saltDialogActions");

export interface DialogActionsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of Dialog Actions
   */
  children?: ReactNode;
}

export const DialogActions = forwardRef<HTMLDivElement, DialogActionsProps>(
  function DialogActions(props, ref) {
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
  }
);
