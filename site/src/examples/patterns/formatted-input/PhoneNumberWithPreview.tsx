import {
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
  Text,
  useBreakpoint,
} from "@salt-ds/core";
import type { ReactNode } from "react";
import { useFormattedInput } from "./useFormattedInput";

const PhoneNumberLabelWithPreview = ({
  previewText,
}: {
  previewText: ReactNode;
}) => (
  <FlexLayout direction="row" align="center" justify="space-between" gap={1}>
    <FormFieldLabel>Phone number</FormFieldLabel>
    {previewText && (
      <Text styleAs="label" color="secondary">
        {previewText}
      </Text>
    )}
  </FlexLayout>
);

export const PhoneNumberWithPreview = () => {
  const defaultHelperText = "Enter a US phone number, e.g. +1 (555) 000-0000.";

  const { matchedBreakpoints } = useBreakpoint();
  const isBelowSm = !matchedBreakpoints.includes("sm");

  const formatPhoneNumber = (cleaned: string) => {
    if (cleaned.length === 0) {
      return "";
    }
    if (cleaned.length <= 4) {
      // Keep the partial format balanced while typing (close the paren when
      // we have at least 4 digits, otherwise show just the country code).
      return cleaned.length < 4
        ? `+${cleaned.slice(0, 1)} ${cleaned.slice(1)}`.trimEnd()
        : `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)})`;
    }
    if (cleaned.length <= 7) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    }
    if (cleaned.length <= 11) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return cleaned;
  };

  const generatePreview = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 0 && cleaned.length <= 11) {
      return formatPhoneNumber(cleaned);
    }
    return "";
  };

  const buildPhoneOptions = () => ({
    formatValue: (cleaned: string) =>
      cleaned.length === 11 ? formatPhoneNumber(cleaned) : cleaned,
    normalizedValue: (value: string) => value.replace(/\D/g, ""),
    validateNormalized: (normalized: string) => normalized.length === 11,
    hasInvalidChars: (value: string) => /[^0-9()\s+-]/.test(value),
    invalidCharMessage: "Only numbers and () + - are allowed.",
    invalidCharBlurMessage:
      "Remove letters and symbols—Only numbers and () + - are allowed.",
    invalidFormatMessage:
      "Please enter a valid US phone number: country code (1) + area code + number.",
    generatePreview,
  });

  const {
    displayValue,
    inputValue,
    preview,
    validationStatus,
    validationMessage,
    handleChange,
    handleBlur,
    handleFocus,
  } = useFormattedInput(buildPhoneOptions());

  const {
    displayValue: displayValue2,
    inputValue: inputValue2,
    preview: preview2,
    validationStatus: validationStatus2,
    validationMessage: validationMessage2,
    handleChange: handleChange2,
    handleBlur: handleBlur2,
    handleFocus: handleFocus2,
  } = useFormattedInput(buildPhoneOptions());

  return (
    <FlexLayout direction="row" align="start" gap={2} wrap>
      <StackLayout gap={1}>
        <FormField
          style={{ width: "300px" }}
          validationStatus={validationStatus}
        >
          <PhoneNumberLabelWithPreview previewText={preview} />
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
            {validationMessage || defaultHelperText}
          </FormFieldHelperText>
        </FormField>
        {inputValue.length > 0 && (
          <Text color="secondary" styleAs="label">
            Value for submission: <strong>{inputValue}</strong>
          </Text>
        )}
      </StackLayout>
      <StackLayout gap={1}>
        <FormField
          style={{ width: "300px" }}
          validationStatus={validationStatus2}
        >
          {isBelowSm ? (
            <PhoneNumberLabelWithPreview previewText={preview2} />
          ) : (
            <FormFieldLabel>Phone number</FormFieldLabel>
          )}
          <FlexLayout direction="row" align="center" gap={1.5}>
            <Input
              value={displayValue2}
              onChange={handleChange2}
              onBlur={handleBlur2}
              onFocus={handleFocus2}
              placeholder="+1 (000) 000-0000"
              bordered
              style={{ width: isBelowSm ? "100%" : "210px" }}
              inputProps={{
                "aria-invalid":
                  validationStatus2 === "error" ? true : undefined,
                autoComplete: "tel",
              }}
            />
            {!isBelowSm && (
              <Text
                styleAs="label"
                color="secondary"
                style={{
                  minWidth: "150px",
                  visibility: preview2 ? "visible" : "hidden",
                }}
              >
                {preview2}
              </Text>
            )}
          </FlexLayout>
          <FormFieldHelperText
            style={{ maxWidth: isBelowSm ? "100%" : "210px" }}
          >
            {validationMessage2 || defaultHelperText}
          </FormFieldHelperText>
        </FormField>
        {inputValue2.length > 0 && (
          <Text color="secondary" styleAs="label">
            Value for submission: <strong>{inputValue2}</strong>
          </Text>
        )}
      </StackLayout>
    </FlexLayout>
  );
};
