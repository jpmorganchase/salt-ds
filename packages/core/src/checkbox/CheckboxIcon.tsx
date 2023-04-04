import { clsx } from "clsx";
import { makePrefixer } from "../utils";
import {
  CheckboxCheckedIcon,
  CheckboxCheckedIconHD,
  CheckboxIndeterminateIcon,
  CheckboxUncheckedIcon,
} from "./assets";

import "./CheckboxIcon.css";
import { useDensity } from "../salt-provider";

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
  const className = clsx(
    withBaseName(),
    {
      [withBaseName("disabled")]: disabled,
      [withBaseName("error")]: error,
    },
    classNameProp
  );

  // A different CheckboxCheckedIcon is rendered if the density is set to high
  const density = useDensity();

  return indeterminate ? (
    <CheckboxIndeterminateIcon
      className={clsx(className, withBaseName("indeterminate"))}
    />
  ) : checked ? (
    density === "high" ? (
      <CheckboxCheckedIconHD
        className={clsx(className, withBaseName("checked"))}
      />
    ) : (
      <CheckboxCheckedIcon
        className={clsx(className, withBaseName("checked"))}
      />
    )
  ) : (
    <CheckboxUncheckedIcon className={className} />
  );
};
