import cx from "classnames";
import { ElementType, HTMLAttributes } from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import {
  NecessityIndicator as DefaultNecessityIndicator,
  NecessityIndicatorOptions,
} from "./NecessityIndicator";
import { StatusIndicator, StatusIndicatorProps } from "./StatusIndicator";
import { FormFieldLabelPlacement, FormFieldValidationState } from "./FormField";

import "./FormLabel.css";

const classBase = "uitkFormLabel";
const withBaseName = makePrefixer(classBase);
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
   * Location of label
   */
  labelPlacement?: FormFieldLabelPlacement;
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
  labelPlacement = "top",
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
      [withBaseName("disabled")]: disabled,
      [withBaseName("readOnly")]: readOnly,
      [withBaseName("labelLeft")]: labelPlacement === "left",
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
        state={validationState}
        tooltipText={tooltipText}
        hasTooltip
        {...StatusIndicatorProps}
      />
    )}
  </label>
);
