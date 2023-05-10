import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import dialogActionsCss from "./DialogActions.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

export interface DialogActionsProps extends HTMLAttributes<HTMLDivElement> {}

const withBaseName = makePrefixer("saltDialogActions");

export const DialogActions = forwardRef<HTMLDivElement, DialogActionsProps>(
  function DialogActions(props, ref) {
    const { window: targetWindow } = useWindow();
    useComponentCssInjection({
      id: "salt-dialog-actions",
      css: dialogActionsCss,
      window: targetWindow,
    });
    const { className, children, ...rest } = props;

    return (
      <div {...rest} className={clsx(withBaseName(), className)} ref={ref}>
        {children}
      </div>
    );
  }
);
