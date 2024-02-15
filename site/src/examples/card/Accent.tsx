import { useState } from "react";
import {
  H3,
  Text,
  StackLayout,
  Card,
  CardProps,
  RadioButtonGroup,
  RadioButton,
  Link,
} from "@salt-ds/core";

export const Accent = () => {
  const [placement, setPlacement] = useState<CardProps["accent"]>("top");

  return (
    <StackLayout style={{ width: "266px" }} align="center">
      <Card accent={placement} hoverable>
        <StackLayout gap={1} align="start">
          <H3>Sustainable investing products</H3>
          <Text>
            We have a commitment to provide a wide range of investment solutions
            to enable you to align your financial goals to your values.
          </Text>
          <Link href="#">Learn more</Link>
        </StackLayout>
      </Card>
      <RadioButtonGroup
        value={placement}
        onChange={(e) => setPlacement(e.target.value as CardProps["accent"])}
        direction="horizontal"
      >
        <RadioButton label="top" value="top" />
        <RadioButton label="right" value="right" />
        <RadioButton label="bottom" value="bottom" />
        <RadioButton label="left" value="left" />
      </RadioButtonGroup>
    </StackLayout>
  );
};
