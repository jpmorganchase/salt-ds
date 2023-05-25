import { clsx } from "clsx";
import { makePrefixer } from "../utils";
import {
  CheckboxCheckedIcon,
  CheckboxCheckedIconHD,
  CheckboxIndeterminateIcon,
  CheckboxUncheckedIcon,
} from "./assets";

import checkboxIconCss from "./CheckboxIcon.css";
import { useDensity } from "../salt-provider";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

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
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-checkbox-icon",
    css: checkboxIconCss,
    window: targetWindow,
  });
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
