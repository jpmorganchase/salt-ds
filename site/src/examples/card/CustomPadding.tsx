import { ReactElement, useState, ChangeEvent } from "react";
import {
  H3,
  Text,
  StackLayout,
  Card,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";

export const CustomPadding = (): ReactElement => {
  const [padding, setPadding] = useState<string>("var(--salt-spacing-200)");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPadding(event.target.value);
  };

  return (
    <StackLayout align="center">
      <Card
        style={
          {
            "--saltCard-padding": padding,
            width: "260px",
          } as React.CSSProperties
        }
      >
        <img
          src="/img/examples/cardExample.jpeg"
          style={{
            paddingBottom: padding,
            width: "100%",
          }}
        />
        <StackLayout
          gap={1}
          // Apply padding around the content below the image for a full width image
          style={{ padding: padding == "0" ? "var(--salt-spacing-200)" : 0 }}
        >
          <H3>Sustainable investing products</H3>
          <Text>
            We have a commitment to provide a wide range of investment solutions
            to enable you to align your financial goals to your values.
          </Text>
        </StackLayout>
      </Card>
      <RadioButtonGroup
        direction={"horizontal"}
        defaultValue="var(--salt-spacing-200)"
      >
        <RadioButton
          key="default"
          label="default"
          value="var(--salt-spacing-200)"
          onChange={handleChange}
        />
        <RadioButton
          key="spacing-300"
          label="spacing-300"
          value="var(--salt-spacing-300)"
          onChange={handleChange}
        />
        <RadioButton
          key="spacing-100"
          label="spacing-100"
          value="var(--salt-spacing-100)"
          onChange={handleChange}
        />
        <RadioButton
          key="fullWidthImage"
          label="full width image"
          value="0"
          onChange={handleChange}
        />
      </RadioButtonGroup>
    </StackLayout>
  );
};
