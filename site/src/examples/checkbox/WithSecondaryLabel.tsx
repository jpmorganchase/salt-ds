import { ReactElement } from "react";
import { Checkbox, Text, StackLayout } from "@salt-ds/core";

export const WithSecondaryLabel = (): ReactElement => {
  return (
    <Checkbox
      label={
        <StackLayout gap={0.25} align="start">
          <Text>This is a Primary text</Text>
          <Text color="secondary">This is a Secondary text</Text>
        </StackLayout>
      }
    />
  );
};
