import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  NumberInput,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { useEffect, useState } from "react";

export const ClampBehavior = () => {
  const [value, setValue] = useState<string>("2");
  const [focused, setFocused] = useState(false);
  const { announce } = useAriaAnnouncer();

  const min = 0;
  const max = 5;

  useEffect(() => {
    const draft = value.trim();
    const numberValue = Number(draft);
    if (
      !focused ||
      !draft ||
      draft.endsWith(".") ||
      !Number.isFinite(numberValue)
    ) {
      return;
    }

    let message = "";
    if (numberValue > max) {
      message = `${draft} is greater than the maximum value`;
    } else if (numberValue < min) {
      message = `${draft} is less than the minimum value`;
    } else if (numberValue === min) {
      message = "Minimum value reached";
    } else if (numberValue === max) {
      message = "Maximum value reached";
    }

    if (!message) return;

    // Wait for a pause in editing and cancel stale feedback on changes,
    // blur or unmount. Duration controls how long the message stays in the DOM.
    const timeout = window.setTimeout(() => {
      announce(message, { duration: 1000 });
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [announce, focused, value]);

  return (
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Number input with clamped range</FormFieldLabel>
      <NumberInput
        value={value}
        onChange={(event, newValue) => {
          const typed = Number(value);
          // onChange also runs when blur corrects a new draft back to the last
          // committed number, when onNumberChange would not run again.
          if (
            event?.type === "blur" &&
            (typed < min || typed > max) &&
            Number(newValue) !== typed
          ) {
            announce(
              `${typed} is outside the range ${min} to ${max}, so the value was set to ${newValue}`,
              { duration: 1000 },
            );
          }
          setValue(newValue);
        }}
        clamp
        max={max}
        min={min}
        inputProps={{
          onFocus: () => setFocused(true),
          onBlur: () => setFocused(false),
        }}
      />
      <FormFieldHelperText>
        Enter a value between {min} and {max}.
      </FormFieldHelperText>
    </FormField>
  );
};
