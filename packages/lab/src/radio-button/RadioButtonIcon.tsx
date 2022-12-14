import { ComponentType, ReactElement } from "react";
import { makePrefixer } from "@salt-ds/core";
import classnames from "classnames";
import "./RadioButtonIcon.css";

const withBaseName = makePrefixer("uitkRadioButtonIcon");

export interface RadioButtonIconProps {
  checked?: boolean;
}

/**
 * Default radio icon
 */
export const RadioButtonIcon = ({ checked }: RadioButtonIconProps) => {
  return (
    <svg
      className={classnames(withBaseName(), {
        [withBaseName("checked")]: checked,
      })}
      height="14"
      viewBox="0 0 14 14"
      width="14"
    >
      <circle className={withBaseName("border")} cx="7" cy="7" r="6.5" />
      {checked && (
        <circle className={withBaseName("inner-checked")} cx="7" cy="7" r="3" />
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
