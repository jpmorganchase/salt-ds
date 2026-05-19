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
import type { Meta, StoryFn } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { useFormattedInput } from "./useFormattedInput";

export default {
  title: "Patterns/Formatted Input",
  component: Input,
} as Meta;

export const PhoneNumber: StoryFn = () => {
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
      "Please enter a valid phone number, including country and area code.",
    warnCondition: hasUnusualAreaCode,
    warnMessage:
      "The phone number entered is valid, but the area code appears to be unusual.",
    successMessage: "Phone number is valid.",
  });

  return (
    <FormField style={{ width: "300px" }} validationStatus={validationStatus}>
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
          "Enter your phone number, including the country code and area code."}
      </FormFieldHelperText>
    </FormField>
  );
};

export const PhoneNumberWithPreview: StoryFn = () => {
  const defaultHelperText =
    "Enter your phone number, including the country code and area code.";

  const { matchedBreakpoints } = useBreakpoint();
  const isMobile = matchedBreakpoints.indexOf("sm") === -1;

  const formatPhoneNumber = (cleaned: string) => {
    if (cleaned.length === 0) {
      return "";
    }
    if (cleaned.length <= 4) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1)}`;
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

  const phoneInputOptions = {
    formatValue: (cleaned: string) =>
      cleaned.length === 11 ? formatPhoneNumber(cleaned) : cleaned,
    normalizedValue: (value: string) => value.replace(/\D/g, ""),
    validateNormalized: (normalized: string) => normalized.length === 11,
    hasInvalidChars: (value: string) => /[^0-9()\s+-]/.test(value),
    invalidCharMessage: "Only numbers and () + - are allowed.",
    invalidCharBlurMessage:
      "Remove letters and symbols—Only numbers and () + - are allowed.",
    invalidFormatMessage:
      "Please enter a valid phone number, including country and area code.",
    generatePreview: generatePreview,
  };

  const {
    displayValue,
    preview,
    validationStatus,
    validationMessage,
    handleChange,
    handleBlur,
    handleFocus,
  } = useFormattedInput(phoneInputOptions);

  const {
    displayValue: displayValue2,
    preview: preview2,
    validationStatus: validationStatus2,
    validationMessage: validationMessage2,
    handleChange: handleChange2,
    handleBlur: handleBlur2,
    handleFocus: handleFocus2,
  } = useFormattedInput(phoneInputOptions);

  const getFormFieldLabel = (preview: string) => {
    return (
      <StackLayout
        direction="row"
        align="center"
        gap={1}
        style={{ justifyContent: "space-between" }}
      >
        <FormFieldLabel>Phone number</FormFieldLabel>
        {preview && (
          <Text styleAs="label" color="secondary">
            {preview}
          </Text>
        )}
      </StackLayout>
    );
  };

  return (
    <FlexLayout direction="column" align="start" gap={2}>
      <FormField style={{ width: "300px" }} validationStatus={validationStatus}>
        {getFormFieldLabel(preview)}
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
      <FormField
        validationStatus={validationStatus2}
        labelPlacement={isMobile ? "top" : "left"}
        style={{ "--saltFormField-label-width": "auto" } as CSSProperties}
      >
        {isMobile ? (
          getFormFieldLabel(preview2)
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
            style={{ width: isMobile ? "100%" : "210px" }}
            inputProps={{
              "aria-invalid": validationStatus2 === "error" ? true : undefined,
              autoComplete: "tel",
            }}
          />
          {!isMobile && (
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
        <FormFieldHelperText style={{ maxWidth: isMobile ? "100%" : "210px" }}>
          {validationMessage2 || defaultHelperText}
        </FormFieldHelperText>
      </FormField>
    </FlexLayout>
  );
};

export const CreditCard: StoryFn = () => {
  const formatCreditCard = (cleaned: string) => {
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join("-") : cleaned;
  };
  const {
    displayValue,
    validationStatus,
    validationMessage,
    handleChange,
    handleBlur,
    handleFocus,
  } = useFormattedInput({
    formatValue: formatCreditCard,
    normalizedValue: (value) => value.replace(/[\s-]/g, ""),
    validateNormalized: (cleaned) =>
      cleaned.length === 16 && /^\d{16}$/.test(cleaned),
    hasInvalidChars: (value: string) => /[^\d\s-]/.test(value),
    invalidCharMessage: "Only numbers, spaces and hyphens are allowed.",
    invalidCharBlurMessage:
      "Remove invalid characters—Only numbers, spaces and hyphens are allowed.",
    invalidFormatMessage: "Please enter a valid 16-digit card number.",
  });

  return (
    <FormField style={{ width: "300px" }} validationStatus={validationStatus}>
      <FormFieldLabel>Credit card number</FormFieldLabel>
      <Input
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder="5555-5555-5555-4444"
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
  );
};

export const Currency: StoryFn = () => {
  const formatCurrency = (cleaned: string) => {
    const parts = cleaned.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : parts[0];
  };

  const validateCurrency = (cleaned: string) => {
    const parts = cleaned.split(".");
    if (parts.length > 2) return false;
    if (parts[0].length === 0) return false;
    return true;
  };

  const {
    displayValue,
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
    <FormField style={{ width: "300px" }} validationStatus={validationStatus}>
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
          autoComplete: "postal-code",
        }}
      />
      <FormFieldHelperText>
        {validationMessage || "Enter an amount in US dollars (numbers only)."}
      </FormFieldHelperText>
    </FormField>
  );
};

export const PostalCode: StoryFn = () => {
  // UK postal code patterns: various formats like E14 5JP, SW1A 1AA, etc.
  const UK_POSTALCODE_REGEX = /^[A-Z]{1,2}\d{1,2}[A-Z]?\d[A-Z]{2}$/;

  const formatPostalCode = (cleaned: string) => {
    // US ZIP code (5 digits)
    if (/^\d{5}$/.test(cleaned)) {
      return cleaned;
    }

    // UK postal code format - insert space 3 characters from the end
    if (cleaned.length > 3) {
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

    // UK postal code: 5-7 characters matching UK format
    return (
      cleaned.length >= 5 &&
      cleaned.length <= 7 &&
      UK_POSTALCODE_REGEX.test(cleaned)
    );
  };

  const {
    displayValue,
    validationStatus,
    validationMessage,
    handleChange,
    handleBlur,
    handleFocus,
  } = useFormattedInput({
    formatValue: formatPostalCode,
    normalizedValue: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
    validateNormalized: validatePostalCode,
    hasInvalidChars: (value: string) => /[^A-Z0-9\s]/.test(value),
    invalidCharMessage: "Only letters, numbers, and spaces are allowed.",
    invalidCharBlurMessage:
      "Remove invalid characters—Only letters, numbers, and spaces are allowed.",
    invalidFormatMessage:
      "Please enter a valid postal code (e.g., 12345 or E14 5JP or SW1A 1AA).",
    transformOnChange: (v) => v.toUpperCase(),
  });

  return (
    <FormField style={{ width: "300px" }} validationStatus={validationStatus}>
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
        }}
      />
      <FormFieldHelperText>
        {validationMessage || "Enter your postal code."}
      </FormFieldHelperText>
    </FormField>
  );
};
