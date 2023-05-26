import { makePrefixer } from "../utils";
import { clsx } from "clsx";
import radioButtonIconCss from "./RadioButtonIcon.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

const withBaseName = makePrefixer("saltRadioButtonIcon");

export interface RadioButtonIconProps {
  checked?: boolean;
  error?: boolean;
  disabled?: boolean;
}

/**
 * Default radio icon
 */
export const RadioButtonIcon = ({
  checked,
  error,
  disabled,
}: RadioButtonIconProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-radio-button-icon",
    css: radioButtonIconCss,
    window: targetWindow,
  });
  return (
    <svg
      className={clsx(withBaseName(), {
        [withBaseName("checked")]: checked,
        [withBaseName("error")]: error,
        [withBaseName("disabled")]: disabled,
      })}
      height="14"
      viewBox="0 0 14 14"
      width="14"
    >
      <circle className={withBaseName("circle")} cx="7" cy="7" r="6.5" />
      {checked && (
        <circle
          className={withBaseName("checked-circle")}
          cx="7"
          cy="7"
          r="3.2"
        />
      )}
    </svg>
  );
};
