import { clsx } from "clsx";
import {
  ChangeEvent,
  FocusEventHandler,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useContext,
} from "react";
import {
  createChainedFunction,
  makePrefixer,
  useControlled,
} from "@salt-ds/core";
import { CheckboxIcon } from "./CheckboxIcon";

import "./Checkbox.css";
import { CheckboxGroupContext } from "./internal/CheckboxGroupContext";

const withBaseName = makePrefixer("saltCheckbox");

export interface CheckboxProps {
  checked?: boolean;
  className?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  error?: boolean;
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
      defaultChecked: defaultCheckedProp,
      disabled,
      error,
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
    const groupContext = useContext(CheckboxGroupContext);

    const handleInternalChange = (event: ChangeEvent<HTMLInputElement>) => {
      // Workaround for https://github.com/facebook/react/issues/9023
      if (event.nativeEvent.defaultPrevented) {
        return;
      }

      const value = event.target.checked;
      setChecked(value);
      onChange?.(event, value);
    };

    const handleChange = createChainedFunction(
      handleInternalChange,
      groupContext?.onChange
    );

    let isCheckchecked = checkedProp;
    let defaultChecked = defaultCheckedProp;

    if (groupContext) {
      if (typeof isCheckchecked === "undefined" && typeof value === "string") {
        isCheckchecked = groupContext?.checkedValues?.includes(value);
      }
      defaultChecked = undefined;
    }

    console.log(isCheckchecked);

    const [checked, setChecked] = useControlled({
      controlled: isCheckchecked,
      default: Boolean(defaultCheckedProp),
      name: "Checkbox",
      state: "checked",
    });

    return (
      <label
        className={clsx(withBaseName(), className, {
          [withBaseName("disabled")]: disabled,
          [withBaseName("error")]: error,
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
          error={error}
          indeterminate={indeterminate}
        />
        {label}
      </label>
    );
  }
);
