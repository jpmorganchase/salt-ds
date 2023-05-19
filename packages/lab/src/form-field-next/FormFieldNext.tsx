import { clsx } from "clsx";
import { ForwardedRef, forwardRef, HTMLAttributes } from "react";
import { makePrefixer, useId, capitalize } from "@salt-ds/core";
import {
  A11yValueProps,
  FormFieldContextNext,
} from "../form-field-context-next";

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
   * Location of the label, values: 'top' (default) or 'left'
   */
  labelPlacement?: FormFieldLabelPlacement;
  /**
   * Readonly prop
   */
  readOnly?: boolean;
  /**
   * Optional id prop
   * 
   * Used as suffix of FormFieldLabel id: `label-{id}`
   * Used as suffix of FormFieldHelperText id: `helperText-{id}`
   */
  id?: string;
  /**
   * Validation status
   */
  validationStatus?: "error" | "warning" | "success";
}

const withBaseName = makePrefixer("saltFormFieldNext");

export const FormField = forwardRef(
  (
    {
      children,
      className,
      disabled = false,
      id: idProp,
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
    const formId = useId(idProp);

    const labelId = formId ? `label-${formId}` : undefined;
    const helperTextId = formId ? `helperText-${formId}` : undefined;

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
          value={{
            a11yProps: { labelId, helperTextId },
            disabled,
            readOnly,
            validationStatus,
          }}
        >
          {children}
        </FormFieldContextNext.Provider>
      </div>
    );
  }
);
