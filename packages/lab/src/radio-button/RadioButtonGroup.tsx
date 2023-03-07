import { clsx } from "clsx";
import {
  ChangeEventHandler,
  forwardRef,
  HTMLAttributes,
  useState,
} from "react";
import { makePrefixer, useId } from "@salt-ds/core";
import { RadioGroupContext } from "./internal/RadioGroupContext";

import "./RadioButtonGroup.css";

const withBaseName = makePrefixer("saltRadioButtonGroup");

export type RadioButtonGroupDirectionProps = "horizontal" | "vertical";

export interface RadioButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  defaultValue?: string;
  direction?: RadioButtonGroupDirectionProps;
  /**
   * Only for horizontal direction. When `true` the text in radio button label will wrap to fit within the container. Otherwise the radio buttons will wrap onto the next line.
   */
  labelWrap?: boolean;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
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
    direction = "vertical",
    labelWrap,
    name: nameProp,
    onChange,
    value: valueProp,
    ...rest
  } = props;

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
    >
      <RadioGroupContext.Provider
        value={{ name, onChange: handleChange, value: getValue() }}
      >
        <div
          className={clsx(withBaseName(direction), {
            [withBaseName("labelWrap")]:
              direction === "horizontal" && labelWrap,
          })}
          {...rest}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    </fieldset>
  );
});
