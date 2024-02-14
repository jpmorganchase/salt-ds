import { ReactElement, ChangeEvent, useState } from "react";
import {
  Card,
  CardProps,
  H3,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
} from "@salt-ds/core";

export const Variants = (): ReactElement => {
  const [variant, setVariant] = useState<CardProps["variant"]>("primary");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVariant(event.target.value as CardProps["variant"]);
  };

  return (
    <StackLayout style={{ width: "266px" }} align="center">
      <Card variant={variant} hoverable>
        <StackLayout gap={1}>
          <H3>Sustainable investing products</H3>
          <Text>
            We have a commitment to provide a wide range of investment solutions
            to enable you to align your financial goals to your values.
          </Text>
        </StackLayout>
      </Card>
      <RadioButtonGroup direction={"horizontal"} defaultValue="primary">
        <RadioButton
          key="primary"
          label="primary"
          value="primary"
          onChange={handleChange}
          checked
        />
        <RadioButton
          key="secondary"
          label="secondary"
          value="secondary"
          onChange={handleChange}
        />
      </RadioButtonGroup>
    </StackLayout>
  );
};
