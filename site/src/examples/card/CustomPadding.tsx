import { ReactElement, useState, CSSProperties } from "react";
import {
  H3,
  Text,
  StackLayout,
  Card,
  RadioButtonGroup,
  RadioButton,
  Link,
  Button,
} from "@salt-ds/core";

export const CustomPadding = (): ReactElement => {
  const [padding, setPadding] = useState("spacing-200");

  return (
    <StackLayout align="center">
      {padding === "spacing-100" && (
        <Card
          style={
            {
              "--saltCard-padding": "var(--salt-spacing-100)",
              width: "160px",
            } as CSSProperties
          }
        >
          <RadioButton label="Pay on another day" />
        </Card>
      )}
      {padding === "spacing-200" && (
        <Card
          style={
            {
              "--saltCard-padding": "var(--salt-spacing-200)",
              width: "260px",
            } as CSSProperties
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
              Explore
            </Link>
          </StackLayout>
        </Card>
      )}
      {padding === "spacing-300" && (
        <Card
          style={
            {
              "--saltCard-padding": "var(--salt-spacing-300)",
              width: "380px",
            } as CSSProperties
          }
        >
          <StackLayout align="start">
            <StackLayout gap={1}>
              <H3>Global dashboard</H3>
              <Text>
                A selection of analyses based on supply chain-related news,
                company and trade data sets. As well as stock level exposure to
                the supply chain theme using a range of proprietary Natural
                Language Processing tools.
              </Text>
            </StackLayout>
            <Button>Learn more</Button>
          </StackLayout>
        </Card>
      )}
      <RadioButtonGroup
        value={padding}
        onChange={(e) => setPadding(e.target.value)}
        direction="horizontal"
      >
        <RadioButton label="spacing-100" value="spacing-100" />
        <RadioButton
          key="spacing-200"
          label="spacing-200 (default)"
          value="spacing-200"
        />
        <RadioButton label="spacing-300" value="spacing-300" />
      </RadioButtonGroup>
    </StackLayout>
  );
};
