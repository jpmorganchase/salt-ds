import { clsx } from "clsx";
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
  error?: boolean;
  indeterminate?: boolean;
}

const withBaseName = makePrefixer("saltCheckboxIcon");

export const CheckboxIcon = ({
  checked = false,
  className: classNameProp,
  disabled,
  error,
  indeterminate,
}: CheckboxIconProps): JSX.Element => {
  const className = clsx(withBaseName(), classNameProp, {
    [withBaseName("disabled")]: disabled,
    [withBaseName("error")]: error,
  });
  return indeterminate ? (
    <CheckboxIndeterminateIcon
      className={clsx(className, withBaseName("indeterminate"))}
    />
  ) : checked ? (
    <CheckboxCheckedIcon className={clsx(className, withBaseName("checked"))} />
  ) : (
    <CheckboxUncheckedIcon className={className} />
  );
};
