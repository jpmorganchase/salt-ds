import { ReactElement } from "react";
import { Text, StackLayout, RadioButton } from "@salt-ds/core";

export const WithSecondaryLabel = (): ReactElement => {
  return (
    <RadioButton
      label={
        <StackLayout gap={0.25} align="start">
          <Text>This is a Primary text</Text>
          <Text color="secondary">This is a Secondary text</Text>
        </StackLayout>
      }
    />
  );
};
