import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useRef } from "react";
import { type A11yValueProps, FormFieldContext } from "../form-field-context";
import { capitalize, makePrefixer, useForkRef, useId } from "../utils";

import formFieldCss from "./FormField.css";

export type FormFieldLabelPlacement = "top" | "left" | "right";

export interface FormFieldProps
  extends HTMLAttributes<HTMLDivElement>,
    A11yValueProps {
  /**
   * If `true`, the field will be disabled.
   */
  disabled?: boolean;
  /**
   * Location of the label relative to the control.
   *
   * Either 'top', 'left', or 'right'`.
   */
  labelPlacement?: FormFieldLabelPlacement;
  /**
   * If `true`, the field will be read-only.
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
    ref,
  ) => {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-form-field",
      css: formFieldCss,
      window: targetWindow,
    });

    const formFieldRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(ref, formFieldRef);

    const formId = useId(idProp);

    const labelId = formId ? `label-${formId}` : undefined;
    const helperTextId = formId ? `helperText-${formId}` : undefined;

    return (
      <div
        ref={handleRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName(`label${capitalize(labelPlacement)}`)]:
              labelPlacement,
          },
          className,
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
            formFieldRef,
          }}
        >
          {children}
        </FormFieldContext.Provider>
      </div>
    );
  },
);
