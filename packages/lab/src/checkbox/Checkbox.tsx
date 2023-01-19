import { clsx } from "clsx";
import { forwardRef, useContext } from "react";
import { createChainedFunction } from "@salt-ds/core";
import { ControlLabel, ControlLabelProps } from "../control-label";
import { CheckboxBase, CheckboxBaseProps } from "./CheckboxBase";
import { CheckboxGroupContext } from "./internal/CheckboxGroupContext";

import "./Checkbox.css";

export interface CheckboxProps extends CheckboxBaseProps {
  label?: ControlLabelProps["label"];
  LabelProps?: Partial<ControlLabelProps>;
}

const classBase = "saltCheckbox";

export const Checkbox = forwardRef<HTMLDivElement, CheckboxProps>(
  function Checkbox(props, ref) {
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
      <div
        {...rest}
        className={clsx(classBase, className, {
          [`${classBase}-disabled`]: disabled,
        })}
        data-testid="checkbox"
        ref={ref}
      >
        <ControlLabel
          {...LabelProps}
          className={`${classBase}-label`}
          disabled={disabled}
          label={label}
          labelPlacement={"right"}
        >
          <CheckboxBase
            checked={checked}
            disabled={disabled}
            defaultChecked={defaultChecked}
            indeterminate={indeterminate}
            onChange={handleChange}
            value={value}
          />
        </ControlLabel>
      </div>
    );
  }
);
