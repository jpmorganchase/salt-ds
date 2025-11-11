import { FormField, FormFieldLabel } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import Decimal from "decimal.js";

export const DecimalJS = () => {
  const isInternationalFormat = (inputValue: string): boolean =>
    /^[+-]?(\d{1,3}(,\d{0,3})*|\d*)(\.?\d*)?$/.test(inputValue);

  const customIncrement = (
    value: string,
    step: number,
    stepMultiplier: number,
  ) => {
    // Use decimal.js/Decimal for safe arithmetic
    const decimalValue = new Decimal(value);
    const incrementStep = new Decimal(step).mul(stepMultiplier);
    const result = decimalValue.add(incrementStep);
    return result.toString();
  };

  const customDecrement = (
    value: string,
    step: number,
    stepMultiplier: number,
  ) => {
    // Use decimal.js/Decimal for safe arithmetic
    const decimalValue = new Decimal(value);
    const decrementStep = new Decimal(step).mul(stepMultiplier);
    const result = decimalValue.sub(decrementStep);
    return result.toString();
  };

  return (
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Number input with high precision support</FormFieldLabel>
      <NumberInput
        defaultValue={1.10025}
        pattern={isInternationalFormat}
        decrement={customDecrement}
        increment={customIncrement}
        format={(value) => {
          if (!value.length) {
            return value;
          }
          const decimalValue = new Decimal(value).toDecimalPlaces(5);
          return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 5,
          }).format(decimalValue.toNumber());
        }}
        parse={(value) => {
          if (!value.length) {
            return null;
          }
          const sanitized = value.replace(/,/g, "");
          try {
            const decimalValue = new Decimal(sanitized);
            return decimalValue.toNumber();
          } catch (_e) {
            // If parsing fails (invalid input), return null
            return null;
          }
        }}
        onNumberChange={(_event, newValue) => {
          console.log(`Number changed to ${newValue}`);
        }}
      />
    </FormField>
  );
};
