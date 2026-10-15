import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { useFormattedInput } from "./useFormattedInput";

export const PhoneNumber = () => {
  const formatPhoneNumber = (cleaned: string) => {
    if (cleaned.length === 11) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return cleaned;
  };

  const hasUnusualAreaCode = (cleaned: string) => {
    if (cleaned.length === 11) {
      const areaCodeNum = Number.parseInt(cleaned.slice(1, 4), 10);
      return areaCodeNum < 100;
    }
    return false;
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
    formatValue: formatPhoneNumber,
    normalizedValue: (value) => value.replace(/\D/g, ""),
    validateNormalized: (normalized) => normalized.length === 11,
    hasInvalidChars: (value: string) => /[^0-9()\s+-]/.test(value),
    invalidCharMessage: "Only numbers and () + - are allowed.",
    invalidCharBlurMessage:
      "Remove letters and symbols—Only numbers and () + - are allowed.",
    invalidFormatMessage:
      "Please enter a valid US phone number: country code (1) + area code + number.",
    warnCondition: hasUnusualAreaCode,
    warnMessage:
      "The phone number entered is valid, but the area code appears to be unusual.",
    successMessage: "Phone number is valid.",
  });

  return (
    <StackLayout gap={2} style={{ width: "300px" }}>
      <FormField validationStatus={validationStatus}>
        <FormFieldLabel>Phone number</FormFieldLabel>
        <Input
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="+1 (000) 000-0000"
          bordered
          inputProps={{
            "aria-invalid": validationStatus === "error" ? true : undefined,
            autoComplete: "tel",
          }}
        />
        <FormFieldHelperText>
          {validationMessage ||
            "Enter a US phone number, e.g. +1 (555) 000-0000."}
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
