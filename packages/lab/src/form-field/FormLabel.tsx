import cx from "classnames";
import { ElementType, HTMLAttributes } from "react";
import {
  NecessityIndicator as DefaultNecessityIndicator,
  NecessityIndicatorOptions,
} from "./NecessityIndicator";
import { StatusIndicator, StatusIndicatorProps } from "./StatusIndicator";

import "./FormLabel.css";
import { FormFieldValidationState } from "./FormField";

const classBase = "uitkFormLabel";
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
   * The state for the FormField: Must be one of: 'error'|'warning'|undefined
   */
  validationState?: FormFieldValidationState;
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
  validationState,
  necessityText,
  className,
  disabled,
  readOnly,
  tooltipText,
  ...restProps
}: FormLabelProps) => (
  <label
    className={cx(className, classBase, {
      [`${classBase}-disabled`]: disabled,
      [`${classBase}-readOnly`]: readOnly,
    })}
    {...restProps}
  >
    {label}

    <NecessityIndicator
      required={required}
      displayedNecessity={displayedNecessity}
      necessityText={necessityText}
      className={`${classBase}-necessityIndicator`}
    />
    {hasStatusIndicator && (
      <StatusIndicator
        className={`${classBase}-statusIndicator`}
        state={validationState}
        tooltipText={tooltipText}
        hasTooltip
        {...StatusIndicatorProps}
      />
    )}
  </label>
);
