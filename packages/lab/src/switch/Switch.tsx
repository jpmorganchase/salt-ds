import { clsx } from "clsx";
import {
  ChangeEvent,
  FocusEventHandler,
  forwardRef,
  InputHTMLAttributes,
  RefObject,
} from "react";
import { makePrefixer, useControlled } from "@salt-ds/core";
import { CheckedIcon } from "./assets/CheckedIcon";

import "./Switch.css";

export interface SwitchProps {
  checked?: boolean;
  className?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  label?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  inputRef?: RefObject<HTMLInputElement>
  inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>;
}

const withBaseName = makePrefixer("saltSwitch");

export const Switch = forwardRef<HTMLLabelElement, SwitchProps>(function Switch(
  props,
  ref
) {

  const {
    checked: checkedProp,
    className,
    defaultChecked,
    disabled,
    label,
    inputRef,
    inputProps,
    onBlur,
    onChange,
    onFocus,
    ...rest
  } = props;

  const [checked, setChecked] = useControlled({
    controlled: checkedProp,
    default: Boolean(defaultChecked),
    name: "Switch",
    state: "checked",
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setChecked(value);
    onChange?.(event, value);
  };

  return (
    <label
      className={clsx(
        withBaseName(), className,
        {
          [withBaseName("disabled")]: disabled,
          [withBaseName("checked")]: checked,
        },
        className
      )}
      ref={ref}
      {...rest}
    >
      <input
        className={withBaseName("input")}
        checked={checked}
        disabled={disabled}
        onBlur={onBlur}
        onChange={handleChange}
        onFocus={onFocus}
        ref={inputRef}
        type="checkbox"
        {...inputProps}
      />
      <span className={withBaseName("iconContainer")}>
        <span className={withBaseName("track")} />
        {checked ? (
          <CheckedIcon className={withBaseName("icon")} />
        ) : (
          <span className={withBaseName("thumb")} />
        )}
      </span>
      {label}
    </label>
  );
});
