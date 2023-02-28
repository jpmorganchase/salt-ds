import { clsx } from "clsx";
import {
  ChangeEvent,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  InputHTMLAttributes,
} from "react";
import { makePrefixer, useControlled } from "@salt-ds/core";
import { CheckboxIcon } from "./CheckboxIcon";

import "./Checkbox.css";
import { ControlLabel, ControlLabelProps } from "../control-label";

const withBaseName = makePrefixer("saltCheckbox");

export interface CheckboxProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>;
  label?: ControlLabelProps["label"];
  LabelProps?: Partial<ControlLabelProps>;
  name?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /**
   * Callback when checked state is changed
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  value?: string;
}

export const Checkbox = forwardRef<HTMLDivElement, CheckboxProps>(
  function Checkbox(
    {
      checked: checkedProp,
      className: classNameProp,
      defaultChecked,
      disabled,
      indeterminate,
      inputProps,
      label,
      LabelProps,
      name,
      onBlur,
      onChange,
      onFocus,
      value,
      ...rest
    },
    ref
  ) {
    const [checked, setChecked] = useControlled({
      controlled: checkedProp,
      default: Boolean(defaultChecked),
      name: "Checkbox",
      state: "checked",
    });

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      // Workaround for https://github.com/facebook/react/issues/9023
      if (event.nativeEvent.defaultPrevented) {
        return;
      }

      const value = event.target.checked;
      setChecked(value);
      onChange?.(event, value);
    };

    return (
      <div
        {...rest}
        className={clsx(withBaseName(), classNameProp, {
          [withBaseName("disabled")]: disabled,
        })}
        data-testid="checkbox"
        ref={ref}
      >
        <ControlLabel
          {...LabelProps}
          className={withBaseName("label")}
          disabled={disabled}
          label={label}
          labelPlacement={"right"}
        >
          <span className={clsx(withBaseName("base"), classNameProp)}>
            <input
              aria-checked={indeterminate ? "mixed" : checked}
              name={name}
              value={value}
              {...inputProps}
              checked={checked}
              className={withBaseName("input")}
              data-indeterminate={indeterminate}
              defaultChecked={defaultChecked}
              disabled={disabled}
              onBlur={onBlur}
              onChange={handleChange}
              onFocus={onFocus}
              type="checkbox"
            />
            <CheckboxIcon
              checked={checked}
              disabled={disabled}
              indeterminate={indeterminate}
            />
          </span>
        </ControlLabel>
      </div>
    );
  }
);
