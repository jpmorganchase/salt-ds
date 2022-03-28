// TODO Label positioning
import React, { forwardRef, LabelHTMLAttributes, ReactNode } from "react";
import classnames from "classnames";

import "./ControlLabel.css";

export interface ControlLabelProps
  extends LabelHTMLAttributes<HTMLLabelElement> {
  disabled?: boolean;
  label?: ReactNode;
}

export const baseName = "uitkControlLabel";

export const ControlLabel = forwardRef<HTMLLabelElement, ControlLabelProps>(
  ({ children, className, disabled, label, ...other }, ref) => {
    return (
      <label
        className={classnames(
          baseName,
          {
            [`${baseName}-disabled`]: disabled,
          },
          className
        )}
        ref={ref}
        {...other}
      >
        <span className={`${baseName}-label`}>{label}</span>
        {children}
      </label>
    );
  }
);
