import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { makePrefixer } from "../utils";

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
  },
);
