// TODO Label positioning
import React, { forwardRef, LabelHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import controlLabelCss from "./ControlLabel.css";

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
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-control-label",
      css: controlLabelCss,
      window: targetWindow,
    });

    return (
      <label
        className={clsx(
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
