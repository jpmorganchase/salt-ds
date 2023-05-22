import { clsx } from "clsx";
import { ForwardedRef, forwardRef, HTMLAttributes, useMemo } from "react";
import { capitalize, makePrefixer, useId } from "@salt-ds/core";
import { FormFieldContextNext } from "../form-field-context";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import formFieldNextCss from "./FormFieldNext.css";

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

export interface A11yValueProps {
  /**
   * id for FormFieldHelperText
   */
  helperTextId?: string;
  /**
   * id for FormFieldLabel
   */
  labelId?: string;
}
export interface a11yValueAriaProps {
  "aria-labelledby": A11yValueProps["labelId"];
  "aria-describedby": A11yValueProps["helperTextId"] | undefined;
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
      id: idProp,
      validationStatus,
      ...restProps
    }: FormFieldProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const { window: targetWindow } = useWindow();
    useComponentCssInjection({
      testId: "salt-form-field-next",
      css: formFieldNextCss,
      window: targetWindow,
    });

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
