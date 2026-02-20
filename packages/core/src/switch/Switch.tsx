import { CheckmarkIcon, CheckmarkSolidIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEventHandler,
  type ComponentPropsWithoutRef,
  type FocusEventHandler,
  forwardRef,
  type ReactNode,
} from "react";
import { useFormFieldProps } from "../form-field-context";
import type { DataAttributes } from "../types";
import { makePrefixer, useControlled } from "../utils";

import switchCss from "./Switch.css";

export interface SwitchProps
  extends Omit<
    ComponentPropsWithoutRef<"label">,
    "children" | "onFocus" | "onBlur" | "onChange"
  > {
  /**
   * If `true`, the switch will be checked.
   */
  checked?: boolean;
  /**
   * Whether the switch component is checked by default
   * This will be disregarded if checked is already set.
   */
  defaultChecked?: boolean;
  /**
   * If `true`, the switch will be disabled.
   */
  disabled?: boolean;
  /**
   * Properties applied to the input element.
   */
  inputProps?: Partial<ComponentPropsWithoutRef<"input">> & DataAttributes;
  /**
   * The label to be shown next to the switch.
   */
  label?: ReactNode;
  /**
   * The name applied to the input.
   */
  name?: string;
  /**
   * Callback when switch loses focus.
   */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /**
   * Callback when checked state is changed.
   */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /**
   * Callback when switch gains focus.
   */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /**
   * The value of the switch.
   */
  value?: string;
  /**
   * If `true`, the switch will be read-only.
   */
  readOnly?: boolean;
}

const withBaseName = makePrefixer("saltSwitch");

export const Switch = forwardRef<HTMLLabelElement, SwitchProps>(
  function Switch(props, ref) {
    const {
      checked: checkedProp,
      className,
      defaultChecked,
      disabled: disabledProp,
      inputProps = {},
      label,
      name,
      onBlur,
      onChange,
      onFocus,
      value,
      readOnly: readOnlyProp,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-switch",
      css: switchCss,
      window: targetWindow,
    });

    const {
      "aria-describedby": inputDescribedBy,
      "aria-labelledby": inputLabelledBy,
      className: inputClassName,
      onChange: inputOnChange,
      ...restInputProps
    } = inputProps;

    const [checked, setChecked] = useControlled({
      controlled: checkedProp,
      default: Boolean(defaultChecked),
      name: "Switch",
      state: "checked",
    });

    const {
      a11yProps: formFieldA11yProps,
      disabled: formFieldDisabled,
      readOnly: formFieldReadOnly,
    } = useFormFieldProps();

    const disabled = formFieldDisabled || disabledProp;
    const readOnly = formFieldReadOnly || readOnlyProp;

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      // Workaround for https://github.com/facebook/react/issues/9023
      if (event.nativeEvent.defaultPrevented || readOnly) {
        return;
      }

      const value = event.target.checked;
      setChecked(value);
      onChange?.(event);
      inputOnChange?.(event);
    };

    return (
      <label
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("checked")]: checked,
            [withBaseName("readOnly")]: readOnly,
          },
          className,
        )}
        ref={ref}
        {...rest}
      >
        <input
          aria-readonly={readOnly || undefined}
          aria-describedby={
            clsx(formFieldA11yProps?.["aria-describedby"], inputDescribedBy) ||
            undefined
          }
          aria-labelledby={
            clsx(formFieldA11yProps?.["aria-labelledby"], inputLabelledBy) ||
            undefined
          }
          name={name}
          value={value}
          checked={checked}
          className={clsx(withBaseName("input"), inputClassName)}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onBlur={onBlur}
          onChange={handleChange}
          onFocus={onFocus}
          type="checkbox"
          // biome-ignore lint/a11y/useAriaPropsForRole: aria-checked is not needed when input and checked is used.
          role="switch"
          {...restInputProps}
        />
        <span className={withBaseName("track")}>
          <span className={withBaseName("thumb")}>
            {checked && !readOnly && (
              <CheckmarkSolidIcon
                aria-hidden
                className={withBaseName("icon")}
              />
            )}
            {checked && readOnly && (
              <CheckmarkIcon aria-hidden className={withBaseName("icon")} />
            )}
          </span>
        </span>
        {label && <span className={withBaseName("label")}>{label}</span>}
      </label>
    );
  },
);
