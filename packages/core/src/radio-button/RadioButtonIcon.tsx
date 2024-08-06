import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import type { AdornmentValidationStatus } from "../status-adornment";
import { makePrefixer } from "../utils";
import radioButtonIconCss from "./RadioButtonIcon.css";

const withBaseName = makePrefixer("saltRadioButtonIcon");

export interface RadioButtonIconProps extends ComponentPropsWithoutRef<"div"> {
  checked?: boolean;
  disabled?: boolean;
  /**
   * @deprecated Use validationStatus instead
   */
  error?: boolean;
  readOnly?: boolean;
  validationStatus?: AdornmentValidationStatus;
}

/**
 * Default radio icon
 */
export const RadioButtonIcon = ({
  checked,
  className,
  error,
  disabled,
  validationStatus,
  readOnly,
  ...rest
}: RadioButtonIconProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-radio-button-icon",
    css: radioButtonIconCss,
    window: targetWindow,
  });
  return (
    <div
      aria-hidden="true"
      className={clsx(
        withBaseName(),
        {
          [withBaseName("checked")]: checked,
          [withBaseName("error")]: error,
          [withBaseName("disabled")]: disabled,
          [withBaseName(validationStatus || "")]: validationStatus,
          [withBaseName("readOnly")]: readOnly,
        },
        className,
      )}
      {...rest}
    >
      {checked && !readOnly && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M0 6a6 6 0 1 1 12 0A6 6 0 0 1 0 6Zm6 3a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {checked && readOnly && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 12 12"
        >
          <path d="M9.5 6a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" />
        </svg>
      )}
    </div>
  );
};
