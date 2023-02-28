import { clsx } from "clsx";
import {
  ChangeEventHandler,
  forwardRef,
  HTMLAttributes,
  useState,
} from "react";
import { makePrefixer, useId } from "@salt-ds/core";
import { RadioGroupContext } from "./internal/RadioGroupContext";
import { RadioButton } from "./RadioButton";

import "./RadioButtonGroup.css";

const withBaseName = makePrefixer("saltRadioButtonGroup");

export type RadioButtonGroupDirectionProps = "horizontal" | "vertical";

export interface RadioButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  defaultValue?: string;
  direction?: RadioButtonGroupDirectionProps;
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

  //TODO: to be added with FormField implementation
  // const { inFormField, a11yProps } = useFormFieldProps({
  //   focusVisible: false,
  // });

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

  const name = nameProp || useId();

  return (
    <fieldset
      className={clsx(withBaseName(), className)}
      data-testid="radio-button-group"
      ref={ref}
      role="radiogroup"
      //TODO: to be added with FormField implementation
      // {...a11yProps}
    >
      {legend && (
        <label className={clsx(withBaseName("legend"))}>{legend}</label>
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
                name={name}
              />
            ))) ||
            children}
        </div>
      </RadioGroupContext.Provider>
    </fieldset>
  );
});
