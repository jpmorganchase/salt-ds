import { FC, ReactElement } from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import classnames from "classnames";
import "./RadioIcon.css";

const withBaseName = makePrefixer("uitkRadioIcon");

export interface RadioIconProps {
  checked?: boolean;
}

/**
 * Default radio icon
 */
export const RadioIcon: FC<RadioIconProps> = ({ checked }) => {
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
  ): FC<RadioIconProps> =>
  (props: RadioIconProps) =>
    props.checked ? iconChecked : iconUnchecked;
