import { CheckmarkIcon, CheckmarkSolidIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import type { AdornmentValidationStatus } from "../status-adornment";
import { makePrefixer } from "../utils";
import checkboxIconCss from "./CheckboxIcon.css";

export interface CheckboxIconProps {
  /**
   * If `true`, the icon shows a checkmark. Defaults to `false`.
   */
  checked?: boolean;
  /**
   * Class name applied to the icon's root element.
   */
  className?: string;
  /**
   * If `true`, the icon uses the disabled styling.
   */
  disabled?: boolean;
  /**
   * @deprecated since 1.8.0-rc.2. Use `validationStatus` instead.
   */
  error?: boolean;
  /**
   * If `true`, the icon shows the indeterminate state instead of a checkmark.
   */
  indeterminate?: boolean;
  /**
   * If `true`, the icon uses the read-only styling.
   */
  readOnly?: boolean;
  /**
   * The validation status to style the icon with: "error", "warning" or "success".
   */
  validationStatus?: AdornmentValidationStatus;
}

const withBaseName = makePrefixer("saltCheckboxIcon");

export const CheckboxIcon = ({
  checked = false,
  className,
  disabled,
  error,
  indeterminate,
  validationStatus,
  readOnly,
}: CheckboxIconProps): ReactElement => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-checkbox-icon",
    css: checkboxIconCss,
    window: targetWindow,
  });

  return (
    <div
      aria-hidden="true"
      className={clsx(
        withBaseName(),
        {
          [withBaseName("checked")]: checked,
          [withBaseName("disabled")]: disabled,
          [withBaseName("error")]: error,
          [withBaseName(validationStatus || "")]: validationStatus,
          [withBaseName("indeterminate")]: indeterminate,
          [withBaseName("readOnly")]: readOnly,
        },
        className,
      )}
    >
      {checked && !indeterminate && !readOnly && (
        <CheckmarkSolidIcon className={withBaseName("icon")} />
      )}
      {checked && !indeterminate && readOnly && (
        <CheckmarkIcon className={withBaseName("icon")} />
      )}
    </div>
  );
};
