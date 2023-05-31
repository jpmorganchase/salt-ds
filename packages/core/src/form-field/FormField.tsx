import { clsx } from "clsx";
import { ForwardedRef, forwardRef, HTMLAttributes } from "react";
import { A11yValueProps, FormFieldContext } from "../form-field-context";
import { makePrefixer, useId, capitalize } from "../utils";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import formFieldCss from "./FormField.css";

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

const withBaseName = makePrefixer("saltFormField");

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
      validationStatus,
      ...restProps
    }: FormFieldProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-form-field",
      css: formFieldCss,
      window: targetWindow,
    });

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
            [withBaseName(`label${capitalize(labelPlacement)}`)]:
              labelPlacement,
          },
          className
        )}
        {...restProps}
      >
        <FormFieldContext.Provider
          value={{
            a11yProps: {
              "aria-labelledby": labelId,
              "aria-describedby": helperTextId,
            },
            disabled,
            readOnly,
            validationStatus,
          }}
        >
          {children}
        </FormFieldContext.Provider>
      </div>
    );
  }
);
