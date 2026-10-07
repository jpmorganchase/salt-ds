import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { useFormattedInput } from "./useFormattedInput";

export const CreditCard = () => {
  const formatCreditCard = (cleaned: string) => {
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(" ") : cleaned;
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
    formatValue: formatCreditCard,
    normalizedValue: (value) => value.replace(/[\s-]/g, ""),
    validateNormalized: (cleaned) => /^\d{16}$/.test(cleaned),
    hasInvalidChars: (value: string) => /[^\d\s-]/.test(value),
    invalidCharMessage: "Only numbers, spaces and hyphens are allowed.",
    invalidCharBlurMessage:
      "Remove invalid characters—Only numbers, spaces and hyphens are allowed.",
    invalidFormatMessage: "Please enter a valid 16-digit card number.",
  });

  return (
    <StackLayout gap={2} style={{ width: "300px" }}>
      <FormField validationStatus={validationStatus}>
        <FormFieldLabel>Credit card number</FormFieldLabel>
        <Input
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="5555 5555 5555 4444"
          bordered
          inputProps={{
            "aria-invalid": validationStatus === "error" ? true : undefined,
            autoComplete: "cc-number",
          }}
        />
        <FormFieldHelperText>
          {validationMessage || "Enter your 16-digit card number."}
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
