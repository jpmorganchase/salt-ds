import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import formGroupCss from "./FormGroup.css";

export interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Display group of elements in a compact row.
   */
  row?: boolean;
}

const baseName = "saltFormGroup";

export const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  function FormGroup({ className, row, ...other }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-form-group",
      css: formGroupCss,
      window: targetWindow,
    });
    return (
      <div
        className={clsx(baseName, { [`${baseName}-row`]: row }, className)}
        ref={ref}
        {...other}
      />
    );
  }
);
