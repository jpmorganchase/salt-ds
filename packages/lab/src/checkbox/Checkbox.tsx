import { clsx } from "clsx";
import {
  ChangeEvent,
  FocusEventHandler,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { makePrefixer, useControlled } from "@salt-ds/core";
import { CheckboxIcon } from "./CheckboxIcon";

import "./Checkbox.css";

const withBaseName = makePrefixer("saltCheckbox");

export interface CheckboxProps {
  checked?: boolean;
  className?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>;
  label?: ReactNode;
  name?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /**
   * Callback when checked state is changed
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  value?: string;
}

export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(
  function Checkbox(
    {
      checked: checkedProp,
      className,
      defaultChecked,
      disabled,
      indeterminate,
      inputProps,
      label,
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
      <label
        className={clsx(withBaseName(), className, {
          [withBaseName("disabled")]: disabled,
        })}
        ref={ref}
        {...rest}
      >
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
        {label}
      </label>
    );
  }
);
