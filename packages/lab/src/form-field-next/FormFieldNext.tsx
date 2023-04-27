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
   * If `true`, the FormField will be disabled
   */
  disabled?: boolean;
  /**
   * id for FormFieldHelperText
   */
  helperTextId?: string;
  /** 
   * id for FormFieldLabel
   */
  labelId?: string;
  /**
   * If `true`, the FormField will be readonly
   */
  readOnly?: boolean;
  /**
   * Validation status
   */
  validationStatus?: "error" | "warning" | "success";
}
export interface useA11yValueValue {
  "aria-labelledby": A11yValueProps["labelId"];
  "aria-describedby": A11yValueProps["helperTextId"] | undefined;
}

const useA11yValue = ({
  labelId,
  helperTextId
}: A11yValueProps) => {
  return useMemo(
    () => ({
      "aria-labelledby": labelId,
      "aria-describedby": helperTextId
    }),
    [labelId, helperTextId]
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
      helperTextId
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
        <FormFieldContextNext.Provider
          value={{ a11yProps: a11yValue, disabled: disabled, readOnly: readOnly, validationStatus: validationStatus }}
        >
          {label && <FormFieldLabel id={labelId} label={label} />}
          <div className={withBaseName("controls")}>{children}</div>
          {helperText && (
            <FormFieldHelperText id={helperTextId} helperText={helperText} />
          )}
        </FormFieldContextNext.Provider>
      </div>
    );
  }
);
