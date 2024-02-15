import { ReactElement, useState, ChangeEvent } from "react";
import {
  H3,
  Text,
  StackLayout,
  Card,
  CardProps,
  RadioButton,
  RadioButtonGroup,
  Link,
} from "@salt-ds/core";

export const Accent = (): ReactElement => {
  const [placement, setPlacement] = useState<CardProps["accent"]>("top");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPlacement(event.target.value as CardProps["accent"]);
  };

  return (
    <StackLayout style={{ width: "266px" }} align="center">
      <Card accent={placement} hoverable>
        <StackLayout>
          <StackLayout gap={1}>
            <H3>Sustainable investing products</H3>
            <Text>
              We have a commitment to provide a wide range of investment
              solutions to enable you to align your financial goals to your
              values.
            </Text>
          </StackLayout>
          <Link href="#" IconComponent={null}>
            Learn more
          </Link>
        </StackLayout>
      </Card>
      <RadioButtonGroup direction={"horizontal"} defaultValue="top">
        <RadioButton
          key="top"
          label="top"
          value="top"
          onChange={handleChange}
        />
        <RadioButton
          key="right"
          label="right"
          value="right"
          onChange={handleChange}
        />
        <RadioButton
          key="bottom"
          label="bottom"
          value="bottom"
          onChange={handleChange}
          checked
        />
        <RadioButton
          key="left"
          label="left"
          value="left"
          onChange={handleChange}
        />
      </RadioButtonGroup>
    </StackLayout>
  );
};
