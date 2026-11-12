import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
  Text,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { type ChangeEvent, useRef, useState } from "react";

type Status = "error" | "warning" | "success" | undefined;

const INVALID_CHARACTERS = /[^0-9()\s+-]/;
const digitsOf = (value: string) => value.replace(/\D/g, "");
const isValid = (digits: string) => digits.length === 11;
const hasUnusualAreaCode = (digits: string) =>
  Number.parseInt(digits.slice(1, 4), 10) < 100;
const formatPhoneNumber = (digits: string) =>
  `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;

export const PhoneNumber = () => {
  // What the user typed, shown while they edit and again when they come back.
  const [typed, setTyped] = useState("");
  // What the field shows: what they typed while focused, formatted after blur.
  const [displayValue, setDisplayValue] = useState("");
  // The digits to submit, set only from a valid entry.
  const [submitValue, setSubmitValue] = useState("");
  const [status, setStatus] = useState<Status>(undefined);
  const [message, setMessage] = useState("");
  const { announce } = useAriaAnnouncer();
  const lastError = useRef("");

  const showStatus = (newStatus: Status, newMessage: string) => {
    setStatus(newStatus);
    setMessage(newMessage);
    // Announce an error once when it appears, not on every keystroke.
    if (newStatus === "error" && newMessage !== lastError.current) {
      announce(newMessage, { ariaLive: "assertive" });
    }
    lastError.current = newStatus === "error" ? newMessage : "";
  };

  // 1. While the user types, leave their value alone; flag invalid characters.
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTyped(value);
    setDisplayValue(value);
    if (INVALID_CHARACTERS.test(value)) {
      showStatus("error", "Only numbers and () + - are allowed.");
    } else {
      showStatus(undefined, "");
    }
  };

  // 2. When the user leaves the field, validate and format what they typed.
  const handleBlur = () => {
    if (INVALID_CHARACTERS.test(typed)) {
      showStatus(
        "error",
        "Remove letters and symbols—Only numbers and () + - are allowed.",
      );
      return;
    }
    const digits = digitsOf(typed);
    if (digits.length === 0) {
      setTyped("");
      setDisplayValue("");
      setSubmitValue("");
      showStatus(undefined, "");
    } else if (isValid(digits)) {
      setSubmitValue(digits);
      setDisplayValue(formatPhoneNumber(digits));
      if (hasUnusualAreaCode(digits)) {
        showStatus(
          "warning",
          "The phone number entered is valid, but the area code appears to be unusual.",
        );
      } else {
        showStatus("success", "Phone number is valid.");
      }
    } else {
      showStatus(
        "error",
        "Please enter a valid US phone number: country code (1) + area code + number.",
      );
    }
  };

  // 3. When the user comes back to the field, show what they typed again,
  // not the formatted value, so they can carry on from their own input.
  const handleFocus = () => {
    showStatus(undefined, "");
    if (typed.length > 0) {
      setDisplayValue(typed);
    } else if (submitValue.length > 0) {
      setDisplayValue(formatPhoneNumber(submitValue));
    }
  };

  return (
    <StackLayout gap={2} style={{ width: "300px" }}>
      <FormField validationStatus={status}>
        <FormFieldLabel>Phone number</FormFieldLabel>
        <Input
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="+1 (000) 000-0000"
          bordered
          inputProps={{
            "aria-invalid": status === "error" ? true : undefined,
            autoComplete: "tel",
          }}
        />
        <FormFieldHelperText>
          {message || "Enter a US phone number, e.g. +1 (555) 000-0000."}
        </FormFieldHelperText>
      </FormField>
      {submitValue.length > 0 && (
        <Text color="secondary" styleAs="label">
          Value for submission: <b>{submitValue}</b>
        </Text>
      )}
    </StackLayout>
  );
};
