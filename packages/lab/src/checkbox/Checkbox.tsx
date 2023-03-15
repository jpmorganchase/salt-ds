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
  /**
   * If `true`, the checkbox will be checked.
   */
  checked?: boolean;
  /**
   * The className(s) applied to the component.
   */
  className?: string;
  /**
   * Whether the checkbox component is checked by default
   * This will be disregarded if checked is already set.
   */
  defaultChecked?: boolean;
  /**
   * If `true`, the checkbox will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the checkbox will be in the error state.
   */
  error?: boolean;
  /**
   * If true, the checkbox appears indeterminate. This does not set the native
   * input element to indeterminate due to the inconsistent behaviour across browsers
   * However, a data-indeterminate attribute is set on the input.
   */
  indeterminate?: boolean;
  /**
   * Properties applied to the input element.
   */
  inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>;
  /**
   * The label to be shown next to the checkbox.
   */
  label?: ReactNode;
  /**
   * The name applied to the input.
   */
  name?: string;
  /**
   * Callback when checkbox loses focus.
   */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /**
   * Callback when checked state is changed.
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  /**
   * Callback when checkbox gains focus.
   */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /**
   * The value of the checkbox.
   */
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
