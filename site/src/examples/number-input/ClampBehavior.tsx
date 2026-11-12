import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  NumberInput,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { useState } from "react";

export const ClampBehavior = () => {
  const [value, setValue] = useState<string>("2");
  const { announce } = useAriaAnnouncer();

  const min = 0;
  const max = 5;

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
      />
      <FormFieldHelperText>
        Enter a value between {min} and {max}.
      </FormFieldHelperText>
    </FormField>
  );
};
