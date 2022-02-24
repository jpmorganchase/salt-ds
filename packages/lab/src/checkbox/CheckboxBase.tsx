import {
  ChangeEvent,
  FocusEvent,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  InputHTMLAttributes,
  useCallback,
  useRef,
  useState,
} from "react";
import classnames from "classnames";
import { useControlled } from "../utils";

import "./CheckboxBase.css";

import {
  CheckboxIcon,
  CheckboxCheckedIcon,
  CheckboxIndeterminateIcon,
} from "./assets";

export interface CheckboxBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>;
  name?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /**
   * Callback when checked state is changed
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  value?: string;
}

const classBase = "uitkCheckboxBase";

export const CheckboxBase = forwardRef<HTMLDivElement, CheckboxBaseProps>(
  function CheckboxBase(
    {
      checked: checkedProp,
      className: classNameProp,
      defaultChecked,
      disabled,
      indeterminate,
      inputProps,
      name,
      onBlur,
      onChange,
      onFocus,
      value,
      ...rest
    },
    ref
  ) {
    // null is needed here so we can modify the ref on line 70
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [checked, setChecked] = useControlled({
      controlled: checkedProp,
      default: Boolean(defaultChecked),
      name: "Checkbox",
      state: "checked",
    });

    const [focusVisible, setFocusVisible] = useState(false);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      // Workaround for https://github.com/facebook/react/issues/9023
      if (event.nativeEvent.defaultPrevented) {
        return;
      }

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

        onFocus && onFocus(event);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        setFocusVisible(false);
        onBlur && onBlur(event);
      },
      [onBlur]
    );

    const className = classnames(classBase, classNameProp, {
      [`${classBase}-checked`]: checked,
      [`${classBase}-disabled`]: disabled,
      [`${classBase}-focusVisible`]: focusVisible,
      [`${classBase}-indeterminate`]: indeterminate,
    });
    return (
      <span {...rest} className={className} ref={ref}>
        <span className={`${classBase}-label`}>
          <input
            aria-checked={indeterminate ? "mixed" : checked}
            name={name}
            value={value}
            {...inputProps}
            checked={checkedProp}
            className={`${classBase}-input`}
            data-indeterminate={indeterminate}
            defaultChecked={defaultChecked}
            disabled={disabled}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            ref={inputRef}
            type="checkbox"
          />
          {indeterminate ? (
            <CheckboxIndeterminateIcon className={`${classBase}-icon`} />
          ) : checked ? (
            <CheckboxCheckedIcon className={`${classBase}-icon`} />
          ) : (
            <CheckboxIcon className={`${classBase}-icon`} />
          )}
        </span>
      </span>
    );
  }
);
