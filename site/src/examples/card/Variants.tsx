import { ReactElement, ChangeEvent, useState } from "react";
import {
  Card,
  CardProps,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
} from "@salt-ds/core";

export const Variants = (): ReactElement => {
  const [variant, setVariant] = useState<CardProps["variant"]>("primary");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVariant(event.target.value as CardProps["variant"]);
  };

  return (
    <StackLayout style={{ width: "266px" }} align="center">
      <Card
        variant={variant}
        style={{ width: "260px", height: "144px" }}
      ></Card>
      <RadioButtonGroup direction={"horizontal"} defaultValue="primary">
        <RadioButton
          key="primary"
          label="Primary"
          value="primary"
          onChange={handleChange}
          checked
        />
        <RadioButton
          key="secondary"
          label="Secondary"
          value="secondary"
          onChange={handleChange}
        />
      </RadioButtonGroup>
    </StackLayout>
  );
};
