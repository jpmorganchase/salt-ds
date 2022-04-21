import {
  ChangeEventHandler,
  FC,
  forwardRef,
  HTMLAttributes,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import classnames from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { useFormFieldProps } from "../form-field-context";
import { useId } from "../utils";
import { FormLabel } from "../form-field";
import { RadioGroupContext } from "./internal/RadioGroupContext";
import { FormGroup } from "../form-group";
import { RadioButton } from "./RadioButton";
import "./RadioButtonGroup.css";
import { RadioIconProps } from "./RadioIcon";

const withBaseName = makePrefixer("uitkRadioButtonGroup");

export interface RadioButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  defaultValue?: string;
  icon?: FC<RadioIconProps>;
  legend?: string;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  radios?: {
    disabled?: boolean;
    label?: string;
    value?: string;
  }[];
  row?: boolean;
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
    icon,
    radios,
    onChange,
    value: valueProp,
    row,
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
      className={classnames(
        withBaseName(),
        row ? withBaseName("horizontal") : withBaseName("vertical")
      )}
      data-testid="radio-button-group"
      ref={ref}
      role="radiogroup"
      {...a11yProps}
    >
      {!inFormField && (
        <FormLabel
          className={classnames(className, withBaseName("legend"))}
          label={legend}
        />
      )}

      <RadioGroupContext.Provider
        value={{ name, onChange: handleChange, value: getValue() }}
      >
        <FormGroup role="radiogroup" {...rest} row={row}>
          {(radios &&
            radios.map((radio) => (
              <RadioButton
                disabled={radio.disabled}
                icon={icon}
                key={radio.label}
                label={radio.label}
                value={radio.value}
              />
            ))) ||
            children}
        </FormGroup>
      </RadioGroupContext.Provider>
    </fieldset>
  );
});
