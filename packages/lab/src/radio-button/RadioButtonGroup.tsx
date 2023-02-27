import { clsx } from "clsx";
import {
  ChangeEventHandler,
  forwardRef,
  HTMLAttributes,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { makePrefixer, useId } from "@salt-ds/core";
import { useFormFieldProps } from "../form-field-context";
import { FormLabel } from "../form-field";
import { RadioGroupContext } from "./internal/RadioGroupContext";
import { RadioButton } from "./RadioButton";

import "./RadioButtonGroup.css";

const withBaseName = makePrefixer("saltRadioButtonGroup");

export type RadioButtonGroupDirectionProp = "horizontal" | "vertical";

export interface RadioButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  defaultValue?: string;
  direction?: RadioButtonGroupDirectionProp;
  legend?: string;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  radios?: {
    disabled?: boolean;
    label?: string;
    value?: string;
  }[];
  value?: string;
}

export const RadioButtonGroup = forwardRef<
  HTMLFieldSetElement,
  RadioButtonGroupProps
>(function RadioButtonGroup(props, ref) {
  const {
    children,
    className,
    defaultValue,
    legend,
    radios,
    onChange,
    value: valueProp,
    direction = "vertical",
    name: nameProp,
    ...rest
  } = props;

  const { inFormField, a11yProps } = useFormFieldProps({
    focusVisible: false,
  });

  const [stateValue, setStateValue] = useState(props.defaultValue);

  const getValue = () => (isControlled() ? props.value : stateValue);

  const isControlled = () => props.value !== undefined;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!isControlled()) {
      setStateValue(event.target.value);
    }
    if (props.onChange) {
      props.onChange(event);
    }
  };

  const rootRef = useRef<HTMLFieldSetElement>(null);

  useImperativeHandle(
    undefined,
    () => ({
      focus: () => {
        const current = rootRef.current;
        if (current) {
          let input: HTMLInputElement | null = current.querySelector(
            "input:not(:disabled):checked"
          );
          if (!input) {
            input = current.querySelector("input:not(:disabled)");
          }
          if (input) {
            input.focus();
          }
        }
      },
    }),
    []
  );

  const name = useId(nameProp);

  return (
    <fieldset
      className={clsx(withBaseName(), className)}
      data-testid="radio-button-group"
      ref={ref}
      role="radiogroup"
      {...a11yProps}
    >
      {!inFormField && (
        <FormLabel className={clsx(withBaseName("legend"))} label={legend} />
      )}

      <RadioGroupContext.Provider
        value={{ name, onChange: handleChange, value: getValue() }}
      >
        <div className={clsx(withBaseName(direction))} {...rest}>
          {(radios &&
            radios.map((radio) => (
              <RadioButton
                disabled={radio.disabled}
                key={radio.label}
                label={radio.label}
                value={radio.value}
              />
            ))) ||
            children}
        </div>
      </RadioGroupContext.Provider>
    </fieldset>
  );
});
