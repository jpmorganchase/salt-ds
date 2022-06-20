import { makePrefixer, useControlled } from "@jpmorganchase/uitk-core";
import classnames from "classnames";
import React, { ForwardedRef, forwardRef, useCallback } from "react";
import { pillBaseName } from "./constants";
import { PillBase, PillBaseProps } from "./internal/PillBase";
import { PillCheckbox } from "./internal/PillCheckbox";

const noop = () => undefined;

export interface SelectablePillProps extends Omit<PillBaseProps, "onChange"> {
  /**
   * Controls whether the selectable pill is checked
   */
  checked?: boolean;
  /**
   * Uncontrolled prop to determine initial state of selectable pill
   */
  defaultChecked?: boolean;
  // TODO: API Alignment.
  // - Reverted param order to keep event as first param
  /**
   * Callback when checked state is changed
   */
  onChange?: (event: React.ChangeEvent, checked: boolean) => void;
}

const withBaseName = makePrefixer(pillBaseName);

export const SelectablePill = forwardRef(function SelectablePill(
  {
    defaultChecked = false,
    checked: checkedProp,
    className,
    onChange = noop,
    disabled = false,
    ...rest
  }: SelectablePillProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [checked, setChecked] = useControlled({
    controlled: checkedProp,
    default: defaultChecked,
    name: "SelectablePill",
    state: "checked",
  });

  const handleClick = useCallback(
    (event) => {
      setChecked(!checked);
      onChange(event, !checked);
    },
    [checked, onChange, setChecked]
  );

  return (
    <PillBase
      aria-checked={checked}
      aria-roledescription="Selectable Pill"
      clickable
      disabled={disabled}
      className={classnames(withBaseName(`selectable`), className)}
      icon={<PillCheckbox checked={checked} />}
      role="checkbox"
      onClick={handleClick}
      {...rest}
      ref={ref}
    />
  );
});
