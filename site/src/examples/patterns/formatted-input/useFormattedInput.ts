import { useAriaAnnouncer } from "@salt-ds/core";
import { type ChangeEvent, useRef, useState } from "react";

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
  const [editingValue, setEditingValue] = useState("");
  const [preview, setPreview] = useState("");
  const [validationStatus, setValidationStatus] = useState<
    "error" | "warning" | "success" | undefined
  >(undefined);
  const [validationMessage, setValidationMessage] = useState("");
  const { announce } = useAriaAnnouncer();
  // Track last announced error to avoid spamming the live region on every keystroke.
  const lastAnnouncedErrorRef = useRef<string>("");

  const handleValidation = (
    status: "error" | "warning" | "success" | undefined,
    message: string,
  ) => {
    setValidationStatus(status);
    setValidationMessage(message);
    if (message && status === "error") {
      // Only announce on transition into a new error message so the assertive
      // live region isn't re-triggered on every keystroke while the same
      // error is already showing.
      if (lastAnnouncedErrorRef.current !== message) {
        lastAnnouncedErrorRef.current = message;
        announce(message, { ariaLive: "assertive" });
      }
    } else {
      lastAnnouncedErrorRef.current = "";
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = transformOnChange
      ? transformOnChange(e.target.value)
      : e.target.value;
    setDisplayValue(value);
    // Preserve the user's raw editing value so we can restore it on re-focus
    // (spec: "revert the input to the original value the user typed").
    setEditingValue(value);

    if (hasInvalidChars(value)) {
      setPreview("");
      handleValidation("error", invalidCharMessage);
    } else {
      handleValidation(undefined, "");
      setPreview(generatePreview ? generatePreview(value) : "");
    }
  };

  const handleBlur = () => {
    setPreview("");

    // Validate the user's raw input, not the formatted display value, so
    // characters that formatValue itself introduces (e.g. spaces, hyphens,
    // parentheses) can never cause a previously accepted value to fail
    // hasInvalidChars on a subsequent blur.
    const valueToCheck = editingValue || displayValue;

    if (hasInvalidChars(valueToCheck)) {
      // Do NOT overwrite inputValue with the invalid raw value; inputValue is
      // the canonical submission value and should only reflect a valid entry.
      handleValidation("error", invalidCharBlurMessage);
      return;
    }

    const normalized = normalizedValue(valueToCheck);

    if (normalized.length === 0) {
      setInputValue("");
      setDisplayValue("");
      // Drop any stale editing value so a subsequent focus doesn't restore
      // text the user has just cleared.
      setEditingValue("");
      handleValidation(undefined, "");
    } else if (validateNormalized(normalized)) {
      setInputValue(normalized);
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
    if (editingValue.length > 0) {
      setDisplayValue(editingValue);
      setPreview(generatePreview ? generatePreview(editingValue) : "");
    } else if (inputValue.length > 0) {
      // Fallback when the field was hydrated externally (e.g. server-rendered
      // canonical value) without an editing value: surface the formatted form
      // so the user sees a readable string, not the raw normalized value.
      const formatted = formatValue(inputValue);
      setDisplayValue(formatted);
      setPreview(generatePreview ? generatePreview(formatted) : "");
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
