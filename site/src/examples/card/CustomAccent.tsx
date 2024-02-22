import { ReactElement, CSSProperties } from "react";
import { H3, Text, StackLayout, Card } from "@salt-ds/core";

export const CustomAccent = (): ReactElement => {
  return (
    <StackLayout direction="row">
      <Card
        style={
          {
            "--saltCard-accentColor": "rgb(70, 118, 191)",
            "--saltCard-accentColor-hover": "rgb(35, 77, 140)",
            width: "240px",
          } as CSSProperties
        }
        accent="top"
        hoverable
      >
        <StackLayout gap={1}>
          <H3>Investment Compliance</H3>
          <Text>
            Exception-based reporting that highlights potential warnings or
            violations of investment guidelines and regulations.
          </Text>
        </StackLayout>
      </Card>
      <Card
        style={
          {
            "--saltCard-accentColor": "rgb(171, 101, 40)",
            "--saltCard-accentColor-hover": "rgb(133, 72, 20)",
            width: "240px",
          } as CSSProperties
        }
        accent="top"
        hoverable
      >
        <StackLayout gap={1}>
          <H3>S&P Global Market Intelligence</H3>
          <Text>
            Automate transmission of bank loan settlement instructions.
          </Text>
        </StackLayout>
      </Card>
    </StackLayout>
  );
};
