import { CheckmarkIcon, CheckmarkSolidIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { AdornmentValidationStatus } from "../status-adornment";
import { makePrefixer } from "../utils";
import checkboxIconCss from "./CheckboxIcon.css";

export interface CheckboxIconProps {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  /**
   * @deprecated Use validationStatus instead
   */
  error?: boolean;
  indeterminate?: boolean;
  readOnly?: boolean;
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
}: CheckboxIconProps): JSX.Element => {
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
