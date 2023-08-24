import { ReactElement } from "react";
import { H3, Text, GridLayout, Card } from "@salt-ds/core";

export const MultipleCards = (): ReactElement => {
  const exampleData = [
    {
      title: "Sustainable investing products",
      content:
        "We have a commitment to provide a wide range of investment solutions to enable you to align your financial goals to your values.",
    },
    {
      title: "Our expertise",
      content:
        "Our team of more than 200 experts in 28 offices worldwide is on hand to help you with your investment decisions.",
    },
    {
      title: "Market-leading insights",
      content:
        "Our award-winning strategists provide unique and regular insights about market events and current trends.",
    },
    {
      title: "Events",
      content:
        "We have a full calendar of online and in-person events with expert guest speakers for you to attend.",
    },
  ];
  return (
    <div
      style={{
        display: "grid",
        gap: "calc(2 * var(--salt-size-unit))",
        width: "400px",
      }}
    >
      <GridLayout style={{ maxWidth: "700px" }} rows={2} columns={2}>
        {exampleData.map((example, index) => {
          return (
            <Card key={index}>
              <H3>{example.title}</H3>
              <Text>{example.content}</Text>
            </Card>
          );
        })}
      </GridLayout>
    </div>
  );
};
