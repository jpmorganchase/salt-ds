import { clsx } from "clsx";
import { ForwardedRef, forwardRef, HTMLAttributes, useMemo } from "react";
import { makePrefixer, useId, capitalize } from "@salt-ds/core";
import { FormFieldContextNext } from "../form-field-context";
import { FormFieldLabel } from "./FormFieldLabel";
import { FormFieldHelperText } from "./FormFieldHelperText";

import "./FormFieldNext.css";

export type FormFieldLabelPlacement = "top" | "left";

export interface FormFieldProps
  extends HTMLAttributes<HTMLDivElement>,
    A11yValueProps {
  /**
   * Disabled prop
   */
  disabled?: boolean;
  /**
   * The helper text content
   */
  helperText?: string;
  /**
   * The label value for the FormField
   */
  label?: string;
  /**
   * Location the label, values: 'top' (default) or 'left'
   */
  labelPlacement?: FormFieldLabelPlacement;
  /**
   * Readonly prop
   */
  readOnly?: boolean;
  /**
   * Optional id prop
   */
  id?: string;
}

export interface A11yValueProps {
  /**
   * If `true`, the FormField will be disabled.
   */
  disabled?: boolean;
  /** Helper Text */
  helperTextId?: string;
  /** id of the label node */
  labelId?: string;
  /**
   * If `true`, the FormField will be readonly.
   */
  readOnly?: boolean;
  /**
   * Validation status.
   */
  validationStatus?: "error" | "warning";

}
export interface useA11yValueValue {
  "aria-labelledby": A11yValueProps["labelId"];
  "aria-describedby": A11yValueProps["helperTextId"] | undefined;
  disabled: A11yValueProps["disabled"];
  readOnly: A11yValueProps["readOnly"];
}

const useA11yValue = ({
  disabled,
  labelId,
  helperTextId,
  readOnly,
}: A11yValueProps) => {
  return useMemo(
    () => ({
      "aria-labelledby": labelId,
      "aria-describedby": helperTextId,
      disabled,
      readOnly,
    }),
    [labelId, disabled, helperTextId, readOnly]
  );
};

const withBaseName = makePrefixer("saltFormFieldNext");

export const FormField = forwardRef(
  (
    {
      children,
      className,
      disabled = false,
      helperText,
      label,
      labelPlacement = "top",
      onBlur,
      onFocus,
      readOnly = false,
      id: idProp,
      validationStatus,
      ...restProps
    }: FormFieldProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const labelId = useId();
    const helperTextId = useId();

    const a11yValue = useA11yValue({
      labelId,
      helperTextId,
      disabled,
      readOnly,
    });

    return (
      <div
        ref={ref}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("readOnly")]: readOnly,
            [withBaseName(`label${capitalize(labelPlacement)}`)]:
              labelPlacement,
          },
          className
        )}
        {...restProps}
      >
        <FormFieldContextNext.Provider value={{ a11yProps: a11yValue }}>
          {label && (
            <FormFieldLabel id={labelId} disabled={disabled} label={label} />
          )}
          <div className={withBaseName("controls")}>{children}</div>
          {helperText && (
            <FormFieldHelperText
              id={helperTextId}
              disabled={disabled}
              helperText={helperText}
              validationStatus={validationStatus}
            />
          )}
        </FormFieldContextNext.Provider>
      </div>
    );
  }
);
