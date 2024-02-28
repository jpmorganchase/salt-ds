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

export const Accents = () => {
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
        </StackLayout>
      </Card>
      <RadioButtonGroup
        value={placement}
        onChange={(event) =>
          setPlacement(event.target.value as CardProps["accent"])
        }
        direction="horizontal"
      >
        <RadioButton label="Top" value="top" key="top" />
        <RadioButton label="Right" value="right" key="right" />
        <RadioButton label="Bottom" value="bottom" key="bottom" />
        <RadioButton label="Left" value="left" key="left" />
      </RadioButtonGroup>
    </StackLayout>
  );
};
