import cx from "classnames";
import { makePrefixer } from "@salt-ds/core";
import {
  CheckboxUncheckedIcon,
  CheckboxCheckedIcon,
  CheckboxIndeterminateIcon,
} from "./assets";

import "./CheckboxIcon.css";

export interface CheckboxIconProps {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  indeterminate?: boolean;
}

const withBaseName = makePrefixer("uitkCheckboxIcon");

export const CheckboxIcon = ({
  checked = false,
  className: classNameProp,
  disabled,
  indeterminate,
}: CheckboxIconProps): JSX.Element => {
  const className = cx(withBaseName(), classNameProp, {
    [withBaseName("disabled")]: disabled,
  });
  return indeterminate ? (
    <CheckboxIndeterminateIcon
      className={cx(className, withBaseName("indeterminate"))}
    />
  ) : checked ? (
    <CheckboxCheckedIcon className={cx(className, withBaseName("checked"))} />
  ) : (
    <CheckboxUncheckedIcon className={className} />
  );
};
