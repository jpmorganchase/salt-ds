import { ReactElement, useState, CSSProperties } from "react";
import {
  H3,
  Text,
  StackLayout,
  Card,
  RadioButtonGroup,
  RadioButton,
  Link,
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
        <StackLayout align="start">
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
      <RadioButtonGroup
        value={padding}
        onChange={(e) => setPadding(e.target.value)}
        direction="horizontal"
      >
        <RadioButton label="spacing-100" value="var(--salt-spacing-100)" />
        <RadioButton
          key="spacing-200"
          label="spacing-200 (default)"
          value="var(--salt-spacing-200)"
        />
        <RadioButton label="spacing-300" value="var(--salt-spacing-300)" />
      </RadioButtonGroup>
    </StackLayout>
  );
};
