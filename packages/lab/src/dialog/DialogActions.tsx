import { forwardRef, HTMLAttributes } from "react";
import classnames from "classnames";
import { makePrefixer } from "@salt-ds/core";

import "./DialogActions.css";

export interface DialogActionsProps extends HTMLAttributes<HTMLDivElement> {}

const withBaseName = makePrefixer("saltDialogActions");

export const DialogActions = forwardRef<HTMLDivElement, DialogActionsProps>(
  function DialogActions(props, ref) {
    const { className, children, ...rest } = props;

    return (
      <div
        {...rest}
        className={classnames(withBaseName(), className)}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);
