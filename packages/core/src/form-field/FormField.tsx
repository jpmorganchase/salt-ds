import { clsx } from "clsx";
import { ForwardedRef, forwardRef, HTMLAttributes } from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { A11yValueProps, FormFieldContext } from "../form-field-context";
import { makePrefixer, useId, capitalize } from "../utils";

import formFieldCss from "./FormField.css";

export type FormFieldLabelPlacement = "top" | "left" | "right";

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
   * Displays necessity on label
   */
  necessity?: "required" | "optional" | "asterisk";
  /**
   * Validation status
   */
  validationStatus?: "error" | "warning" | "success";
}

const withBaseName = makePrefixer("saltFormField");

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      children,
      className,
      disabled = false,
      id: idProp,
      labelPlacement = "top",
      necessity,
      readOnly = false,
      validationStatus,
      ...restProps
    },
    ref
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
            necessity,
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
