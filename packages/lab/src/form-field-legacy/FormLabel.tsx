import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { ElementType, HTMLAttributes } from "react";
import type { FormFieldValidationStatus } from "./FormFieldLegacy";
import formLabelCss from "./FormLabel.css";
import {
  NecessityIndicator as DefaultNecessityIndicator,
  type NecessityIndicatorOptions,
} from "./NecessityIndicator";
import { StatusIndicator, type StatusIndicatorProps } from "./StatusIndicator";

const withBaseName = makePrefixer("saltFormLabel");
export interface FormLabelProps
  extends HTMLAttributes<HTMLLabelElement>,
    NecessityIndicatorOptions {
  /**
   * Whether the form field is disabled.
   */
  disabled?: boolean;
  /**
   * Adjusts whether the StatusIndicator component is shown
   */
  hasStatusIndicator?: boolean;
  /**
   * The label value for the FormLabel
   */
  label?: string;
  /**
   * An optional renderer function used to customize the necessity adornment
   */
  NecessityIndicator?: ElementType<NecessityIndicatorOptions>;
  /**
   * Whether the form field is readOnly.
   */
  readOnly?: boolean;
  /**
   * Props used to configure the StatusIndicator component if hasStatusIndicator is true
   */
  StatusIndicatorProps?: Partial<StatusIndicatorProps>;
  /**
   * The status for the FormField: Must be one of: 'error'|'warning'|undefined
   */
  validationStatus?: FormFieldValidationStatus;
  /**
   * Text to be shown in the Tooltip.
   */
  tooltipText?: string;
}

export const FormLabel = ({
  label,
  NecessityIndicator = DefaultNecessityIndicator,
  required,
  displayedNecessity,
  hasStatusIndicator = false,
  StatusIndicatorProps,
  validationStatus,
  necessityText,
  className,
  disabled,
  readOnly,
  tooltipText,
  ...restProps
}: FormLabelProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-form-label",
    css: formLabelCss,
    window: targetWindow,
  });

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: this is a label for a form field and will wrap a form control
    <label
      className={clsx(withBaseName(), className, {
        [withBaseName("disabled")]: disabled,
      })}
      {...restProps}
    >
      {label}

      <NecessityIndicator
        required={required}
        displayedNecessity={displayedNecessity}
        necessityText={necessityText}
        className={withBaseName("necessityIndicator")}
      />
      {hasStatusIndicator && (
        <StatusIndicator
          className={withBaseName("statusIndicator")}
          status={validationStatus}
          tooltipText={tooltipText}
          hasTooltip
          {...StatusIndicatorProps}
        />
      )}
    </label>
  );
};
