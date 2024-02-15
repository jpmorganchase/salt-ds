import { ReactElement, useState, CSSProperties } from "react";
import {
  H3,
  Text,
  StackLayout,
  Card,
  RadioButtonGroup,
  RadioButton,
} from "@salt-ds/core";

export const CustomPadding = (): ReactElement => {
  const [padding, setPadding] = useState("var(--salt-spacing-200)");

  return (
    <StackLayout align="center">
      <Card
        style={
          { "--saltCard-padding": padding, width: "260px" } as CSSProperties
        }
      >
        <img
          src="/img/examples/cardExample.jpg"
          style={{ width: "100%", paddingBottom: padding }}
        />
        <StackLayout
          gap={1}
          // Apply padding around the content below the image for a full width image
          style={{
            padding: padding === "0" ? "var(--salt-spacing-200)" : undefined,
          }}
        >
          <H3>Sustainable investing products</H3>
          <Text>
            Investment solutions to align your financial goals with your values.
          </Text>
        </StackLayout>
      </Card>
      <RadioButtonGroup
        value={padding}
        onChange={(e) => setPadding(e.target.value)}
        direction="horizontal"
      >
        <RadioButton label="default" value="var(--salt-spacing-200)" />
        <RadioButton label="spacing-300" value="var(--salt-spacing-300)" />
        <RadioButton label="spacing-100" value="var(--salt-spacing-100)" />
        <RadioButton label="full width image" value="0" />
      </RadioButtonGroup>
    </StackLayout>
  );
};
