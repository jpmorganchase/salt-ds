import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";

import formGroupCss from "./FormGroup.css";

/**
 * @deprecated since 1.0.0-alpha.110. Use `StackLayout` from `@salt-ds/core` instead.
 */
export interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Display group of elements in a compact row.
   */
  row?: boolean;
}

const baseName = "saltFormGroup";

/**
 * @deprecated since 1.0.0-alpha.110. Use `StackLayout` from `@salt-ds/core` instead.
 */
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
  },
);
