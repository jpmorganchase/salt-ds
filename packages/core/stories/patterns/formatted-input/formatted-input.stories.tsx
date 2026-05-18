import {
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
  Text,
} from "@salt-ds/core";
import "@salt-ds/countries/saltCountries.css";
import type { Meta, StoryFn } from "@storybook/react-vite";
import {
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  useState,
} from "react";

export default {
  title: "Patterns/Formatted Input",
  component: Input,
} as Meta;

export const PhoneNumber: StoryFn = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [validationStatus, setValidationStatus] = useState<
    "error" | "warning" | "success" | undefined
  >(undefined);
  const [validationMessage, setValidationMessage] = useState("");
  const defaultHelperText =
    "Enter your phone number, including the country code and area code.";

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

  const handleValidation = (
    status: "error" | "warning" | "success" | undefined,
    message: string,
  ) => {
    setValidationStatus(status);
    setValidationMessage(message);
  };

  const hasInvalidChars = (value: string) => /[^0-9()\s+-]/.test(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayValue(value);

    if (hasInvalidChars(value)) {
      handleValidation("error", "Only numbers and () + - are allowed.");
    } else {
      handleValidation(undefined, "");
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    const normalized = value.replace(/\D/g, "");

    if (hasInvalidChars(value)) {
      handleValidation(
        "error",
        "Remove letters and symbols—Only numbers and () + - are allowed.",
      );
      return;
    }

    if (normalized.length === 0) {
      setDisplayValue("");
      handleValidation(undefined, "");
    } else if (normalized.length === 11) {
      const formatted = formatPhoneNumber(normalized);
      setDisplayValue(formatted);

      if (hasUnusualAreaCode(normalized)) {
        handleValidation(
          "warning",
          "The phone number entered is valid, but the area code appears to be unusual.",
        );
      } else {
        handleValidation("success", "Phone number is valid.");
      }
    } else {
      handleValidation(
        "error",
        "Please enter a valid phone number, including country and area code.",
      );
    }
  };

  const handleFocus = () => {
    if (phoneNumber) {
      setDisplayValue(phoneNumber);
    }
  };

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
      />
      <FormFieldHelperText
        aria-live={validationStatus ? "assertive" : "polite"}
        aria-atomic="true"
      >
        {validationMessage || defaultHelperText}
      </FormFieldHelperText>
    </FormField>
  );
};

