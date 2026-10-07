import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { useFormattedInput } from "./useFormattedInput";

export const PostalCode = () => {
  // UK full postal codes: outward + inward, e.g. M1 1AA, CR2 6XH, W1A 1HQ,
  // EC1A 1BB, SW1A 1AA. The regex matches the full code (no space) after
  // normalization.
  const UK_POSTAL_CODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/;

  const formatPostalCode = (cleaned: string) => {
    // US ZIP code (5 digits)
    if (/^\d{5}$/.test(cleaned)) {
      return cleaned;
    }

    // UK postal code format - insert space 3 characters from the end. Only
    // apply once the input is long enough to be a full UK postcode, so we
    // don't insert a space into in-progress entries like "ABCD".
    if (cleaned.length >= 5 && UK_POSTAL_CODE_REGEX.test(cleaned)) {
      const outwardCode = cleaned.slice(0, -3);
      const inwardCode = cleaned.slice(-3);
      return `${outwardCode} ${inwardCode}`;
    }

    return cleaned;
  };

  const validatePostalCode = (cleaned: string) => {
    // US ZIP code: 5 digits
    if (/^\d{5}$/.test(cleaned)) {
      return true;
    }

    // UK postal code: the regex enforces the 5–7 char shape itself.
    return UK_POSTAL_CODE_REGEX.test(cleaned);
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
    formatValue: formatPostalCode,
    normalizedValue: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
    validateNormalized: validatePostalCode,
    hasInvalidChars: (value: string) => /[^a-zA-Z0-9\s]/.test(value),
    invalidCharMessage: "Only letters, numbers, and spaces are allowed.",
    invalidCharBlurMessage:
      "Remove invalid characters—Only letters, numbers, and spaces are allowed.",
    invalidFormatMessage:
      "Please enter a valid postal code (e.g., 12345 or E14 5JP or SW1A 1AA).",
    transformOnChange: (v) => v.toUpperCase(),
  });

  return (
    <StackLayout gap={2} style={{ width: "300px" }}>
      <FormField validationStatus={validationStatus}>
        <FormFieldLabel>Postal Code</FormFieldLabel>
        <Input
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="12345 or E14 5JP or SW1A 1AA"
          bordered
          inputProps={{
            "aria-invalid": validationStatus === "error" ? true : undefined,
            autoComplete: "postal-code",
          }}
        />
        <FormFieldHelperText>
          {validationMessage || "Enter your postal code."}
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
