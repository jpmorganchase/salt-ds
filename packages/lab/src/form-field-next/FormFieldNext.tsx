import { clsx } from "clsx";
import { ForwardedRef, forwardRef, HTMLAttributes, useMemo } from "react";
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
      labelPlacement = "top",
      onBlur,
      onFocus,
      readOnly = false,
      validationStatus,
      ...restProps
    }: FormFieldProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const labelId = useId();
    const helperTextId = useId();

    const a11yProps = useMemo(
      () => ({
        "aria-labelledby": labelId,
        "aria-describedby": helperTextId,
      }),
      [labelId, helperTextId]
    );

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
          value={{ a11yProps, disabled, readOnly, validationStatus }}
        >
          {children}
        </FormFieldContextNext.Provider>
      </div>
    );
  }
);