export const PhoneNumberWithPreview: StoryFn = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [preview, setPreview] = useState("");
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [validationMessage, setValidationMessage] = useState("");
  const defaultHelperText =
    "Enter your phone number, including the country code and area code.";

  const [phoneNumber2, setPhoneNumber2] = useState("");
  const [displayValue2, setDisplayValue2] = useState("");
  const [preview2, setPreview2] = useState("");
  const [validationStatus2, setValidationStatus2] = useState<
    "error" | undefined
  >(undefined);
  const [validationMessage2, setValidationMessage2] = useState("");

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

  const handleValidation = (status: "error" | undefined, message: string) => {
    setValidationStatus(status);
    setValidationMessage(message);
  };

  const hasInvalidChars = (value: string) => /[^0-9()\s+-]/.test(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayValue(value);

    if (hasInvalidChars(value)) {
      handleValidation("error", "Only numbers and () + - are allowed.");
      setPreview("");
    } else {
      handleValidation(undefined, "");
      setPreview(generatePreview(value));
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    const normalized = value.replace(/\D/g, "");

    if (hasInvalidChars(value)) {
      handleValidation(
        "error",
        "Remove letters and symbols—Only numbers and () + - are allowed.",
      );
      setPreview("");
      return;
    }

    if (normalized.length === 0) {
      setDisplayValue("");
      handleValidation(undefined, "");
      setPreview("");
    } else if (normalized.length === 11) {
      const formatted = formatPhoneNumber(normalized);
      setDisplayValue(formatted);
      handleValidation(undefined, "");
      setPreview("");
    } else {
      handleValidation(
        "error",
        "Please enter a valid phone number, including country and area code.",
      );
      setPreview("");
    }
  };

  const handleFocus = () => {
    if (phoneNumber) {
      setDisplayValue(phoneNumber);
      setPreview(generatePreview(phoneNumber));
    }
  };

  const handleChange2 = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayValue2(value);

    if (hasInvalidChars(value)) {
      setValidationStatus2("error");
      setValidationMessage2("Only numbers and () + - are allowed.");
      setPreview2("");
    } else {
      setValidationStatus2(undefined);
      setValidationMessage2("");
      setPreview2(generatePreview(value));
    }
  };

  const handleBlur2 = (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber2(value);
    const normalized = value.replace(/\D/g, "");

    if (hasInvalidChars(value)) {
      setValidationStatus2("error");
      setValidationMessage2(
        "Remove letters and symbols—Only numbers and () + - are allowed.",
      );
      setPreview2("");
      return;
    }

    if (normalized.length === 0) {
      setDisplayValue2("");
      setValidationStatus2(undefined);
      setValidationMessage2("");
      setPreview2("");
    } else if (normalized.length === 11) {
      const formatted = formatPhoneNumber(normalized);
      setDisplayValue2(formatted);
      setValidationStatus2(undefined);
      setValidationMessage2("");
      setPreview2("");
    } else {
      setValidationStatus2("error");
      setValidationMessage2(
        "Please enter a valid phone number, including country and area code.",
      );
      setPreview2("");
    }
  };

  const handleFocus2 = () => {
    if (phoneNumber2) {
      setDisplayValue2(phoneNumber2);
      setPreview2(generatePreview(phoneNumber2));
    }
  };

  return (
    <FlexLayout direction="column" align="start" gap={2}>
      <FormField style={{ width: "300px" }} validationStatus={validationStatus}>
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
        <Input
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="+1 (000) 000-0000"
          bordered
        />
        <FormFieldHelperText
          aria-live={validationStatus ? "assertive" : "polite"}
          aria-atomic="true"
        >
          {validationMessage || defaultHelperText}
        </FormFieldHelperText>
      </FormField>
      <FormField
        validationStatus={validationStatus2}
        labelPlacement="left"
        style={{ "--saltFormField-label-width": "auto" } as CSSProperties}
      >
        <FormFieldLabel>Phone number</FormFieldLabel>
        <FlexLayout direction="row" align="center" gap={1.5}>
          <Input
            value={displayValue2}
            onChange={handleChange2}
            onBlur={handleBlur2}
            onFocus={handleFocus2}
            placeholder="+1 (000) 000-0000"
            bordered
            style={{ width: "210px" }}
          />
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
        </FlexLayout>
        <FormFieldHelperText
          aria-live={validationStatus2 ? "assertive" : "polite"}
          aria-atomic="true"
          style={{ maxWidth: "210px" }}
        >
          {validationMessage2 || defaultHelperText}
        </FormFieldHelperText>
      </FormField>
    </FlexLayout>
  );
};

export const CreditCard: StoryFn = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [validationMessage, setValidationMessage] = useState("");
  const defaultHelperText = "Enter your 16-digit card number.";

  const formatCreditCard = (cleaned: string) => {
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join("-") : cleaned;
  };

  const handleValidation = (status: "error" | undefined, message: string) => {
    setValidationStatus(status);
    setValidationMessage(message);
  };

  const hasInvalidChars = (value: string) => /[^\d\s-]/.test(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayValue(value);

    if (hasInvalidChars(value)) {
      handleValidation(
        "error",
        "Only numbers, spaces and hyphens are allowed.",
      );
    } else {
      handleValidation(undefined, "");
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardNumber(value);

    if (hasInvalidChars(value)) {
      handleValidation(
        "error",
        "Remove invalid characters—Only numbers, spaces and hyphens are allowed.",
      );
      return;
    }

    const cleaned = value.replace(/[\s-]/g, "");

    if (cleaned.length === 0) {
      setDisplayValue("");
      handleValidation(undefined, "");
    } else if (cleaned.length === 16 && /^\d{16}$/.test(cleaned)) {
      const formatted = formatCreditCard(cleaned);
      setDisplayValue(formatted);
      handleValidation(undefined, "");
    } else {
      handleValidation("error", "Please enter a valid 16-digit card number.");
    }
  };

  const handleFocus = () => {
    if (cardNumber) {
      setDisplayValue(cardNumber);
    }
  };

  return (
    <FormField style={{ width: "400px" }} validationStatus={validationStatus}>
      <FormFieldLabel>Credit card number</FormFieldLabel>
      <Input
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder="5555-5555-5555-4444"
        bordered
      />
      <FormFieldHelperText
        aria-live={validationStatus ? "assertive" : "polite"}
        aria-atomic="true"
      >
        {validationMessage || defaultHelperText}
      </FormFieldHelperText>
    </FormField>
  );
};

