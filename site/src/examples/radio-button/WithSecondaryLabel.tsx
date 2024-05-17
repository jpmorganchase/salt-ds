import { ReactElement } from "react";
import { Text, StackLayout, RadioButton } from "@salt-ds/core";

export const WithSecondaryLabel = (): ReactElement => {
  return (
    <RadioButton
      label={
        <StackLayout gap={0.25} align="start">
          <Text>Bonds</Text>
          <Text color="secondary">Debt securities</Text>
        </StackLayout>
      }
    />
  );
};
