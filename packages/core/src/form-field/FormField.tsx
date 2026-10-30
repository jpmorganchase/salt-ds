import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  Fragment,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type A11yValueProps,
  FormFieldContext,
  type FormFieldValidationStatus,
} from "../form-field-context";
import { capitalize, makePrefixer, useForkRef, useId } from "../utils";

import formFieldCss from "./FormField.css";
import { FormFieldHelperText } from "./FormFieldHelperText";
import { FormFieldLabel } from "./FormFieldLabel";
import { FormFieldInternalContext } from "./internal/FormFieldInternalContext";

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
  validationStatus?: FormFieldValidationStatus;
}

const withBaseName = makePrefixer("saltFormField");

interface FormFieldChildren {
  hasControls: boolean;
  hasLabel: boolean;
  hasHelperText: boolean;
}

function getFormFieldChildren(
  children: ReactNode,
  result: FormFieldChildren = {
    hasControls: false,
    hasLabel: false,
    hasHelperText: false,
  },
): FormFieldChildren {
  for (const child of Children.toArray(children)) {
    if (!isValidElement<{ children?: ReactNode }>(child)) {
      result.hasControls = true;
    } else if (child.type === Fragment) {
      getFormFieldChildren(child.props.children, result);
    } else if (child.type === FormFieldLabel) {
      result.hasLabel = true;
    } else if (child.type === FormFieldHelperText) {
      result.hasHelperText = true;
    } else {
      result.hasControls = true;
    }
  }
  return result;
}

/**
 * Tracks whether any elements are registered, so nested or conditionally
 * rendered ones are found. Starting from whether they're in FormField's
 * children avoids a re-render when they register.
 */
function useRegisteredElements(initialValue: boolean) {
  const countRef = useRef(0);
  const [isRendered, setIsRendered] = useState(initialValue);
  const register = useCallback(() => {
    countRef.current += 1;
    setIsRendered(true);
    return () => {
      countRef.current -= 1;
      if (countRef.current === 0) {
        setIsRendered(false);
      }
    };
  }, []);
  return [isRendered, register] as const;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  function FormField(
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
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-form-field",
      css: formFieldCss,
      window: targetWindow,
    });

    const formFieldRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(ref, formFieldRef);

    const formId = useId(idProp);
    const formFieldChildren = getFormFieldChildren(children);

    const [isLabelRegistered, registerLabel] = useRegisteredElements(
      formFieldChildren.hasLabel,
    );
    const [isHelperTextRegistered, registerHelperText] = useRegisteredElements(
      formFieldChildren.hasHelperText,
    );
    // Children are included before they register, so markup rendered before
    // effects run, such as on the server, refers to them.
    const hasLabel = isLabelRegistered || formFieldChildren.hasLabel;
    const hasHelperText =
      isHelperTextRegistered || formFieldChildren.hasHelperText;

    const labelId = formId ? `label-${formId}` : undefined;
    const helperTextId = formId ? `helperText-${formId}` : undefined;

    const internalContextValue = useMemo(
      () => ({
        formFieldRef,
        labelId,
        helperTextId,
        registerLabel,
        registerHelperText,
      }),
      [labelId, helperTextId, registerLabel, registerHelperText],
    );

    return (
      <div
        ref={handleRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("hasControls")]: formFieldChildren.hasControls,
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
              "aria-labelledby": hasLabel ? labelId : undefined,
              "aria-describedby": hasHelperText ? helperTextId : undefined,
            },
            disabled,
            necessity,
            readOnly,
            validationStatus,
            formFieldRef,
          }}
        >
          <FormFieldInternalContext.Provider value={internalContextValue}>
            {children}
          </FormFieldInternalContext.Provider>
        </FormFieldContext.Provider>
      </div>
    );
  },
);
