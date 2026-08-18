import {
  Button,
  Card,
  CardContent,
  Display3,
  FlowLayout,
  H3,
  LinkCard,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { MessageIcon } from "@salt-ds/icons";
import { type CSSProperties, type ReactElement, useState } from "react";

export const CustomPadding = (): ReactElement => {
  const [padding, setPadding] = useState("spacing-200");

  return (
    <StackLayout align="center">
      {padding === "spacing-100" && (
        <LinkCard
          href="#"
          style={
            {
              "--saltCardContent-padding": "var(--salt-spacing-100)",
              width: "160px",
            } as CSSProperties
          }
        >
          <CardContent>
            <StackLayout gap={1} direction="row" align="center">
              <MessageIcon size={1} aria-hidden />
              <Text>Contact us</Text>
            </StackLayout>
          </CardContent>
        </LinkCard>
      )}
      {padding === "spacing-200" && (
        <Card
          style={
            {
              "--saltCardContent-padding": "var(--salt-spacing-200)",
              width: "260px",
            } as CSSProperties
          }
        >
          <CardContent>
            <StackLayout gap={1}>
              <H3 style={{ margin: 0 }}>Sustainable investing products</H3>
              <Text>
                We have a commitment to provide a wide range of investment
                solutions to enable you to align your financial goals to your
                values.
              </Text>
            </StackLayout>
          </CardContent>
        </Card>
      )}
      {padding === "spacing-300" && (
        <Card
          style={
            {
              "--saltCardContent-padding": "var(--salt-spacing-300)",
              width: "500px",
            } as CSSProperties
          }
        >
          <CardContent>
            <StackLayout>
              <StackLayout direction="row" align="end" gap={1}>
                <H3 style={{ margin: 0 }}>Threshold Summary</H3>
                <Text variant="secondary">(Projected Revenue)</Text>
              </StackLayout>
              <FlowLayout gap={3}>
                <StackLayout gap={0}>
                  <Text>Below Threshold 1</Text>
                  <Display3>$1,000,000</Display3>
                </StackLayout>
                <StackLayout gap={0}>
                  <Text>Below Threshold 1 & 2</Text>
                  <Display3>$450,000</Display3>
                </StackLayout>
                <StackLayout gap={0}>
                  <Text>Below Threshold 2 & 3</Text>
                  <Display3>$0</Display3>
                </StackLayout>
              </FlowLayout>

              <StackLayout direction="row" gap={1}>
                <Button>Cancel</Button>
                <Button sentiment="accented">Update tier</Button>
              </StackLayout>
            </StackLayout>
          </CardContent>
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
