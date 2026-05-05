import {
  Button,
  FormField,
  FormFieldLabel,
  StackLayout,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const ClearSelection = (): ReactElement => {
  const [value, setValue] = useState<number>(3);
  const { announce } = useAriaAnnouncer();

  return (
    <StackLayout direction="row" align="end" gap={1}>
      <FormField>
        <FormFieldLabel>Rating</FormFieldLabel>
        <Rating
          value={value}
          onChange={(_event, newValue) => {
            setValue(newValue);
          }}
        />
      </FormField>
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={() => {
          setValue(0);
          announce("Rating was cleared");
        }}
        aria-label="Clear rating"
      >
        Clear
      </Button>
    </StackLayout>
  );
};
