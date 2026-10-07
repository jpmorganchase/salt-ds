import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { useFormattedInput } from "./useFormattedInput";

export const Currency = () => {
  const formatCurrency = (cleaned: string) => {
    const parts = cleaned.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : parts[0];
  };

  const validateCurrency = (cleaned: string) => {
    const parts = cleaned.split(".");
    if (parts.length > 2) return false;
    if (parts[0].length === 0) return false;
    // Reject a trailing dot with no fractional digits (e.g. "123.").
    return !(parts.length === 2 && parts[1].length === 0);
  };

  const {
    displayValue,
    inputValue,
    validationStatus,
    validationMessage,
    handleChange,
    handleBlur,
    handleFocus,
  } = useFormattedInput({
    formatValue: formatCurrency,
    normalizedValue: (value: string) => value.replace(/[^\d.]/g, ""),
    validateNormalized: validateCurrency,
    hasInvalidChars: (value: string) => /[^\d.,]/.test(value),
    invalidCharMessage: "Only numbers, periods, and commas are allowed.",
    invalidCharBlurMessage:
      "Remove invalid characters—Only numbers, periods, and commas are allowed.",
    invalidFormatMessage: "Please enter a valid amount.",
  });

  return (
    <StackLayout gap={2} style={{ width: "300px" }}>
      <FormField validationStatus={validationStatus}>
        <FormFieldLabel>Amount</FormFieldLabel>
        <Input
          startAdornment={<Text>$</Text>}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="0.00"
          bordered
          inputProps={{
            "aria-invalid": validationStatus === "error" ? true : undefined,
          }}
        />
        <FormFieldHelperText>
          {validationMessage || "Enter an amount in US dollars (numbers only)."}
        </FormFieldHelperText>
      </FormField>
      {inputValue.length > 0 && (
        <Text color="secondary" styleAs="label">
          Value for submission: <strong>{inputValue}</strong>
        </Text>
      )}
    </StackLayout>
  );
};
