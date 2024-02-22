import { ReactElement } from "react";
import { Card, H3, Text, Link, StackLayout, Button } from "@salt-ds/core";

export const Actions = (): ReactElement => {
  return (
    <StackLayout direction={"row"} align="start">
      <Card style={{ width: "260px" }} accent="top">
        <StackLayout align="start">
          <StackLayout gap={1}>
            <H3>Sustainable investing products</H3>
            <Text>
              We have a commitment to provide a wide range of investment
              solutions to enable you to align your financial goals to your
              values.
            </Text>
          </StackLayout>
          <Button>Learn more</Button>
        </StackLayout>
      </Card>
      <Card style={{ width: "260px" }} accent="top">
        <StackLayout align="start">
          <StackLayout gap={1}>
            <H3>Climate change</H3>
            <Text>
              Climate factors represent the biggest source of risk and
              opportunity for investors in the decades to come.
            </Text>
          </StackLayout>
          <Link href="#" IconComponent={null}>
            See our approach
          </Link>
        </StackLayout>
      </Card>
    </StackLayout>
  );
};
