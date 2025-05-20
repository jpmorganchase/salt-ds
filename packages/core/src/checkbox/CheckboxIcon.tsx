import {
  type IconProps,
  SuccessIcon,
  SuccessSmallIcon,
  SuccessSmallSolidIcon,
  SuccessSolidIcon,
} from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { useDensity } from "../salt-provider";
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

function CheckedIcon(props: IconProps) {
  const density = useDensity();
  return density === "high" ? (
    <SuccessSmallSolidIcon {...props} />
  ) : (
    <SuccessSolidIcon {...props} />
  );
}

function CheckedReadOnlyIcon(props: IconProps) {
  const density = useDensity();
  return density === "high" ? (
    <SuccessSmallIcon {...props} />
  ) : (
    <SuccessIcon {...props} />
  );
}

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
          [withBaseName("checked")]: checked && !indeterminate,
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
        <CheckedIcon className={withBaseName("icon")} />
      )}
      {checked && !indeterminate && readOnly && (
        <CheckedReadOnlyIcon className={withBaseName("icon")} />
      )}
    </div>
  );
};
