import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";

import "./FormGroup.css";

export interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Display group of elements in a compact row.
   */
  row?: boolean;
}

const baseName = "saltFormGroup";

export const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  function FormGroup({ className, row, ...other }, ref) {
    return (
      <div
        className={clsx(baseName, { [`${baseName}-row`]: row }, className)}
        ref={ref}
        {...other}
      />
    );
  }
);
