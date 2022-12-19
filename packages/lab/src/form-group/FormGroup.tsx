import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";

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
        className={cx(baseName, { [`${baseName}-row`]: row }, className)}
        ref={ref}
        {...other}
      />
    );
  }
);
