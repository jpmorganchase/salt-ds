import { forwardRef, useContext } from "react";
import { createChainedFunction } from "@salt-ds/core";
import { Checkbox, CheckboxProps } from "./Checkbox";
import { CheckboxGroupContext } from "./internal/CheckboxGroupContext";

export const GroupCheckbox = forwardRef<HTMLDivElement, CheckboxProps>(
  function GroupCheckbox(props, ref) {
    const {
      checked: checkedProp,
      className,
      defaultChecked: defaultCheckedProp,
      disabled,
      indeterminate,
      inputProps,
      label,
      LabelProps,
      onChange,
      value,
      ...rest
    } = props;

    const groupContext = useContext(CheckboxGroupContext);

    const handleChange = createChainedFunction(
      onChange,
      groupContext?.onChange
    );

    let checked = checkedProp;
    let defaultChecked = defaultCheckedProp;

    if (groupContext) {
      if (typeof checked === "undefined" && typeof value === "string") {
        checked = groupContext?.checkedValues?.includes(value);
      }

      defaultChecked = undefined;
    }
    return (
      <Checkbox
        checked={checked}
        className={className}
        defaultChecked={defaultChecked}
        disabled={disabled}
        indeterminate={indeterminate}
        inputProps={inputProps}
        label={label}
        LabelProps={LabelProps}
        onChange={handleChange}
        value={value}
        {...rest}
      />
    );
  }
);
