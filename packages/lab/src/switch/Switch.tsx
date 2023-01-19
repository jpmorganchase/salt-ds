import { clsx } from "clsx";
import {
  ChangeEvent,
  FocusEvent,
  forwardRef,
  InputHTMLAttributes,
  useCallback,
  useRef,
  useState,
} from "react";
import { makePrefixer, useControlled } from "@salt-ds/core";
import { ControlLabel, ControlLabelProps } from "../control-label";
import { useFormFieldProps } from "../form-field-context";
import { CheckedIcon } from "./assets/CheckedIcon";

import "./Switch.css";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: ControlLabelProps["label"];
  LabelProps?: Partial<ControlLabelProps>;
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

const withBaseName = makePrefixer("saltSwitch");

export const Switch = forwardRef<HTMLLabelElement, SwitchProps>(function Switch(
  props,
  ref
) {
  const { a11yProps } = useFormFieldProps();

  const {
    checked: checkedProp,
    className,
    color,
    defaultChecked,
    disabled,
    label,
    LabelProps,
    onBlur,
    onChange,
    onFocus,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [checked, setChecked] = useControlled({
    controlled: checkedProp,
    default: Boolean(defaultChecked),
    name: "Switch",
    state: "checked",
  });

  const [focusVisible, setFocusVisible] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setChecked(value);
    onChange?.(event, value);
  };

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      // Fix for https://github.com/facebook/react/issues/7769
      if (!inputRef.current) {
        inputRef.current = event.currentTarget;
      }

      // TODO :focus-visible not yet supported on Safari, so we'll need to use the
      // useIsFocusVisible polyfill
      if (inputRef.current?.matches(":focus-visible")) {
        setFocusVisible(true);
      }

      onFocus?.(event);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setFocusVisible(false);
      onBlur?.(event);
    },
    [onBlur]
  );

  return (
    <ControlLabel
      {...LabelProps}
      className={clsx(
        withBaseName("label"),
        { [withBaseName("disabled")]: disabled },
        className
      )}
      disabled={disabled}
      label={label}
      ref={ref}
    >
      <span className={clsx(withBaseName(), className)}>
        <span
          className={clsx(withBaseName("base"), {
            [withBaseName("checked")]: checked,
            [withBaseName("focusVisible")]: focusVisible,
          })}
        >
          <span className={withBaseName("inputContainer")}>
            <input
              className={withBaseName("input")}
              checked={checked}
              disabled={disabled}
              onBlur={handleBlur}
              onChange={handleChange}
              onFocus={handleFocus}
              ref={inputRef}
              type="checkbox"
              {...a11yProps}
              {...rest}
            />
            {checked ? (
              <CheckedIcon className={withBaseName("icon")} />
            ) : (
              <span className={withBaseName("thumb")} />
            )}
          </span>
        </span>
        <span className={withBaseName("track")} />
      </span>
    </ControlLabel>
  );
});
