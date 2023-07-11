import { clsx } from "clsx";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useDensity } from "../salt-provider";
import { AdornmentValidationStatus } from "../status-adornment";
import { makePrefixer } from "../utils";
import checkboxIconCss from "./CheckboxIcon.css";
import {
  IconProps,
  SuccessSmallSolidIcon,
  SuccessSolidIcon,
} from "@salt-ds/icons";

export interface CheckboxIconProps {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  /**
   * @deprecated Use validationStatus instead
   */
  error?: boolean;
  indeterminate?: boolean;
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

export const CheckboxIcon = ({
  checked = false,
  className,
  disabled,
  error,
  indeterminate,
  validationStatus,
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
        },
        className
      )}
    >
      {checked && !indeterminate && (
        <CheckedIcon className={withBaseName("icon")} />
      )}
    </div>
  );
};