export const Currency: StoryFn = () => {
  const [amount, setAmount] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [validationMessage, setValidationMessage] = useState("");
  const defaultHelperText = "Enter an amount (numbers only).";

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

  const handleValidation = (status: "error" | undefined, message: string) => {
    setValidationStatus(status);
    setValidationMessage(message);
  };

  const hasInvalidChars = (value: string) => /[^\d.,]/.test(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayValue(value);

    if (hasInvalidChars(value)) {
      handleValidation(
        "error",
        "Only numbers, periods, and commas are allowed.",
      );
    } else {
      handleValidation(undefined, "");
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);

    if (hasInvalidChars(value)) {
      handleValidation(
        "error",
        "Remove invalid characters—Only numbers, periods, and commas are allowed.",
      );
      return;
    }

    const cleaned = value.replace(/[^\d.]/g, "");

    if (cleaned.length === 0) {
      setDisplayValue("");
      handleValidation(undefined, "");
    } else if (validateCurrency(cleaned)) {
      const formatted = formatCurrency(cleaned);
      setDisplayValue(formatted);
      handleValidation(undefined, "");
    } else {
      handleValidation("error", "Please enter a valid amount.");
    }
  };

  const handleFocus = () => {
    if (amount) {
      setDisplayValue(amount);
    }
  };

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
      />
      <FormFieldHelperText
        aria-live={validationStatus ? "assertive" : "polite"}
        aria-atomic="true"
      >
        {validationMessage || defaultHelperText}
      </FormFieldHelperText>
    </FormField>
  );
};

export const PostalCode: StoryFn = () => {
  const [postalCode, setPostalCode] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [validationMessage, setValidationMessage] = useState("");
  const defaultHelperText = "Enter your postal code.";
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

  const handleValidation = (status: "error" | undefined, message: string) => {
    setValidationStatus(status);
    setValidationMessage(message);
  };

  const hasInvalidChars = (value: string) => /[^A-Z0-9\s]/.test(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const uppercase = value.toUpperCase();
    setDisplayValue(uppercase);

    if (hasInvalidChars(uppercase)) {
      handleValidation(
        "error",
        "Only letters, numbers, and spaces are allowed.",
      );
    } else {
      handleValidation(undefined, "");
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPostalCode(value);
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (hasInvalidChars(value)) {
      handleValidation(
        "error",
        "Remove invalid characters—Only letters, numbers, and spaces are allowed.",
      );
      return;
    }

    if (cleaned.length === 0) {
      setDisplayValue("");
      handleValidation(undefined, "");
    } else if (validatePostalCode(cleaned)) {
      const formatted = formatPostalCode(cleaned);
      setDisplayValue(formatted);
      handleValidation(undefined, "");
    } else {
      handleValidation(
        "error",
        "Please enter a valid postal code (e.g., 12345 or E14 5JP or SW1A 1AA).",
      );
    }
  };

  const handleFocus = () => {
    if (postalCode) {
      setDisplayValue(postalCode);
    }
  };

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
      />
      <FormFieldHelperText
        aria-live={validationStatus ? "assertive" : "polite"}
        aria-atomic="true"
      >
        {validationMessage || defaultHelperText}
      </FormFieldHelperText>
    </FormField>
  );
};
