// TODO Label positioning
import React, { forwardRef, LabelHTMLAttributes, ReactNode } from "react";
import classnames from "classnames";

import "./ControlLabel.css";

export interface ControlLabelProps
  extends LabelHTMLAttributes<HTMLLabelElement> {
  disabled?: boolean;
  label?: ReactNode;
  labelPlacement?: "left" | "right";
}

export const baseName = "saltControlLabel";

export const ControlLabel = forwardRef<HTMLLabelElement, ControlLabelProps>(
  (
    { children, className, disabled, label, labelPlacement = "left", ...other },
    ref
  ) => {
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
        {labelPlacement === "left" && (
          <span className={`${baseName}-label`}>{label}</span>
        )}
        {children}
        {labelPlacement === "right" && (
          <span className={`${baseName}-labelRight`}>{label}</span>
        )}
      </label>
    );
  }
);
