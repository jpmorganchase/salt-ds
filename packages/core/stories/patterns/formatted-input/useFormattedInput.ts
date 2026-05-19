import { useAriaAnnouncer } from "@salt-ds/core";
import { type ChangeEvent, type FocusEvent, useState } from "react";

interface UseFormattedInputOptions {
  formatValue: (cleaned: string) => string;
  normalizedValue: (value: string) => string;
  validateNormalized: (cleaned: string) => boolean;
  hasInvalidChars: (value: string) => boolean;
  invalidCharMessage: string;
  invalidCharBlurMessage: string;
  invalidFormatMessage: string;
  transformOnChange?: (value: string) => string;
  warnCondition?: (cleaned: string) => boolean;
  warnMessage?: string;
  successMessage?: string;
  generatePreview?: (value: string) => string;
}

export function useFormattedInput(options: UseFormattedInputOptions) {
  const {
    formatValue,
    normalizedValue,
    validateNormalized,
    hasInvalidChars,
    invalidCharMessage,
    invalidCharBlurMessage,
    invalidFormatMessage,
    transformOnChange,
    warnCondition,
    warnMessage,
    successMessage,
    generatePreview,
  } = options;

  const [inputValue, setInputValue] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [preview, setPreview] = useState("");
  const [validationStatus, setValidationStatus] = useState<
    "error" | "warning" | "success" | undefined
  >(undefined);
  const [validationMessage, setValidationMessage] = useState("");
  const { announce } = useAriaAnnouncer();

  const handleValidation = (
    status: "error" | "warning" | "success" | undefined,
    message: string,
  ) => {
    setValidationStatus(status);
    setValidationMessage(message);
    if (message && status === "error") {
      announce(message, { ariaLive: "assertive" });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = transformOnChange
      ? transformOnChange(e.target.value)
      : e.target.value;
    setDisplayValue(value);
    setPreview("");

    if (hasInvalidChars(value)) {
      handleValidation("error", invalidCharMessage);
    } else {
      handleValidation(undefined, "");
      if (generatePreview) {
        setPreview(generatePreview(value));
      }
    }
  };

  const handleBlur = (_e: FocusEvent<HTMLInputElement>) => {
    const value = displayValue;
    setPreview("");

    if (hasInvalidChars(value)) {
      setInputValue(value);
      handleValidation("error", invalidCharBlurMessage);
      return;
    }

    const normalized = normalizedValue(value);
    setInputValue(normalized);

    if (normalized.length === 0) {
      setDisplayValue("");
      handleValidation(undefined, "");
    } else if (validateNormalized(normalized)) {
      setDisplayValue(formatValue(normalized));
      if (warnCondition?.(normalized)) {
        handleValidation("warning", warnMessage ?? "");
      } else {
        handleValidation(
          successMessage ? "success" : undefined,
          successMessage ?? "",
        );
      }
    } else {
      handleValidation("error", invalidFormatMessage);
    }
  };

  const handleFocus = () => {
    handleValidation(undefined, "");
    if (inputValue.length > 0) {
      setDisplayValue(inputValue);
      setPreview(generatePreview ? generatePreview(inputValue) : "");
    }
  };

  return {
    displayValue,
    inputValue,
    validationStatus,
    validationMessage,
    preview,
    handleChange,
    handleBlur,
    handleFocus,
  };
}
