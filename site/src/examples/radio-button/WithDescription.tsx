import { ReactElement } from "react";
import {
  Text,
  StackLayout,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";

export const WithDescription = (): ReactElement => {
  return (
    <RadioButtonGroup name="region">
      <RadioButton
        value="namr"
        label={
          <StackLayout gap={0.5} align="start">
            <Text>NAMR</Text>
            <Text color="secondary">North America</Text>
          </StackLayout>
        }
      />
      <RadioButton
        value="apac"
        label={
          <StackLayout gap={0.5} align="start">
            <Text>APAC</Text>
            <Text color="secondary">Asia–Pacific</Text>
          </StackLayout>
        }
      />
      <RadioButton
        value="emea"
        label={
          <StackLayout gap={0.5} align="start">
            <Text>EMEA</Text>
            <Text color="secondary">Europe, Middle East, and Africa</Text>
          </StackLayout>
        }
      />
    </RadioButtonGroup>
  );
};
