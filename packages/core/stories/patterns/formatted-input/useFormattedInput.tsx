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

    if (hasInvalidChars(value)) {
      handleValidation("error", invalidCharMessage);
      setPreview("");
    } else {
      handleValidation(undefined, "");
      setPreview(generatePreview ? generatePreview(value) : "");
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (hasInvalidChars(value)) {
      handleValidation("error", invalidCharBlurMessage);
      setPreview("");
      return;
    }

    const normalized = normalizedValue(value);

    if (normalized.length === 0) {
      setDisplayValue("");
      handleValidation(undefined, "");
      setPreview("");
    } else if (validateNormalized(normalized)) {
      setDisplayValue(formatValue(normalized));
      handleValidation(undefined, "");
      setPreview("");
      if (warnCondition && warnCondition(normalized)) {
        handleValidation("warning", warnMessage ?? "");
      } else {
        handleValidation(
          successMessage ? "success" : undefined,
          successMessage ?? "",
        );
      }
    } else {
      handleValidation("error", invalidFormatMessage);
      setPreview("");
    }
  };

  const handleFocus = () => {
    if (inputValue) {
      setDisplayValue(inputValue);
      setPreview(generatePreview ? generatePreview(inputValue) : "");
    }
  };

  return {
    displayValue,
    validationStatus,
    validationMessage,
    preview,
    handleChange,
    handleBlur,
    handleFocus,
  };
}
