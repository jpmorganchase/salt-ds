import { ComponentType, ReactElement } from "react";
import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import "./RadioButtonIcon.css";

const withBaseName = makePrefixer("saltRadioButtonIcon");

export interface RadioButtonIconProps {
  checked?: boolean;
  error?: boolean
}

/**
 * Default radio icon
 */
export const RadioButtonIcon = ({ checked, error }: RadioButtonIconProps) => {
  return (
    <svg
      className={clsx(withBaseName(), {
        [withBaseName("checked")]: checked,
        [withBaseName("error")]: error,
      })}
      height="14"
      viewBox="0 0 14 14"
      width="14"
    >
      <circle className={withBaseName("border")} cx="7" cy="7" r="6.5" />
      {checked && (
        <circle
          className={withBaseName("inner-checked")}
          cx="7"
          cy="7"
          r="3.2"
        />
      )}
    </svg>
  );
};

/**
 * Creates a component that can be given to Radio or RadioButton as the 'icon'
 */
export const makeRadioIcon =
  (
    iconChecked: ReactElement | null,
    iconUnchecked: ReactElement | null
  ): ComponentType<RadioButtonIconProps> =>
    (props: RadioButtonIconProps) =>
      props.checked ? iconChecked : iconUnchecked;
