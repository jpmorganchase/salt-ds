// TODO Label positioning
import React, { forwardRef, LabelHTMLAttributes, ReactNode } from "react";
import classnames from "classnames";

import "./ControlLabel.css";

export type ControlLabelPlacement = "left" | "right";
export interface ControlLabelProps
  extends LabelHTMLAttributes<HTMLLabelElement> {
  disabled?: boolean;
  label?: ReactNode;
  labelPlacement?: ControlLabelPlacement;
}

export const baseName = "uitkControlLabel";

export const ControlLabel = forwardRef<HTMLLabelElement, ControlLabelProps>(
  (
    {
      children,
      className,
      disabled,
      label,
      labelPlacement = "right",
      ...other
    },
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
          <span className={`${baseName}-labelLeft`}>{label}</span>
        )}
        {children}
        {labelPlacement === "right" && (
          <span className={`${baseName}-label`}>{label}</span>
        )}
      </label>
    );
  }
);
