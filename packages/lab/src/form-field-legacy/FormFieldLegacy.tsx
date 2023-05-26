import { clsx } from "clsx";
import {
  Dispatch,
  ElementType,
  FocusEventHandler,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from "react";
import { makePrefixer, Tooltip, useForkRef, useId } from "@salt-ds/core";
import { FormFieldLegacyContext } from "../form-field-context-legacy";
import { classBase } from "./constant";
import {
  FormActivationIndicator,
  FormActivationIndicatorProps,
} from "./FormActivationIndicator";
import { FormHelperText, FormHelperTextProps } from "./FormHelperText";
import { FormLabel, FormLabelProps } from "./FormLabel";
import { NecessityIndicatorOptions } from "./NecessityIndicator";
import { StatusIndicatorProps } from "./StatusIndicator";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import formFieldLegacyCss from "./FormFieldLegacy.css";

export type FormFieldLabelPlacement = "top" | "left";
export type FormFieldHelperTextPlacement = "bottom" | "tooltip";
export type FormFieldValidationStatus = "error" | "warning";

export interface A11yValueProps
  extends Pick<NecessityIndicatorOptions, "required"> {
  /**
   * If `true`, the FormField will be disabled.
   */
  disabled?: boolean;
  /** id of the helper text node */
  helperTextId?: string;
  /** id of the label node */
  labelId?: string;
  /**
   * The FormField value is Readonly
   */
  readOnly?: boolean;

  /**
   * Whether the form field needs to render helper text
   */
  renderHelperText?: boolean;
}

export interface FormFieldLegacyProps
  extends HTMLAttributes<HTMLDivElement>,
    A11yValueProps {
  /**
   * The component used for activation indicator. Default to `FormActivationIndicator`.
   */
  ActivationIndicatorComponent?: ElementType<FormActivationIndicatorProps>;
  /**
   * Outer focus ring focus will not be applied. Defaults to false.
   */
  disableFocusRing?: boolean;
  // I hate this fullWidth business. We should support a width prop. The default should be 100% (standard block behaviour)
  // we should also support 'auto' or explicit numeric values
  /**
   * Whether the form field is occupying full width.
   */
  fullWidth?: boolean;
  /**
   * Whether to show the StatusIndicator component for validation states.
   */
  hasStatusIndicator?: boolean;
  /**
   * The helper text content
   */
  helperText?: string;
  /**
   * The component used for the helper text. Default to `FormHelperText`.
   */
  HelperTextComponent?: ElementType<FormHelperTextProps>;
  /**
   * Location the helperText, values: 'bottom' (default) or 'tooltip'.
   */
  helperTextPlacement?: FormFieldHelperTextPlacement;
  /**
   * Props to be applied to the `HelperTextComponent`.
   *
   * Generic on `FormHelperTextProps` is omitted.
   */
  HelperTextProps?: Partial<FormHelperTextProps>;
  /**
   * The label value for the FormField
   */
  label?: string;
  /**
   * The component used for the label. Default to `FormLabel`.
   */
  LabelComponent?: ElementType;
  /**
   * Location the label, values: 'top' (default) or 'left'
   */
  labelPlacement?: FormFieldLabelPlacement;
  /**
   * Props to be applied to the `LabelComponent`
   */
  LabelProps?: Partial<FormLabelProps>;
  /**
   * Override props to be used with the StatusIndicator component
   */
  StatusIndicatorProps?: Partial<StatusIndicatorProps>;
  /**
   * The state for the FormField: Must be one of: 'error'|'warning'|undefined
   */
  validationStatus?: FormFieldValidationStatus;
  /**
   * FormField variants; defaults to primary.
   *
   * **Deprecated:** The 'tertiary' variant has been deprecated
   */
  variant?: "primary" | "secondary" | "tertiary";
}

export interface useA11yValueValue {
  "aria-labelledby": A11yValueProps["labelId"];
  "aria-required": A11yValueProps["required"];
  "aria-describedby": A11yValueProps["helperTextId"] | undefined;
  disabled: A11yValueProps["disabled"];
  readOnly: A11yValueProps["readOnly"];
}

const useA11yValue = ({
  required,
  disabled,
  readOnly,
  labelId,
  helperTextId,
  renderHelperText,
}: A11yValueProps) => {
  return useMemo(
    () => ({
      "aria-labelledby": labelId,
      "aria-required": required,
      "aria-describedby": renderHelperText ? helperTextId : undefined,
      disabled,
      readOnly,
    }),
    [labelId, disabled, readOnly, required, renderHelperText, helperTextId]
  );
};

// TODO: Add TS props for this
export const useFormFieldLegacy = ({
  onBlur,
  onFocus,
}: {
  onBlur?: FocusEventHandler<HTMLDivElement>;
  onFocus?: FocusEventHandler<HTMLDivElement>;
}): [
  { focused: boolean },
  { setFocused: Dispatch<SetStateAction<boolean>> },
  {
    onBlur: FocusEventHandler<HTMLDivElement>;
    onFocus: FocusEventHandler<HTMLDivElement>;
  }
] => {
  const [focused, setFocused] = useState(false);
  const handleBlur: FocusEventHandler<HTMLDivElement> = (event) => {
    setFocused(false);
    onBlur?.(event);
  };
  const handleFocus: FocusEventHandler<HTMLDivElement> = (event) => {
    setFocused(true);
    onFocus?.(event);
  };
  return [
    {
      focused,
    },
    {
      setFocused,
    },
    {
      onBlur: handleBlur,
      onFocus: handleFocus,
    },
  ];
};

const withBaseName = makePrefixer(classBase);

export const FormFieldLegacy = forwardRef(
  (
    {
      ActivationIndicatorComponent = FormActivationIndicator,
      children,
      className,
      disabled,
      disableFocusRing = false,
      fullWidth = true,
      hasStatusIndicator,
      HelperTextComponent = FormHelperText,
      HelperTextProps,
      helperText,
      helperTextPlacement = "bottom",
      label,
      LabelComponent = FormLabel,
      labelPlacement = "top",
      LabelProps = { displayedNecessity: "required" },
      onBlur,
      onFocus,
      readOnly,
      required,
      StatusIndicatorProps,
      validationStatus,
      variant = "primary",
      ...restProps
    }: FormFieldLegacyProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-form-field-legacy",
      css: formFieldLegacyCss,
      window: targetWindow,
    });

    const labelId = useId(LabelProps?.id);
    const helperTextId = useId(HelperTextProps?.id);
    const rootRef = useRef<HTMLDivElement>(null);

    const renderHelperText = !!helperText;

    const a11yValue = useA11yValue({
      required,
      disabled,
      readOnly,
      labelId,
      helperTextId,
      renderHelperText,
    });

    const [states, dispatchers, eventHandlers] = useFormFieldLegacy({
      onBlur,
      onFocus,
    });

    const hasLabel = label !== undefined;
    const labelTop = hasLabel && labelPlacement === "top";
    const labelLeft = hasLabel && labelPlacement === "left";
    const isWarning = validationStatus === "warning";
    const isError = validationStatus === "error";
    const focusClass = disableFocusRing
      ? "lowFocused"
      : "focused"; /* NOTE: need to look at */
    const inlineHelperText =
      renderHelperText && helperTextPlacement === "bottom";
    const tooltipHelperText =
      renderHelperText &&
      helperTextPlacement === "tooltip" &&
      !hasStatusIndicator;

    const handleTriggerRef = useForkRef(rootRef, ref);

    return (
      <Tooltip disabled={!tooltipHelperText} content={helperText}>
        <div
          ref={handleTriggerRef}
          className={clsx(
            withBaseName(),
            {
              [withBaseName("disabled")]: disabled,
              [withBaseName("readOnly")]: readOnly,
              [withBaseName("warning")]: isWarning,
              [withBaseName("error")]: isError,
              [withBaseName("fullWidth")]: fullWidth,
              [withBaseName(focusClass)]: states.focused,
              [withBaseName("labelTop")]: labelTop,
              [withBaseName("labelLeft")]: labelLeft,
              [withBaseName(`withHelperText`)]: inlineHelperText,
              [withBaseName(variant)]: variant,
            },
            className
          )}
          {...eventHandlers}
          {...restProps}
        >
          <FormFieldLegacyContext.Provider
            value={{
              ...states,
              ...dispatchers,
              ...eventHandlers,
              a11yProps: a11yValue,
              inFormField: true,
              ref: rootRef,
            }}
          >
            {hasLabel && (
              <LabelComponent
                {...LabelProps}
                validationStatus={validationStatus}
                hasStatusIndicator={hasStatusIndicator}
                StatusIndicatorProps={StatusIndicatorProps}
                className={LabelProps.className}
                label={label}
                disabled={disabled}
                readOnly={readOnly}
                required={required}
                tooltipText={helperText}
                id={labelId}
              />
            )}
            {children}
            <ActivationIndicatorComponent
              hasIcon={!hasStatusIndicator}
              validationStatus={validationStatus}
            />
            {renderHelperText && (
              <HelperTextComponent
                helperText={helperText}
                helperTextPlacement={helperTextPlacement}
                {...HelperTextProps}
                id={helperTextId}
              />
            )}
          </FormFieldLegacyContext.Provider>
        </div>
      </Tooltip>
    );
  }
);
