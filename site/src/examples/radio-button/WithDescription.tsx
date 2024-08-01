import {
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const WithDescription = (): ReactElement => {
  return (
    <RadioButtonGroup name="region">
      <RadioButton
        value="namr"
        label={
          <StackLayout gap={0.5} align="start">
            <Text>NAMR</Text>
            <Text color="secondary" styleAs="label">
              North America
            </Text>
          </StackLayout>
        }
      />
      <RadioButton
        value="apac"
        label={
          <StackLayout gap={0.5} align="start">
            <Text>APAC</Text>
            <Text color="secondary" styleAs="label">
              Asia–Pacific
            </Text>
          </StackLayout>
        }
      />
      <RadioButton
        value="emea"
        label={
          <StackLayout gap={0.5} align="start">
            <Text>EMEA</Text>
            <Text color="secondary" styleAs="label">
              Europe, Middle East, and Africa
            </Text>
          </StackLayout>
        }
      />
    </RadioButtonGroup>
  );
};
