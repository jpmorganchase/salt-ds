import { ChangeEventHandler, ReactElement, useState } from "react";
import {
  FormField,
  Checkbox,
  CheckboxGroup,
  RadioButton,
  RadioButtonGroup,
  FlowLayout,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
} from "@salt-ds/core";

const radioData = [
  {
    label: "Ultimate Parent",
    value: "parent",
  },
  {
    label: "Subsidiary",
    value: "subsidiary",
  },
];

const checkboxesData = [
  {
    label: "Discretionary fee",
    value: "discretionary",
  },
  {
    label: "Retainer fee",
    value: "retainer",
  },
  {
    disabled: true,
    label: "Other fee",
    value: "other",
  },
];

export const WithCheckboxAndRadioButton = (): ReactElement => {
  const [isRadioError, setIsRadioError] = useState(true);

  const [radioGroupValue, setRadioGroupValue] = useState("");
  const [checkboxGroupValue, setCheckboxGroupValue] = useState<string[]>([]);

  const handleRadioChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setRadioGroupValue(value);
    isRadioError && setIsRadioError(false);
  };

  const handleCheckboxChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const { value } = event.target;
    if (checkboxGroupValue.indexOf(value) === -1) {
      setCheckboxGroupValue((prevControlledValues) => [
        ...prevControlledValues,
        value,
      ]);
    } else {
      setCheckboxGroupValue((prevControlledValues) =>
        prevControlledValues.filter(
          (controlledValue) => controlledValue !== value
        )
      );
    }
  };

  const isCheckboxError = checkboxGroupValue.length === 0;

  return (
    <FlowLayout style={{ width: "356px" }}>
      <FormField>
        <FormFieldLabel>Client directed request</FormFieldLabel>
        <RadioButtonGroup direction="horizontal">
          <RadioButton key="option1" label="Yes" value="yes" />
          <RadioButton key="option2" label="No" value="no" />
        </RadioButtonGroup>
      </FormField>
      <FormField>
        <FormFieldLabel>Assignment</FormFieldLabel>
        <CheckboxGroup>
          <Checkbox label="Private placement of equity or debt securities" />
          <Checkbox defaultChecked label="Syndicated credit facility or loan" />
          <Checkbox label="Interest rate, foreign exchange or commodity hedging or equity derivative" />
          <Checkbox label="Escrow arrangement" />
          <Checkbox label="Restructuring of debt securities of the Counterparty or the Company" />
        </CheckboxGroup>
        <FormFieldHelperText>Select all appropriate</FormFieldHelperText>
      </FormField>
      <FormField validationStatus={isRadioError ? "error" : undefined}>
        <FormFieldLabel>Deal owner</FormFieldLabel>
        <RadioButtonGroup onChange={handleRadioChange} value={radioGroupValue}>
          {radioData.map((radio) => {
            return (
              <RadioButton
                key={radio.label}
                label={radio.label}
                value={radio.value}
              />
            );
          })}
        </RadioButtonGroup>
        <FormFieldHelperText>{`${
          isRadioError ? "Must select one option. " : ""
        }Is this deal for the ultimate parent or a subsidiary?`}</FormFieldHelperText>
      </FormField>
      <FormField validationStatus={isCheckboxError ? "error" : undefined}>
        <FormFieldLabel>Fee type</FormFieldLabel>
        <CheckboxGroup
          checkedValues={checkboxGroupValue}
          onChange={handleCheckboxChange}
        >
          {checkboxesData.map((data) => (
            <Checkbox key={data.value} {...data} />
          ))}
        </CheckboxGroup>
        <FormFieldHelperText>{`${
          isCheckboxError ? "Must select at least one option. " : ""
        }`}</FormFieldHelperText>
      </FormField>
    </FlowLayout>
  );
};
